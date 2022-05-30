const {Puzzle: Puzzle, Difficulty: Difficulty} = require('./puzzle.js');

test('rowColPair (hard)', () => {
  const p = new Puzzle([], Difficulty.Hard);
  expect(p.rowColPair(1)).toStrictEqual([0, 1]);
});

test('rowColPair (easy)', () => {
  const p = new Puzzle([], Difficulty.Easy);
  expect(p.rowColPair(1)).toStrictEqual([1]);
});

test('moveHorz (hard)', () => {
  const p = new Puzzle([[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]], Difficulty.Hard);
  p.moveHorz(1, 2);
  expect(p.state).toStrictEqual([
    [3,4,1,2],
    [7,8,5,6],
    [9,10,11,12],
    [13,14,15,16]]);
});

test('moveVert (hard)', () => {
  const p = new Puzzle([[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]], Difficulty.Hard);
  p.moveVert(3, 1);
  expect(p.state).toStrictEqual([
    [1,2,3,4],
    [5,6,7,8],
    [9,10,11,12],
    [13,14,15,16]]);
});
