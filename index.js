/*
  TODO:
  - fix TODOs in code.
  - test tablet / phone / different browsers.
  - smoother changes to element positions.
  - make the UI board infinite instead of 12x12 (makes gameplay somewhat nicer)
  - fix "Uncaught TypeError: Cannot read properties of undefined (reading '0')"
  - instructions + links for different levels:
    <h1>A sliding puzzle with a Rubik's cube-like feel.</h1>
    <div><strong>Instructions:</strong></div>
    <ul>
      <li>Slide the cells on the larger board to match the smaller board.</li>
      <li>Cells wrap around.</li>
    </ul>
    <p><strong>Levels:</strong>
      <ul>
        <li>Easy</li>
        <li>Medium</li>
        <li>Hard</li>
      </ul>
    </p>
    <p>Found a bug or want to contribute a feature? Link to github...</p>
*/

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

//const puzzle = new Puzzle([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], Difficulty.Easy);
//const puzzle = new Puzzle([["A", "B", "A", "B"], ["B", "A", "B", "A"], ["A", "B", "A", "B"], ["B", "A", "B", "A"]], Difficulty.Easy);
const puzzle = new Puzzle([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], Difficulty.Hard);

puzzle.shuffle(100);

const htmlUI = new HtmlUI(puzzle, board, goal);
global.htmlUI = htmlUI;
