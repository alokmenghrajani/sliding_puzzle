/**
 * Code based on https://www.python2.net/questions-336875.htm which might
 * have been based on https://freesoft.dev/program/153351919 and
 * https://github.com/wesleycho/confetti.js.
 *
 * I removed parts of the code I didn't need and made some minor refactor.
 */

class Confetti {
	static frameInterval = 15;	//the confetti animation frame interval in milliseconds
	static colors = ["rgb(30,144,255)", "rgba(107,142,35)", "rgba(255,215,0)", "rgba(255,192,203)", "rgba(106,90,205)", "rgba(173,216,230)", "rgba(238,130,238)", "rgba(152,251,152)", "rgba(70,130,180)", "rgba(244,164,96)", "rgba(210,105,30)", "rgba(220,20,60)"];

	constructor(target, difficulty) {
		this.isRunning = false;
		this.particles = [];
		this.waveAngle = 0;
		this.context = null;
		this.count = 0;
	}

	reset(particle, width, height) {
		particle.color = Confetti.colors[(Math.random() * Confetti.colors.length)|0];
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = Math.random() * Math.PI;
		return particle;
	}

	go() {
		if (this.particles.length == 0) {
			this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
		} else {
			this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
			this.update();
			this.draw(this.context);
			window.requestAnimationFrame(() => this.go());
		}
	}

	start(timeout) {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const canvas = document.createElement("canvas");
		canvas.setAttribute("id", "confetti-canvas");
		canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
		document.body.prepend(canvas);
		canvas.width = width;
		canvas.height = height;
		window.addEventListener("resize", function() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}, true);
		this.context = canvas.getContext("2d");
		this.count = Math.sqrt(canvas.width * canvas.height) / 4;

		while (this.particles.length < this.count) {
			this.particles.push(this.reset({}, width, height));
		}
		this.isRunning = true;
		this.go();
		if (timeout) {
			window.setTimeout(() => this.isRunning = false, timeout);
		}
	}

	draw(context) {
		for (let i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			const x2 = particle.x + particle.tilt;
			const x = x2 + particle.diameter / 2;
			const y2 = particle.y + particle.tilt + particle.diameter / 2;
			context.strokeStyle = particle.color;
			context.moveTo(x, particle.y);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}

	update() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.waveAngle += 0.01;
		for (let i = 0; i < this.particles.length; i++) {
			let particle = this.particles[i];
			if (!this.isRunning && particle.y < -15) {
				particle.y = height + 100;
			} else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(this.waveAngle) - 0.5;
				particle.y += (Math.cos(this.waveAngle) + particle.diameter + 2) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if (this.isRunning && this.particles.length <= this.count) {
					this.reset(particle, width, height);
				} else {
					this.particles.splice(i, 1);
					i--;
				}
			}
		}
	}
}

module.exports = Confetti
