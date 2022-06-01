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

function loadLevel(level) {
  let puzzle;
  switch (level) {
    case "easy":
      puzzle = new Puzzle([["A", "B", "A", "B"], ["B", "A", "B", "A"], ["A", "B", "A", "B"], ["B", "A", "B", "A"]], Difficulty.Easy);
      puzzle.shuffle(100);
      new HtmlUI(puzzle, board, goal);
      global.footer.innerText = "Current level: Easy"
      break;
    case "medium":
      puzzle = new Puzzle([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], Difficulty.Easy);
      puzzle.shuffle(100);
      new HtmlUI(puzzle, board, goal);
      global.footer.innerText = "Current level: Medium"
      break;
    case "hard":
      puzzle = new Puzzle([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], Difficulty.Hard);
      puzzle.shuffle(100);
      new HtmlUI(puzzle, board, goal);
      global.footer.innerText = "Current level: Hard"
      break;
  }
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

global.levels.onclick = () => {
  document.body.classList.remove("hide");
  global.levels.classList.remove("enabled");
}
