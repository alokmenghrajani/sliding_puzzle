const {positiveMod, randInt} = require('./utils.js');

/**
 * Core of the puzzle. This class tracks the current state of the grid, handles
 * shuffling, checking whether we are done, etc.
 */
class Puzzle {
  constructor(target, difficulty) {
    this.target = target;
    // Use a roundtrip via JSON to clone the target array
    this.state = JSON.parse(JSON.stringify(target));
    this.rows = this.state.length;
    this.cols = this.state[0].length;
    this.difficulty = difficulty;
  }

  shuffle(n) {
    // if n>100, random moves should be enough to get an interesting start
    // position. The advantage of using random moves is that it guarantees that
    // the resulting board is solvable. The downside is that not all board
    // positions will be equally likely to show up.
    for (let i = 0; i < n; i++) {

      // pick -1 or 1
      const dir = 2 * randInt(2) - 1;

      if (Math.random() > 0.5) {
        // pick a number between 0 .. rows-1
        const pos = randInt(this.rows);
        this.moveHorz(pos, dir);
      } else {
        // pick a number between 0 .. cols-1
        const pos = randInt(this.cols);
        this.moveVert(pos, dir);
      }
    }
  }

  solved() {
    for (let i=0; i<this.rows; i++) {
      for (let j=0; j<this.cols; j++) {
        if (this.state[i][j] != this.target[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Return the group of rows or cols to moves.
   */
  rowColGroup(i, h) {
    const idx = Math.floor(i / h);
    const group = [];
    for (let j = 0; j < h; j++) {
      group[j] = idx * h + j;
    }
    return group;
  }

  rowGroup(i) {
    return this.rowColGroup(i, this.difficulty.height);
  }

  colGroup(j) {
    return this.rowColGroup(j, this.difficulty.width);
  }

  moveHorz(y, dir) {
    const rows = this.rowGroup(y);
    rows.forEach(row => this.moveSingleRowHorz(row, dir));
  }

  moveSingleRowHorz(i, dir) {
    let t = [];
    for (let j=0; j<this.cols; j++) {
      t[j] = this.state[i][positiveMod(j-dir, this.cols)]
    }
    this.state[i] = t;
  }

  moveVert(x, dir) {
    const cols = this.colGroup(x);
    cols.forEach(col => this.moveSingleColVert(col, dir));
  }

  moveSingleColVert(j, dir) {
    let t = [];
    for (let i=0; i<this.rows; i++) {
      t[i] = this.state[positiveMod(i-dir, this.rows)][j]
    }
    for (let i=0; i<this.rows; i++) {
      this.state[i][j] = t[i];
    }
  }
}

class Difficulty {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

module.exports = { Puzzle, Difficulty }
