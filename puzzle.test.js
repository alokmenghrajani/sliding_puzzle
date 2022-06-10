const {Puzzle: Puzzle, Difficulty: Difficulty} = require('./puzzle.js');

function mkDummyPuzzle(h, w) {
  let state = new Array(h);
  for (let i = 0; i < h; i++) {
    state[i] = new Array(w);
    for (let j = 0; j < w; j++) {
      state[i][j] = i * w + j + 1;
    }
  }
  return state;
}

test('rowGroup (1, 1)', () => {
  const p = new Puzzle(mkDummyPuzzle(6, 4), new Difficulty(1, 1));
  expect(p.rowGroup(1)).toStrictEqual([1]);
});

test('colGroup (1, 1)', () => {
  const p = new Puzzle(mkDummyPuzzle(6, 4), new Difficulty(1, 1));
  expect(p.colGroup(1)).toStrictEqual([1]);
});

test('rowGroup (3, 2)', () => {
  const p = new Puzzle(mkDummyPuzzle(6, 4), new Difficulty(3, 2));
  expect(p.rowGroup(1)).toStrictEqual([0, 1, 2]);
});

test('colGroup (3, 2)', () => {
  const p = new Puzzle(mkDummyPuzzle(6, 4), new Difficulty(3, 2));
  expect(p.colGroup(1)).toStrictEqual([0, 1]);
});

test('moveHorz (6, 4, 3, 2)', () => {
  const p = new Puzzle(mkDummyPuzzle(6, 4), new Difficulty(3, 2));
  p.moveHorz(1, 2);
  expect(p.state).toStrictEqual([
    [3,4,1,2],
    [7,8,5,6],
    [11,12,9,10],
    [13,14,15,16],
    [17,18,19,20],
    [21,22,23,24]]);
});

test('moveVert (6, 4, 3, 2)', () => {
  const p = new Puzzle(mkDummyPuzzle(6, 4), new Difficulty(3, 2));
  p.moveVert(1, 2);
  expect(p.state).toStrictEqual([
    [17,18,3,4],
    [21,22,7,8],
    [1,2,11,12],
    [5,6,15,16],
    [9,10,19,20],
    [13,14,23,24]]);
});

test('moveHorz (hard)', () => {
  const p = new Puzzle(mkDummyPuzzle(4, 4), new Difficulty(2, 2));
  p.moveHorz(1, 2);
  expect(p.state).toStrictEqual([
    [3,4,1,2],
    [7,8,5,6],
    [9,10,11,12],
    [13,14,15,16]]);
});

test('moveVert (hard)', () => {
  const p = new Puzzle(mkDummyPuzzle(4, 4), new Difficulty(2, 2));
  p.moveVert(3, -3);
  expect(p.state).toStrictEqual([
    [1,2,15,16],
    [5,6,3,4],
    [9,10,7,8],
    [13,14,11,12]]);
});

test('moveHorz (easy)', () => {
  const p = new Puzzle(mkDummyPuzzle(4, 4), new Difficulty(1, 1));
  p.moveHorz(0, 2);
  expect(p.state).toStrictEqual([
    [3,4,1,2],
    [5,6,7,8],
    [9,10,11,12],
    [13,14,15,16]]);
});

test('moveVert (easy)', () => {
  const p = new Puzzle(mkDummyPuzzle(4, 4), new Difficulty(1, 1));
  p.moveVert(2, -3);
  expect(p.state).toStrictEqual([
    [1,2,15,4],
    [5,6,3,8],
    [9,10,7,12],
    [13,14,11,16]]);
});
