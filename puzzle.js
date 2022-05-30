const positiveMod = require('./utils.js');

class Puzzle {
  constructor(target, difficulty) {
    this.target = target;
    // Use a roundtrip via JSON to clone the target array
    this.state = JSON.parse(JSON.stringify(target));
    this.difficulty = difficulty;
  }

  shuffle() {
    // 100 random moves should be enough to randomize the board. The advantage
    // of using random moves is that it guarantees that the resulting board is
    // solvable. The downside is that all board positions won't be equally
    // likely to show up.
    for (let i = 0; i < 100; i++) {
      // pick a number between 0-3
      const pos = (Math.random() * 4) | 0;

      // pick -1 or 1
      const dir = ((Math.random() * 2) | 0) * 2 - 1;

      if (Math.random() > 0.5) {
        this.moveHorz(pos, dir);
      } else {
        this.moveVert(pos, dir);
      }
    }
  }

  /**
   * In hard mode, maps a row/col to the pair of rows/cols which move together.
   * In easy mode, returns the argument.
   */
  rowColPair(n) {
    if (this.difficulty == Difficulty.Easy) {
      return [n];
    } else {
      // if n is 0 or 1 => return [0, 1]
      // if n is 2 or 3 => return [2, 3]
      const t = ((n/2)|0)*2;
      return [t, t+1];
    }
  }

  moveHorz(y, dir) {
    const rows = this.rowColPair(y);
    rows.forEach(row => this.moveSingleRowHorz(row, dir));
  }

  moveSingleRowHorz(y, dir) {
    let t = [];
    for (let i=0; i<4; i++) {
      t[i] = this.state[y][positiveMod(i-dir, 4)]
    }
    this.state[y] = t;
  }

  moveVert(x, dir) {
    const cols = this.rowColPair(x);
    cols.forEach(col => this.moveSingleRowHorz(col, dir));
  }

  moveSingleColVert(x, dir) {
    let t = [];
    for (let i=0; i<4; i++) {
      t[i] = this.state[positiveMod(i-dir, 4)][x]
    }
    for (let i=0; i<4; i++) {
      this.state[i][x] = t[i];
    }
  }

  toString() {
    let r = "";
    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        const t = this.state[i][j] + "";
        r += t.padStart(3, " ");
      }
      r += "\n";
    }
    return r;
  }
}

class Difficulty {
  static Easy = new Difficulty("easy");
  static Hard = new Difficulty("hard");

  constructor(name) {
    this.name = name;
  }
}

module.exports = { Puzzle, Difficulty }
