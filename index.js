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

function loadLevel(level) {
  let puzzle;
  switch (level) {
    case "easy":
      puzzle = new Puzzle([["A", "B", "A", "B"], ["B", "A", "B", "A"], ["A", "B", "A", "B"], ["B", "A", "B", "A"]], Difficulty.Easy);
      puzzle.shuffle(100);
      new HtmlUI(puzzle, board, goal);
      break;
    case "medium":
      puzzle = new Puzzle([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], Difficulty.Easy);
      puzzle.shuffle(100);
      new HtmlUI(puzzle, board, goal);
      break;
    case "hard":
      puzzle = new Puzzle([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], Difficulty.Hard);
      puzzle.shuffle(100);
      new HtmlUI(puzzle, board, goal);
      break;
  }
}

// default easy
global.levelEasy.checked = true;
loadLevel("easy");

global.levelEasy.onchange = () => loadLevel("easy");
global.levelMedium.onchange = () => loadLevel("medium");
global.levelHard.onchange = () => loadLevel("hard");

global.showInstructions.onclick = () => {
  document.body.classList.add("instr");
}

global.hideInstructions.onclick = () => {
  document.body.classList.remove("instr");
}
