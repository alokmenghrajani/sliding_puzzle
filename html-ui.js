// BEWARE, IN THAT FILE I IS COLUMN INDEX AND J ROW INDEX (TRICKY, ISN'T
// IT?)

const {positiveMod: positiveMod} = require('./utils.js');
const Confetti = require('./confetti.js');

global.conf = Confetti;

/**
 * Code to create html nodes and handle interaction via mouse/touch gestures.
 */
class HtmlUI {
  constructor(puzzle, board, goal) {
    this.puzzle = puzzle;
    this.rows = this.puzzle.rows;
    this.cols = this.puzzle.cols;
    this.board = board;
    this.goal = goal;
    this.dragging = null;
    // use pointerId to disable multitouch events.
    this.pointerId = null;
    this.dragStart = [0, 0];

    // Setup colormap. Letters map to arbitrary colors, numbers map to a
    // gradient.
    this.colorMap = {};
    this.colorMap["A"] = "#b7e5dd";
    this.colorMap["B"] = "#9a86a4";
    this.colorMap["C"] = "#b1bce6";
    const md = Math.hypot(this.rows, this.cols);
    for (let i=0; i<this.cols; i++) {
      for (let j=0; j<this.rows; j++) {
        const n = j * this.cols + i + 1;
        const d = Math.hypot(this.cols - i, this.rows - j) / md;
        const red = 0x00 + (0xe0 - 0x00) * d;
        const green = 0x40 + (0xe0 - 0x40) * d;
        const blue = 0x70 + (0xe0 - 0x70) * d;
        const color = 'rgba(' + [red, green, blue].join() + ")";
        this.colorMap[n] = color;
      }
    }

    this.createGrid();
    this.createGoal();
    this.initKeys();

    document.onpointermove = (ev) => this.handleMove(ev);
    document.onpointerup = (ev) => this.handleEnd(ev);
    document.onkeydown = (ev) => this.handleKey(ev);
  }

  createGrid() {
    this.offsets = {}; // tracks divs => offsets
    this.divs = {}; // tracks offsets => divs

    const r = [];
    // We add cells in the [-n, 2*n) range to make wrapping easier.
    for (let i=-this.cols; i<2*this.cols; i++) {
      for (let j=-this.rows; j<2*this.rows; j++) {
        r.push(this.createCell(i, j, this.puzzle.state[positiveMod(j, this.rows)][positiveMod(i, this.cols)]));
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
    div.style.left = this.offsetToPercentage(x,this.cols);
    div.style.top = this.offsetToPercentage(y,this.rows);
    div.style.width = (100 / this.cols) + "%";
    div.style.height = (100 / this.rows) + "%";
    div.style.backgroundColor = this.colorMap[label];
    div.id = "cell_" + this.offsetToStr(x, y);

    // UI events
    div.onpointerdown = (ev) => this.handleStart(ev);

    this.offsets[div.id] = [x, y];
    this.divs[this.offsetToStr(x, y)] = div;

    return div;
  }

  offsetToPercentage(n, m) {
    return (n * 100 / m) + "%";
  }

  offsetToStr(x, y) {
    return x * 100 + y;
  }

  createGoal() {
    for (let i=0; i<this.cols; i++) {
      for (let j=0; j<this.rows; j++) {
        this.createGoalCell(i, j, this.puzzle.target[j][i])
      }
    }
  }

  createGoalCell(x, y, label) {
    const div = document.createElement("div");
    div.innerText = label;
    div.style.left = this.offsetToPercentage(x, this.cols);
    div.style.top = this.offsetToPercentage(y, this.rows);
    div.style.width = (100 / this.cols) + "%";
    div.style.height = (100 / this.rows) + "%";
    div.style.backgroundColor = this.colorMap[label];
    this.goal.appendChild(div);
  }

  handleStart(ev) {
    if (this.dragging != null) {
      // We got a handleStart while already dragging. This can happen in various
      // edge cases. The easiest is to ignore the event
      return false;
    }

    if (this.puzzle.solved()) {
      // Disallow making moves once the puzzle is solved.
      return false;
    }

    // record element's starting position
    const r = board.getBoundingClientRect();

    this.dragStart = [ev.clientX - r.x, ev.clientY - r.y];
    this.pointerId = ev.pointerId;
    this.dragging = ev.srcElement;
    ev.preventDefault();
    return false;
  }

  handleMove(ev) {
    if (this.dragging == null) {
      return false;
    }
    if (ev.pointerId != this.pointerId) {
      return false;
    }

    // calculate how much the mouse has moved from it's initial position
    const r = this.board.getBoundingClientRect();

    const x = ev.clientX - r.x;
    const y = ev.clientY - r.y;
    let deltaX = x - this.dragStart[0];
    let deltaY = y - this.dragStart[1];

    // Prevent dragging too far in any direction
    const maxX = this.offsetToX(this.cols - 0.5);
    if (deltaX > maxX) {
      deltaX = maxX;
    }
    if (deltaX < -maxX) {
      deltaX = -maxX;
    }
    const maxY = this.offsetToY(this.rows - 0.5);
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
      const rows = this.puzzle.rowGroup(this.offsets[this.dragging.id][1]);
      const nodes = rows.flatMap(row => this.findHorzNodes(row));
      nodes.forEach(el => {
        // TODO: would be cleaner to use percentages. It doesn't matter much as
        // we rebuild the grid at the end of the grad event.
        el.style.left = this.offsetToX(this.offsets[el.id][0]) + deltaX;
      });
    } else {
      // Grab all the nodes on the same column
      const cols = this.puzzle.colGroup(this.offsets[this.dragging.id][0]);
      const nodes = cols.flatMap(col => this.findVertNodes(col));
      nodes.forEach(el => {
        // TODO: would be cleaner to use percentages. It doesn't matter much as
        // we rebuild the grid at the end of the grad event.
        el.style.top = this.offsetToY(this.offsets[el.id][1]) + deltaY;
      });
    }
    ev.preventDefault();
    return false;
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
    const maxX = this.offsetToX(this.cols - 0.5);
    if (deltaX > maxX) {
      deltaX = maxX;
    }
    if (deltaX < -maxX) {
      deltaX = -maxX;
    }
    const maxY = this.offsetToY(this.rows - 0.5);
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
      const r = this.board.getBoundingClientRect();
      deltaX = Math.round(deltaX * this.cols / r.width);
      this.puzzle.moveHorz(this.offsets[this.dragging.id][1], deltaX);
    } else {
      // round deltaY
      const r = this.board.getBoundingClientRect();
      deltaY = Math.round(deltaY * this.rows / r.height);
      this.puzzle.moveVert(this.offsets[this.dragging.id][0], deltaY);
    }

    this.createGrid();
    this.dragging = null;
    ev.preventDefault();
    return false;
  }

