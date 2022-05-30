/*
  TODO:
  - fix TODOs in code.
  - broken in safari.
  - test tablet + phone.
  - bugs, bugs, bugs. Duplicate numbers showing up.
  - write unittests.
  - handle mouse exiting play area.
  - handle window resize!
  - save state locally
  - links for different levels
  - instructions
  - green border for correct cells?
  - keyboard bindings
  - smoother changes to element positions.
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

new Puzzle([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]], Difficulty.Hard);

// const colorMap = {};
// let dragHandler;
// let divsMap = {};
//
// function init(target) {
//   // Setup colormap. Letters map to arbitrary colors, numbers map to a gradient.
//   colorMap["A"] = "#f44";
//   colorMap["B"] = "#4f4";
//   for (let i=0; i<4; i++) {
//     for (let j=0; j<4; j++) {
//       const n = 1 + i * 4 + j;
//       const d = Math.sqrt((4-i)*(4-i) + (4-j)*(4-j)) / Math.sqrt(32);
//       const color1 = 0x00 + (0xe0 - 0x00) * d;
//       const color2 = 0x40 + (0xe0 - 0x40) * d;
//       const color3 = 0x70 + (0xe0 - 0x70) * d;
//       const color = 'rgba(' + color1 + "," + color2 + "," + color3 + ")";
//       colorMap[n] = color;
//     }
//   }
//
//   // TODO: Shuffle board
//
//
//   dragHandler = new DragHandler();
//
//   // fixes a delay issue (see https://stackoverflow.com/questions/61760755/how-to-fire-dragend-event-immediately)
//   document.addEventListener("dragover", function( event ) {
//       event.preventDefault();
//   }, false);
//
//   for (let i=-4; i<8; i++) {
//     for (let j=-4; j<8; j++) {
//       createCell(i, j, target[mod(i, 4)][mod(j, 4)])
//     }
//   }
//
//   for (let i=0; i<4; i++) {
//     for (let j=0; j<4; j++) {
//       createGoalCell(i, j, target[i][j])
//     }
//   }
// }
//
// function offsetToPercentage(n) {
//   return (n * 100 / 4) + "%";
// }
//
// function offsetToStr(x, y) {
//   return x * 100 + y;
// }
//
// function offsetToX(n) {
//   // TODO: why does board.getBoundingClientRect().width not equal offsetWidth
//   // and clientWidth?
//   const border = (board.offsetWidth - board.clientWidth);
//   // TODO: check if it's board's border or div's border that we care about
//   // here?
//   const r = board.getBoundingClientRect();
//   return n * (r.width-border)/4
// }
//
// function offsetToY(n) {
//   // TODO: why does board.getBoundingClientRect().width not equal offsetWidth
//   // and clientWidth?
//   const border = (board.offsetHeight - board.clientHeight);
//   // TODO: check if it's board's border or div's border that we care about
//   // here?
//   const r = board.getBoundingClientRect();
//   return n * (r.height-border)/4
// }
//
// function createCell(x, y, label) {
//   const div = document.createElement("div");
//   div.innerText = label;
//   div.style.left = offsetToPercentage(x);
//   div.style.top = offsetToPercentage(y);
//   div.ondragstart = (ev) => dragHandler.handleStart(ev);
//   div.ondrag = (ev) => dragHandler.handle(ev);
//   div.ondragend = (ev) => dragHandler.handleEnd(ev);
//   div.draggable = true;
//   div.style.backgroundColor = colorMap[label];
//   div.id = "div" + offsetToStr(x, y);
//   div["data-x"] = x;
//   div["data-y"] = y;
//   divsMap[offsetToStr(x, y)] = div;
//   board.appendChild(div);
// }
//
// function createGoalCell(x, y, label) {
//   const div = document.createElement("div");
//   div.innerText = label;
//   div.style.left = offsetToPercentage(x);
//   div.style.top = offsetToPercentage(y);
//   div.style.backgroundColor = colorMap[label];
//   goal.appendChild(div);
// }
//
// function getPosX(el) {
//   return el["data-x"]|0;
// }
//
// function getPosY(el) {
//   return el["data-y"]|0;
// }
//
// class DragHandler {
//   constructor() {
//     this.dragging = null;
//
//     this.blankImg = new Image();
//     this.blankImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
//   }
//
//   handleStart(ev) {
//     if (this.dragging != null) {
//       console.log("OOPS");
//       debugger;
//       return false;
//     }
//     console.log("starting: " + ev.srcElement.id);
//     this.dragging = ev.srcElement;
//
//     // record element's starting position
//     const r = board.getBoundingClientRect();
//     this.eventStartX = ev.x - r.x;
//     this.eventStartY = ev.y - r.y;
//
//     // remove ghost image
//     ev.dataTransfer.setDragImage(this.blankImg, 0, 0);
//
//     // fix cursor while dragging
//     ev.dataTransfer.effectAllowed = "move";
//   }
//
//   handle(ev) {
//     if (this.dragging == null) {
//       return false;
//     }
//     if (ev.srcElement != this.dragging) {
//       console.log("OOPS");
//       debugger;
//       return false;
//     }
//
//     // calculate how much the mouse has moved from it's initial position
//     // assumption: all 4 borders have the same width.
//     const r = board.getBoundingClientRect();
//     const border = (board.offsetWidth - board.clientWidth) / 2;
//     // TODO: check if it's board's border or div's border that we care about
//     // here? Remember, div's border depends on window size.
//
//     const x = ev.x - r.x - border;
//     const y = ev.y - r.y - border;
//     const deltaX = x - this.eventStartX;
//     const deltaY = y - this.eventStartY;
//
//     // figure out which axis we are moving on
//     if (Math.abs(deltaX) > Math.abs(deltaY)) {
//       // Grab all the nodes on the same row
//       let nodes = this.findHorzNodes(getPosY(this.dragging));
//       nodes.map(el => {
//         el.style.left = offsetToX(getPosX(el)) + deltaX;
//       });
//
//       // Reset the nodes on the same column
//       // TODO: figure out to make this less jarring
//       nodes = this.findVertNodes(getPosX(this.dragging));
//       nodes.map(el => {
//         el.style.top = offsetToY(getPosY(el));
//       });
//     } else {
//       // Grab all the nodes on the same column
//       let nodes = this.findVertNodes(getPosX(this.dragging));
//       nodes.map(el => {
//         el.style.top = offsetToY(getPosY(el)) + deltaY;
//       });
//
//       // Reset the nodes on the same row
//       // TODO: figure out to make this less jarring
//       nodes = this.findHorzNodes(getPosY(this.dragging));
//       nodes.map(el => {
//         el.style.left = offsetToX(getPosX(el));
//       });
//     }
//   }
//
//   handleEnd(ev) {
//     // TODO: refactor with above
//     if (this.dragging == null) {
//       return false;
//     }
//     if (ev.srcElement != this.dragging) {
//       console.log("OOPS");
//       debugger;
//       return false;
//     }
//
//     // calculate how much the mouse has moved from it's initial position
//     // assumption: all 4 borders have the same width.
//     const r = board.getBoundingClientRect();
//     const border = (board.offsetWidth - board.clientWidth) / 2;
//     // TODO: check if it's board's border or div's border that we care about
//     // here? Remember, div's border depends on window size.
//
//     const x = ev.x - r.x - border;
//     const y = ev.y - r.y - border;
//     let deltaX = x - this.eventStartX;
//     let deltaY = y - this.eventStartY;
//
//     // figure out which axis we are moving on
//     if (Math.abs(deltaX) > Math.abs(deltaY)) {
//       // round deltaX
//       const border = (board.offsetWidth - board.clientWidth);
//       // TODO: check if it's board's border or div's border that we care about
//       // here?
//       const r = board.getBoundingClientRect();
//       deltaX = Math.round(deltaX * 4 / (r.width-border));
//       console.log("MOVE HORZ BY: " + deltaX);
//
//       // First reset nodes on the same column
//       // TODO: figure out to make this less jarring
//       let nodes = this.findVertNodes(getPosX(this.dragging));
//       nodes.map(el => {
//         el.style.top = offsetToY(getPosY(el));
//       });
//
//       // Then grab all the nodes on the same row and update them
//       nodes = this.findHorzNodes(getPosY(this.dragging));
//       nodes.map(el => {
//         var t = getPosX(el) + deltaX;
//         if (t < -4) {
//           t += 12;
//         } else if (t >= 8) {
//           t -= 12;
//         }
//
//         // update view
//         el.style.left = offsetToX(t);
//
//         // update attribute
//         el["data-x"]=t;
//
//         // update divsMap
//         divsMap[offsetToStr(t, getPosY(el))] = el;
//       });
//
//       // TODO: handle wrap around!
//     } else {
//       // round deltay
//       const border = (board.offsetHeight - board.clientHeight);
//       // TODO: check if it's board's border or div's border that we care about
//       // here?
//       const r = board.getBoundingClientRect();
//       deltaY = Math.round(deltaY * 4 / (r.width-border));
//       console.log("MOVE VERY BY: " + deltaY);
//
//       // First reset nodes on the same row
//       // TODO: figure out to make this less jarring
//       let nodes = this.findHorzNodes(getPosY(this.dragging));
//       nodes.map(el => {
//         el.style.left = offsetToX(getPosX(el));
//       });
//
//       // Then grab all the nodes on the same column and update them
//       nodes = this.findVertNodes(getPosX(this.dragging));
//       nodes.map(el => {
//         var t = getPosY(el) + deltaY;
//         if (t < -4) {
//           t += 12;
//         } else if (t >= 8) {
//           t -= 12;
//         }
//
//         // update view
//         el.style.top = offsetToY(t);
//
//         // update attribute
//         el["data-y"]=t;
//
//         // update divsMap
//         divsMap[offsetToStr(getPosX(el), t)] = el;
//       });
//
//       // TODO: handle wrap around!
//     }
//     this.dragging = null;
//   }
//
//   findHorzNodes(offset) {
//     const r = [];
//     for (let i=-4; i<8; i++) {
//       r.push(divsMap[offsetToStr(i, offset)])
//     }
//     if (r.length != 12) {
//       console.log("WHAT?")
//       debugger;
//     }
//     return r;
//   }
//
//   findVertNodes(offset) {
//     const r = [];
//     for (let j=-4; j<8; j++) {
//       r.push(divsMap[offsetToStr(offset, j)])
//     }
//     if (r.length != 12) {
//       console.log("WHAT 2?")
//       debugger;
//     }
//     return r;
//   }
//
//   abort(ev) {
//     if (this.dragging == null) {
//       return false;
//     }
//     if (ev.srcElement != this.dragging) {
//       console.log("OOPS");
//       debugger;
//       return false;
//     }
//
//     // Reset the nodes on the same column
//     // TODO: figure out to make this less jarring
//     let nodes = this.findVertNodes(getPosX(this.dragging));
//     nodes.map(el => {
//       el.style.top = offsetToY(getPosY(el));
//     });
//
//     // Reset the nodes on the same row
//     // TODO: figure out to make this less jarring
//     nodes = this.findHorzNodes(getPosY(this.dragging));
//     nodes.map(el => {
//       el.style.left = offsetToX(getPosX(el));
//     });
//
//     this.dragging = null;
//   }
// }
//
// // // create SIZE * SIZE elements board
// // let SIZE = 4;
// // let arr = [];
// // let buttons = [];
// // let moveEnable = true;
// //
// // function init() {
// //   for (let i=0; i<SIZE; i++) {
// //     arr[i] = [];
// //     for (let j=0; j<SIZE; j++) {
// //       let v = 1 + (i*SIZE)+j;
// //       arr[i][j] = v;
// //     }
// //   }
// //   shuffle()
// //   for (let i=0; i<SIZE; i++) {
// //     for (let j=0; j<SIZE; j++) {
// //       createCell(i, j, arr[i][j]);
// //     }
// //   }
// //   markCorrect();
// // }
// //
// // function createCell(x, y, val) {
// //   _createCell(x, y, val);
// //   // create a hidden cell if this cell is on an edge
// //   if (x == 0) {
// //     _createCell(x+4, y, val);
// //     if (y == 0) {
// //       _createCell(x+4, y+4, val);
// //     } else if (y == 3) {
// //       _createCell(x+4, y-4, val);
// //     }
// //   } else if (x == 3) {
// //     _createCell(x-4, y, val);
// //     if (y == 0) {
// //       _createCell(x-4, y+4, val);
// //     } else if (y == 3) {
// //       _createCell(x-4, y-4, val);
// //     }
// //   }
// //   if (y == 0) {
// //     _createCell(x, y+4, val);
// //   } else if (y == 3) {
// //     _createCell(x, y-4, val);
// //   }
// // }
// //
// // function _createCell(x, y, val) {
// //   let div = document.createElement("div");
// //   div.innerText = val;
// //   div.style.left = (x * 16) + "vmin";
// //   div.style.top = (y * 16) + "vmin";
// //   board.appendChild(div);
// // }
// //
// // function handleKey(e) {
// //   switch (e.code) {
// //     case "ArrowLeft":
// //       console.log("ArrowLeft");
// //       move(0);
// //       break;
// //     case "ArrowUp":
// //       console.log("ArrowUp");
// //       move(1);
// //       break;
// //     case "ArrowDown":
// //       console.log("ArrowDown");
// //       move(2);
// //       break;
// //     case "ArrowRight":
// //       console.log("ArrowRight");
// //       move(3);
// //       break;
// //   }
// // }
// //
// //
// // function move(dir) {
// //   if (!moveEnable) {
// //     return;
// //   }
// //   moveEnable = false
// //   // step 1: disable moves
// //   // step 2: call moveAnimate for both rows/cols
// //   // step 3: call moveModel for both rows/cols
// //   // step 4: enable moves
// //   switch (dir) {
// //     case 0:
// //       // left
// //       moveAnimate(dir, () => {
// //         moveModel(dir);
// //         markCorrect();
// //         moveEnable = true;
// //       });
// //       break
// //     case 1:
// //       // up
// //       moveAnimate(dir, () => {
// //         moveModel(dir);
// //         markCorrect();
// //         moveEnable = true;
// //       });
// //       break
// //     case 2:
// //       // down
// //       moveAnimate(dir, () => {
// //         moveModel(dir);
// //         markCorrect();
// //         moveEnable = true;
// //       });
// //       break
// //     case 3:
// //       // right
// //       moveAnimate(dir, () => {
// //         moveModel(dir);
// //         markCorrect();
// //         moveEnable = true;
// //       });
// //       break
// //   }
// // }
// //
// // function moveAnimate(dir, continuation) {
// //   // step 1: find all the divs which are affected
// //   // step 2: update the top/left properties of the relevant divs
// //   // step 3: wrap divs around
// //   // step 4: call the continuation
// //   let divs = {};
// //   switch (dir) {
// //     case 0:
// //       // left
// //       for (let i=0; i<SIZE; i++) {
// //         divs[arr[i][0]] = true;
// //         divs[arr[i][1]] = true;
// //       }
// //       break;
// //     case 1:
// //       // up
// //       for (let i=0; i<SIZE; i++) {
// //         divs[arr[2][i]] = true;
// //         divs[arr[3][i]] = true;
// //       }
// //       break;
// //     case 2:
// //       // down
// //       for (let i=0; i<SIZE; i++) {
// //         divs[arr[0][i]] = true;
// //         divs[arr[1][i]] = true;
// //       }
// //       break;
// //     case 3:
// //       // right
// //       for (let i=0; i<SIZE; i++) {
// //         divs[arr[i][2]] = true;
// //         divs[arr[i][3]] = true;
// //       }
// //       break;
// //   }
// //   let nodes = [...board.childNodes].filter(n => divs[n.innerText]);
// //   alok = nodes;
// //   let n = 0;
// //   let f = () => {
// //     if (n == 16) {
// //       nodes.map(x => {
// //         let n = parseInt(x.style.left);
// //         // this is quite ugly...
// //         if (n == -32) {
// //           let t = (parseInt(x.style.top) / 16 + 4)%4;
// //           x.style.left = "64vmin"
// //           x.innerText = arr[1][t];
// //         }
// //         if (n == 80) {
// //           let t = (parseInt(x.style.top) / 16 + 4)%4;
// //           x.style.left = "-16vmin"
// //           x.innerText = arr[2][t];
// //         }
// //         n = parseInt(x.style.top);
// //         if (n == -32) {
// //           let t = (parseInt(x.style.left) / 16 + 4)%4;
// //           x.style.top = "64vmin"
// //           x.innerText = arr[t][1];
// //         }
// //         if (n == 80) {
// //           let t = (parseInt(x.style.left) / 16 + 4)%4;
// //           x.style.top = "-16vmin"
// //           x.innerText = arr[t][2];
// //         }
// //       });
// //       continuation();
// //     } else {
// //       n++;
// //       switch (dir) {
// //         case 0:
// //           // left
// //           nodes.map(x => x.style.left = parseInt(x.style.left) - 1 + "vmin");
// //           break;
// //         case 1:
// //           // up
// //           nodes.map(x => x.style.top = parseInt(x.style.top) - 1 + "vmin");
// //           break;
// //         case 2:
// //           // down
// //           nodes.map(x => x.style.top = parseInt(x.style.top) + 1 + "vmin");
// //           break;
// //         case 3:
// //           // right
// //           nodes.map(x => x.style.left = parseInt(x.style.left) + 1 + "vmin");
// //           break;
// //       }
// //       setTimeout(f, 20);
// //     }
// //   }
// //   f();
// // }
// //
// // function markCorrect() {
// //   let divs = {};
// //   for (let i=0; i<SIZE; i++) {
// //     for (let j=0; j<SIZE; j++) {
// //       if (arr[i][j] == 1 + j * 4 + i) {
// //         divs[arr[i][j]] = true;
// //       }
// //     }
// //   }
// //   [...board.childNodes].map(n => n.className = divs[n.innerText] ? "good" : "bad");
// // }
// //
// // function moveModel(dir) {
// //   let t = 0;
// //   switch (dir) {
// //     case 0:
// //       // left
// //       t = arr[0][0];
// //       for (let j=0; j<(SIZE-1); j++) {
// //         arr[j][0] = arr[j+1][0];
// //       }
// //       arr[SIZE-1][0] = t;
// //
// //       t = arr[0][1];
// //       for (let j=0; j<(SIZE-1); j++) {
// //         arr[j][1] = arr[j+1][1];
// //       }
// //       arr[SIZE-1][1] = t;
// //       break;
// //     case 1:
// //       // up
// //       t = arr[2][0];
// //       for (let j=0; j<(SIZE-1); j++) {
// //         arr[2][j] = arr[2][j+1];
// //       }
// //       arr[2][SIZE-1] = t;
// //
// //       t = arr[3][0];
// //       for (let j=0; j<(SIZE-1); j++) {
// //         arr[3][j] = arr[3][j+1];
// //       }
// //       arr[3][SIZE-1] = t;
// //       break;
// //     case 2:
// //       // down
// //       t = arr[0][SIZE-1];
// //       for (let j=SIZE-1; j>0; j--) {
// //         arr[0][j] = arr[0][j-1];
// //       }
// //       arr[0][0] = t;
// //
// //       t = arr[1][SIZE-1];
// //       for (let j=SIZE-1; j>0; j--) {
// //         arr[1][j] = arr[1][j-1];
// //       }
// //       arr[1][0] = t;
// //       break;
// //     case 3:
// //       // right
// //       t = arr[SIZE-1][2];
// //       for (let j=SIZE-1; j>0; j--) {
// //         arr[j][2] = arr[j-1][2];
// //       }
// //       arr[0][2] = t;
// //
// //       t = arr[SIZE-1][3];
// //       for (let j=SIZE-1; j>0; j--) {
// //         arr[j][3] = arr[j-1][3];
// //       }
// //       arr[0][3] = t;
// //       break;
// //   }
// // }
// //
// // document.addEventListener('keyup', handleKey);
// // init();
//
// //init([["A", "B", "A", "B"], ["B", "A", "B", "A"], ["A", "B", "A", "B"], ["B", "A", "B", "A"]])
