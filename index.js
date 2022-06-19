/**
 * The code maintains an internal model and a view (html nodes). Dragging works
 * on the view, but once the drag ends, the final move is computed and performed
 * on the model. The model is then used to rebuild the view to ensure both are
 * in sync. Creating/throwing away a small number of html nodes is cheap vs
 * ensuring that the view and model match up. This allows the model to only care
 * about a 4x4 grid, while the view can have extra html nodes to give the
 * illusion of wrapping around.
 */

const {Puzzle: Puzzle, Difficulty: Difficulty} = require('./puzzle.js');
const HtmlUI = require('./html-ui.js');

function positionBoards() {
  const r = global.container.getBoundingClientRect();
  const board = global.board;
  const goal = global.goal;

  if (r.width > r.height) {
    // board size must be <= r.height and 66% of r.width
    const s = (Math.min(r.height, 0.66 * (r.width - 10)))|0;
    board.style.width = s;
    board.style.height = s;
    goal.style.width = s/3;
    goal.style.height = s/3;
    goal.style.left = s + 10;
    goal.style.top = 2*s/3;
  } else {
    // board size must be <= r.width and 66% of r.height
    const s = (Math.min(r.width, 0.66 * (r.height - 10)))|0;
    board.style.width = s;
    board.style.height = s;
    goal.style.width = s/3;
    goal.style.height = s/3;
    goal.style.left = 2*s/3;
    goal.style.top = s + 10;
  }
}

window.onload = () => positionBoards();
window.onresize = () => positionBoards();
positionBoards();

// characters used for patterns
const digits = "ABCDEFGHIJK";

// mkPuzzle
//   rows: the number of rows
//   cols: the number of cols
//   pattern: 0 if no pattern, otherwise the size of the pattern. 2
//     means two colors (A and B). 3, three (A, B and C) etc.
//   height: the number of grouped rows when moving
//   width: the number of grouped columns when moving
function mkPuzzle(rows, cols, pattern, height, width) {
  const arr = new Array(rows);
  for (let i = 0; i < rows; i++) {
    arr[i] = new Array(cols);
    for (let j = 0; j < cols; j++) {
      let cell;
      if (pattern == 0) {
        cell = cols * i + j + 1;
      } else {
        cell = digits[(i + j) % pattern];
      }
      arr[i][j] = cell;
    }
  }
  const difficulty = new Difficulty(height, width);
  const puzzle = new Puzzle(arr, difficulty);
  puzzle.shuffle(100);
  return puzzle;
}

function loadLevel(level) {
  let puzzle;
  let text;
  switch (level) {
    case "easy":
      puzzle = mkPuzzle(4, 4, 2, 1, 1);
      text = "Easy";
      break;
    case "medium":
      puzzle = mkPuzzle(4, 4, 0, 1, 1);
      text = "Medium";
      break;
    case "hard":
      puzzle = mkPuzzle(4, 4, 0, 2, 2);
      text = "Hard";
      break;
    case "6x6 easy":
      puzzle = mkPuzzle(6, 6, 0, 2, 2);
      text = "6x6 easy";
      break;
    case "6x6 medium":
      puzzle = mkPuzzle(6, 6, 3, 3, 3);
      text = "6x6 medium";
      break;
    case "6x6 hard":
      puzzle = mkPuzzle(6, 6, 0, 3, 3);
      text = "6x6 hard";
      break;
  }
  new HtmlUI(puzzle, board, goal);
  global.footer.innerText = "Current level: " + text;
}

// default easy
loadLevel("easy");

global.showInstructions.onclick = (e) => {
  document.body.classList.add("hide");
  global.instr.classList.add("enabled");
}

global.instr.onclick = () => {
  document.body.classList.remove("hide");
  global.instr.classList.remove("enabled");
}

global.showLevels.onclick = () => {
  document.body.classList.add("hide");
  global.levels.classList.add("enabled");
}

global.easy.onclick = () => loadLevel("easy");
global.medium.onclick = () => loadLevel("medium");
global.hard.onclick = () => loadLevel("hard");
global.gen_6x6_easy.onclick = () => loadLevel("6x6 easy");
global.gen_6x6_medium.onclick = () => loadLevel("6x6 medium");
global.gen_6x6_hard.onclick = () => loadLevel("6x6 hard");

global.levels.onclick = () => {
  document.body.classList.remove("hide");
  global.levels.classList.remove("enabled");
}
