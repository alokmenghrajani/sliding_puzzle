const positiveMod = require('./utils.js');
const Confetti = require('./confetti.js');

global.conf = Confetti;

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

    document.onpointermove = (ev) => this.handleMove(ev);
    document.onpointerup = (ev) => this.handleEnd(ev);
    document.onkeydown = (ev) => this.handleKey(ev);
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

    const solved = this.puzzle.solved();
    this.board.className = solved ? "solved" : "unsolved";
    if (solved) {
      new Confetti().start(10000);
    }
  }

  createCell(x, y, label) {
    const div = document.createElement("div");
    div.innerText = label;
    div.style.left = this.offsetToPercentage(x);
    div.style.top = this.offsetToPercentage(y);
    div.style.backgroundColor = this.colorMap[label];
    div.id = "cell_" + this.offsetToStr(x, y);

    // UI events
    div.onpointerdown = (ev) => this.handleStart(ev);

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
        this.createGoalCell(i, j, this.puzzle.target[j][i])
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

    if (this.puzzle.solved()) {
      // Disallow making moves once the puzzle is solved.
      return false;
    }

    // record element's starting position
    const r = board.getBoundingClientRect();

    this.dragStart = [ev.clientX - r.x, ev.clientY - r.y];
    this.dragging = ev.srcElement;
  }

  handleMove(ev) {
    if (this.dragging == null) {
      return false;
    }

    // calculate how much the mouse has moved from it's initial position
    const r = this.board.getBoundingClientRect();

    const x = ev.clientX - r.x;
    const y = ev.clientY - r.y;
    let deltaX = x - this.dragStart[0];
    let deltaY = y - this.dragStart[1];

    // Prevent dragging too far in any direction
    const maxX = this.offsetToX(3.5);
    if (deltaX > maxX) {
      deltaX = maxX;
    }
    if (deltaX < -maxX) {
      deltaX = -maxX;
    }
    const maxY = this.offsetToY(3.5);
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
      // This can happen if the initial mouse down happens outside the play
      // area. Simplest to ignore.
      return false;
    }

    // TODO: refactor with above

    // calculate how much the mouse has moved from it's initial position
    // assumption: all 4 borders have the same width.
    const r = this.board.getBoundingClientRect();
    const x = ev.clientX - r.x;
    const y = ev.clientY - r.y;
    let deltaX = x - this.dragStart[0];
    let deltaY = y - this.dragStart[1];

    // Prevent dragging too far in any direction
    const maxX = this.offsetToX(3.5);
    if (deltaX > maxX) {
      deltaX = maxX;
    }
    if (deltaX < -maxX) {
      deltaX = -maxX;
    }
    const maxY = this.offsetToY(3.5);
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
      this.puzzle.moveHorz(this.offsets[this.dragging.id][1], deltaX);
    } else {
      // round deltaY
      const border = (this.board.offsetHeight - this.board.clientHeight);

      // TODO: check if it's board's border or div's border that we care about
      // here?
      const r = this.board.getBoundingClientRect();
      deltaY = Math.round(deltaY * 4 / (r.height-border));
      this.puzzle.moveVert(this.offsets[this.dragging.id][0], deltaY);
    }

    this.createGrid();
    this.dragging = null;
  }

  handleKey(ev) {
    switch (ev.keyCode) {
      case 49: // "1"
      case 50: // "2"
      case 51: // "3"
      case 52: // "4"
        this.puzzle.moveVert(ev.keyCode - 49, ev.shiftKey ? -1 : 1);
        break;
      case 53: // "5"
        this.puzzle.moveHorz(0, ev.shiftKey ? -1 : 1);
        break;
      case 84: // "T"
      this.puzzle.moveHorz(1, ev.shiftKey ? -1 : 1);
      break;
      case 71: // "G"
      this.puzzle.moveHorz(2, ev.shiftKey ? -1 : 1);
      break;
      case 66: // "B"
      this.puzzle.moveHorz(3, ev.shiftKey ? -1 : 1);
      break;
      default:
        return;
    }
    this.createGrid();
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
    const border = (this.board.offsetWidth - this.board.clientWidth);
    const r = this.board.getBoundingClientRect();
    return n * (r.width-border)/4
  }

  offsetToY(n) {
    const border = (this.board.offsetHeight - this.board.clientHeight);
    const r = this.board.getBoundingClientRect();
    return n * (r.height-border)/4
  }
}

module.exports = HtmlUI
