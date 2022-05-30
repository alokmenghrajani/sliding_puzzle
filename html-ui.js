const positiveMod = require('./utils.js');

/**
 * Code to create html nodes and handle interaction via mouse/touch gestures.
 */
class HtmlUI {
  constructor(puzzle, board, goal) {
    this.puzzle = puzzle;
    this.board = board;
    this.goal = goal;
    this.dragging = null;
    this.dragStart = [0, 0];

    // Setup colormap. Letters map to arbitrary colors, numbers map to a
    // gradient.
    this.colorMap = {"A": "#f44", "B": "#4f4"};
    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        const n = 1 + i * 4 + j;
        const d = Math.sqrt((4-i)*(4-i) + (4-j)*(4-j)) / Math.sqrt(32);
        const red = 0x00 + (0xe0 - 0x00) * d;
        const green = 0x40 + (0xe0 - 0x40) * d;
        const blue = 0x70 + (0xe0 - 0x70) * d;
        const color = 'rgba(' + [red, green, blue].join() + ")";
        this.colorMap[n] = color;
      }
    }

    this.createGrid();
    this.createGoal();
  }

  createGrid() {
    this.offsets = {}; // tracks divs => offsets
    this.divs = {}; // tracks offsets => divs

    const r = [];
    // We add cells in the [-4, 8) range to make wrapping easier.
    for (let i=-4; i<8; i++) {
      for (let j=-4; j<8; j++) {
        r.push(this.createCell(i, j, this.puzzle.state[positiveMod(j, 4)][positiveMod(i, 4)]));
      }
    }
    this.board.replaceChildren(...r);
    document.onmousemove = (ev) => this.handleMove(ev);
    document.onmouseup = (ev) => this.handleEnd(ev);
    document.ontouchmove = (ev) => this.handleMove(ev);
    document.ontouchend = (ev) => this.handleEnd(ev);
  }

  createCell(x, y, label) {
    const div = document.createElement("div");
    div.innerText = label;
    div.style.left = this.offsetToPercentage(x);
    div.style.top = this.offsetToPercentage(y);
    div.style.backgroundColor = this.colorMap[label];
    div.id = "cell_" + this.offsetToStr(x, y);

    // UI events
    div.onmousedown = (ev) => this.handleStart(ev);
    div.ontouchstart = (ev) => this.handleStart(ev);

    this.offsets[div.id] = [x, y];
    this.divs[this.offsetToStr(x, y)] = div;
    return div;
  }

  offsetToPercentage(n) {
    return (n * 100 / 4) + "%";
  }

  offsetToStr(x, y) {
    return x * 100 + y;
  }

  createGoal() {
    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        this.createGoalCell(i, j, this.puzzle.target[i][j])
      }
    }
  }

  createGoalCell(x, y, label) {
    const div = document.createElement("div");
    div.innerText = label;
    div.style.left = this.offsetToPercentage(x);
    div.style.top = this.offsetToPercentage(y);
    div.style.backgroundColor = this.colorMap[label];
    this.goal.appendChild(div);
  }

  handleStart(ev) {
    if (this.dragging != null) {
      // We got a handleStart while already dragging. This can happen in various
      // edge cases. The easiest is to ignore the event (TODO: figure out if
      // it's better to call abort() and then handle the new event?)
      console.log("handleStart while dragging");
      return false;
    }

    if (this.puzzle.done()) {
      // Disallow making moves once the puzzle is solved.
      return false;
    }

    this.dragging = ev.srcElement;

    // record element's starting position
    const r = board.getBoundingClientRect();
    const x = ev.clientX || ev.targetTouches[0].pageX;
    const y = ev.clientY || ev.targetTouches[0].pageY;

    this.dragStart = [x - r.x, y - r.y];

    console.log("handleStart called");
  }

  handleMove(ev) {
    if (this.dragging == null) {
      return false;
    }

    // calculate how much the mouse has moved from it's initial position
    // assumption: all 4 borders have the same width.
    const eventX = ev.clientX || ev.targetTouches[0].pageX;
    const eventY = ev.clientY || ev.targetTouches[0].pageY;
    const r = this.board.getBoundingClientRect();
    const border = (this.board.offsetWidth - this.board.clientWidth) / 2;
    // TODO: check if it's board's border or div's border that we care about
    // here? Remember, div's border depends on window size.
    // TODO: we are assuming the border is the same on all 4 sides.

    const x = eventX - r.x - border;
    const y = eventY - r.y - border;
    let deltaX = x - this.dragStart[0];
    let deltaY = y - this.dragStart[1];

    // Prevent dragging too far in any direction
    const maxX = this.offsetToX(3.2);
    if (deltaX > maxX) {
      deltaX = maxX;
    }
    if (deltaX < -maxX) {
      deltaX = -maxX;
    }
    const maxY = this.offsetToY(3.2);
    if (deltaY > maxY) {
      deltaY = maxY;
    }
    if (deltaY < -maxY) {
      deltaY = -maxY;
    }

    // reset the nodes since we might be switching from dragging horizontally to
    // vertically or vice-versa.
    this.resetNodes();

    // figure out which axis we are dragging on
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Grab all the nodes which need to move
      const rows = this.puzzle.rowColPair(this.offsets[this.dragging.id][1]);
      const nodes = rows.flatMap(row => this.findHorzNodes(row));
      nodes.forEach(el => {
        // TODO: would be cleaner to use percentages. It doesn't matter much as
        // we rebuild the grid at the end of the grad event.
        el.style.left = this.offsetToX(this.offsets[el.id][0]) + deltaX;
      });
    } else {
      // Grab all the nodes on the same column
      const cols = this.puzzle.rowColPair(this.offsets[this.dragging.id][0]);
      const nodes = cols.flatMap(col => this.findVertNodes(col));
      nodes.forEach(el => {
        // TODO: would be cleaner to use percentages. It doesn't matter much as
        // we rebuild the grid at the end of the grad event.
        el.style.top = this.offsetToY(this.offsets[el.id][1]) + deltaY;
      });
    }
  }

  handleEnd(ev) {
    if (this.dragging == null) {
      console.log("handleEnd while not dragging");
      return false;
    }

    // TODO: refactor with above

    // calculate how much the mouse has moved from it's initial position
    // assumption: all 4 borders have the same width.
    const eventX = ev.clientX || ev.targetTouches[0].pageX;
    const eventY = ev.clientY || ev.targetTouches[0].pageY;
    const r = this.board.getBoundingClientRect();
    const border = (this.board.offsetWidth - this.board.clientWidth) / 2;
    // TODO: check if it's board's border or div's border that we care about
    // here? Remember, div's border depends on window size.
    // TODO: we are assuming the border is the same on all 4 sides.

    const x = eventX - r.x - border;
    const y = eventY - r.y - border;
    let deltaX = x - this.dragStart[0];
    let deltaY = y - this.dragStart[1];

    // Prevent dragging too far in any direction
    const maxX = this.offsetToX(3.2);
    if (deltaX > maxX) {
      deltaX = maxX;
    }
    if (deltaX < -maxX) {
      deltaX = -maxX;
    }
    const maxY = this.offsetToY(3.2);
    if (deltaY > maxY) {
      deltaY = maxY;
    }
    if (deltaY < -maxY) {
      deltaY = -maxY;
    }

    // reset the nodes since we might be switching from dragging horizontally to
    // vertically or vice-versa.
    this.resetNodes();

    // figure out which axis we are dragging on
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // round deltaX
      const border = (this.board.offsetWidth - this.board.clientWidth);
      // TODO: check if it's board's border or div's border that we care about
      // here?
      const r = this.board.getBoundingClientRect();
      deltaX = Math.round(deltaX * 4 / (r.width-border));
      console.log("MOVE HORZ", this.offsets[this.dragging.id][1], deltaX);
      this.puzzle.moveHorz(this.offsets[this.dragging.id][1], deltaX);
    } else {
      // round deltaY
      const border = (this.board.offsetHeight - this.board.clientHeight);

      // TODO: check if it's board's border or div's border that we care about
      // here?
      const r = this.board.getBoundingClientRect();
      deltaY = Math.round(deltaY * 4 / (r.height-border));
      console.log("MOVE VERT", this.offsets[this.dragging.id][0], deltaY);
      this.puzzle.moveVert(this.offsets[this.dragging.id][0], deltaY);
    }

    this.createGrid();
    this.dragging = null;

    // check if we are done
    if (this.puzzle.done()) {
      global.confetti.start(10000);
      this.board.classList.add("done");
    }

    console.log("handleEnd called");
  }

  resetNodes() {
    const rows = this.puzzle.rowColPair(this.offsets[this.dragging.id][1]);
    let nodes = rows.flatMap(row => this.findHorzNodes(row));
    nodes.forEach(el => el.style.left = this.offsetToX(this.offsets[el.id][0]));

    const cols = this.puzzle.rowColPair(this.offsets[this.dragging.id][0]);
    nodes = cols.flatMap(col => this.findVertNodes(col));
    nodes.forEach(el => el.style.top = this.offsetToY(this.offsets[el.id][1]));
  }

  findHorzNodes(offset) {
    const r = [];
    for (let i=-4; i<8; i++) {
      r.push(this.divs[this.offsetToStr(i, offset)])
    }
    return r;
  }

  findVertNodes(offset) {
    const r = [];
    for (let j=-4; j<8; j++) {
      r.push(this.divs[this.offsetToStr(offset, j)])
    }
    return r;
  }

  offsetToX(n) {
    // TODO: why does board.getBoundingClientRect().width not equal offsetWidth
    // or clientWidth?
    const border = (this.board.offsetWidth - this.board.clientWidth);
    // TODO: check if it's board's border or div's border that we care about
    // here?
    const r = this.board.getBoundingClientRect();
    return n * (r.width-border)/4
  }

  offsetToY(n) {
    // TODO: why does board.getBoundingClientRect().width not equal offsetWidth
    // and clientWidth?
    const border = (this.board.offsetHeight - this.board.clientHeight);
    // TODO: check if it's board's border or div's border that we care about
    // here?
    const r = this.board.getBoundingClientRect();
    return n * (r.height-border)/4
  }
}

module.exports = HtmlUI


//   handleEnd(ev) {
//
//       // TODO: handle wrap around!
//     }
//     this.dragging = null;
//   }
//
//
//
//   abort(ev) {
//     if (this.dragging == null) {
//       return false;
//     }
//     if (ev.srcElement != this.dragging) {
//       console.log("OOPS");
//       debugger;
//       return false;
//     }
//
//     // Reset the nodes on the same column
//     // TODO: figure out to make this less jarring
//     let nodes = this.findVertNodes(getPosX(this.dragging));
//     nodes.map(el => {
//       el.style.top = offsetToY(getPosY(el));
//     });
//
//     // Reset the nodes on the same row
//     // TODO: figure out to make this less jarring
//     nodes = this.findHorzNodes(getPosY(this.dragging));
//     nodes.map(el => {
//       el.style.left = offsetToX(getPosX(el));
//     });
//
//     this.dragging = null;
//   }
// }