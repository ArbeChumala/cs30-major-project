let theGrid;
let desiredColour = 3;
let checkedSpaces = [];

let colourSequence = "";

const SQUARE_DIMENSIONS = 100;
const GAME_WIDTH= 8;
const GAME_HEIGHT = 7;

function generateEmptyGrid(){
  let newGrid = [];
  for(let y = 0; y<GAME_HEIGHT; y++){
    newGrid.push([]);
    for(let x = 0; x<GAME_WIDTH; x++){
      newGrid[y].push([]);
    }
  }
  newGrid[GAME_HEIGHT-1][0] = "y";
  return newGrid;
}

function generateColourSequence(){
  let theSequence = "";

  for(let i = 0; i<GAME_WIDTH*GAME_HEIGHT; i++){
    theSequence += str(Math.round(random(6)));
  }
  return theSequence;
}

function preload(){
  partyConnect(
    "wss://demoserver.p5party.org", 
    "our-amazing-filler-game", 
    "main"
  );
  tempSequence = generateColourSequence();
  colourSequence = partyLoadShared("shared", {colourSequence: tempSequence});
}

function setup(){
  createCanvas(windowWidth, windowHeight);
}

// function draw(){
//   for(let iy = 0; iy<GAME_HEIGHT; iy++){
//     for(let ix = 0; ix<GAME_WIDTH; ix++){
//       let x = (width - SQUARE_DIMENSIONS*GAME_WIDTH)/2 + SQUARE_DIMENSIONS*ix;
//       let y = (height - SQUARE_DIMENSIONS*GAME_HEIGHT)/2 + SQUARE_DIMENSIONS*iy;

//       if(theGrid[iy][ix] !== "y"){
//         fill(255/6*theGrid[iy][ix]);
//       }
//       else{
//         fill("red");
//       }
//       square(x, y, SQUARE_DIMENSIONS);
//     }
//   }
// }

// function mouseClicked(){
//   playerMoves();
// }

// function playerMoves(){
//   changeBoxes(0, GAME_HEIGHT-1);
//   checkedSpaces = [];
// }

// function changeBoxes(x, y){
//   if(x < GAME_WIDTH && x >=0 && y<GAME_HEIGHT && y>=0){
//     if(theGrid[y][x] === "y" && !checkedSpaces.includes(`${x}${y}`)){
//       checkedSpaces.push(`${x}${y}`);
//       changeNeighbours(x, y);
//     }
//     else if (theGrid[y][x] === desiredColour){
//       checkedSpaces.push(`${x}${y}`);
//       theGrid[y][x] = "y";
//       changeNeighbours(x, y);
//     }
//   }
// }

// function changeNeighbours(x, y){
//   changeBoxes(x, y+1);
//   changeBoxes(x, y-1);
//   changeBoxes(x+1, y);
//   changeBoxes(x-1, y);
// }