  initKeys() {
    // [hv, idx, n] means
    //   hv: 0 for horizontal, 1 for vertical
    //   idx: the index of row or column
    //   n: the move count
    this.keys = {};
    for (let i = 0; i < this.cols; i++) {
      this.keys[49 + i] = [1, i, 1];
    }
    // TGBYHN
    const hkeys = [84, 71, 66, 89, 72, 78];
    for (let i = 0; i < this.rows; i++) {
      this.keys[hkeys[i]] = [0, i, 1];
    }
  }

  handleKey(ev) {
    const funs = [
      (a, b) => { this.puzzle.moveHorz(a, b); },
      (a, b) => { this.puzzle.moveVert(a, b); }
    ];
    if (ev.keyCode in this.keys) {
      let move = this.keys[ev.keyCode];
      let k = 1;
      if (ev.shiftKey) {
        k = -1;
      }
      funs[move[0]](move[1], k * move[2]);
    } else {
      // alert(ev.keyCode);
      return;
    }
    this.createGrid();
    ev.preventDefault();
  }

  resetNodes() {
    const rows = this.puzzle.rowGroup(this.offsets[this.dragging.id][1]);
    let nodes = rows.flatMap(row => this.findHorzNodes(row));
    nodes.forEach(el => el.style.left = this.offsetToX(this.offsets[el.id][0]));

    const cols = this.puzzle.colGroup(this.offsets[this.dragging.id][0]);
    nodes = cols.flatMap(col => this.findVertNodes(col));
    nodes.forEach(el => el.style.top = this.offsetToY(this.offsets[el.id][1]));
  }

  findHorzNodes(offset) {
    const r = [];
    for (let i=-this.cols; i<2*this.cols; i++) {
      r.push(this.divs[this.offsetToStr(i, offset)])
    }
    return r;
  }

  findVertNodes(offset) {
    const r = [];
    for (let j=-this.rows; j<2*this.rows; j++) {
      r.push(this.divs[this.offsetToStr(offset, j)])
    }
    return r;
  }

  offsetToX(n) {
    const border = (this.board.offsetWidth - this.board.clientWidth);
    const r = this.board.getBoundingClientRect();
    return n * (r.width-border)/this.cols;
  }

  offsetToY(n) {
    const border = (this.board.offsetHeight - this.board.clientHeight);
    const r = this.board.getBoundingClientRect();
    return n * (r.height-border)/this.rows;
  }
}

module.exports = HtmlUI
