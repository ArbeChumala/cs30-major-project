let myRoom = undefined;
let userInput;

let poppins;

let grid;
let checkedSpaces = [];

let colourArray = ["#F54E29", "#F89012", "#F7B926", "#90BE6D", "#43AA8B", "#577590"];
let shared;

let desiredColour;

const SQUARE_DIMENSIONS = 75;
const GAME_WIDTH= 8;
const GAME_HEIGHT = 7;

const PLAYER_ONE = -1;
const PLAYER_TWO = -2;

let yourPlayer;

//-----------------------------------------------------------------------------------------------
// automatic and player-input functions
//-----------------------------------------------------------------------------------------------

function preload(){
  poppins = loadFont("assets/fonts/bold-poppins.ttf");
}

function setup(){
  noLoop();
  createCanvas(windowWidth, windowHeight);
  userInput = createInput('main');
  userInput.center();
  background(120);
  textSize(100);
  textAlign(CENTER);
  textFont(poppins);
  fill(255);
  text("Join Room", width/2, height/2 - 100);
}

function draw(){
  if(myRoom){
    background(120);
    for(let iy = 0; iy<GAME_HEIGHT; iy++){
      for(let ix = 0; ix<GAME_WIDTH; ix++){
        let x = (width - SQUARE_DIMENSIONS*GAME_WIDTH)/2 + SQUARE_DIMENSIONS*ix;
        let y = (height - SQUARE_DIMENSIONS*GAME_HEIGHT)/2 + SQUARE_DIMENSIONS*iy;
  
        if(grid[iy][ix] === PLAYER_ONE){
          fill("black");
        }
        else if(grid[iy][ix] === PLAYER_TWO){
          fill("white");
        }
        else{
          fill(colourArray[grid[iy][ix]]);
        }
        noStroke();
        square(x, y, SQUARE_DIMENSIONS);
      }
    }
  }
}

function keyPressed(){
  if(myRoom && shared.currentPlayer === yourPlayer){
    theColour = int(key);
    partyEmit("play", {colour: theColour});
  }
  else if (key === "Enter" && !myRoom){
    startParty();
    
  }
}

//-----------------------------------------------------------------------------------------------
//functions that are solely triggered by other functions
//-----------------------------------------------------------------------------------------------

function startParty(){
  myRoom = userInput.value();
  partyConnect(
    "wss://demoserver.p5party.org", 
    "our-amazing-filler-game", 
    myRoom
  );

  partySubscribe("play", playerMoves);

  tempSequence = generateColourSequence();
  
  shared = partyLoadShared(
    "shared", 
    {
      colourSequence: tempSequence,
      currentPlayer: PLAYER_ONE,
    },
    setupGame,
  );
}

function setupGame(){
  yourPlayer = partyIsHost() ? PLAYER_ONE : PLAYER_TWO;
  grid = setupGrid(shared.colourSequence, true);
  removeElements();
  loop();
}

function toggleCurrentPlayer(){
  shared.currentPlayer = shared.currentPlayer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

function playerMoves(object){
  desiredColour = object.colour;
  if(shared.currentPlayer === PLAYER_ONE){
    changeBoxes(0, GAME_HEIGHT-1);
    checkedSpaces = [];
  }
  else{
    changeBoxes(GAME_WIDTH-1, 0);
    checkedSpaces = [];
  }
  toggleCurrentPlayer();
}

function changeBoxes(x, y){
  if(x < GAME_WIDTH && x >=0 && y<GAME_HEIGHT && y>=0){
    if(grid[y][x] === shared.currentPlayer && !checkedSpaces.includes(`${x}${y}`)){
      checkedSpaces.push(`${x}${y}`);
      changeNeighbours(x, y);
    }
    else if (grid[y][x] === desiredColour){
      checkedSpaces.push(`${x}${y}`);
      grid[y][x] = shared.currentPlayer;
      changeNeighbours(x, y);
    }
  }
}

function changeNeighbours(x, y){
  changeBoxes(x, y+1);
  changeBoxes(x, y-1);
  changeBoxes(x+1, y);
  changeBoxes(x-1, y);
}

function generateEmptyGrid(){
  let newGrid = [];
  for(let y = 0; y<GAME_HEIGHT; y++){
    newGrid.push([]);
    for(let x = 0; x<GAME_WIDTH; x++){
      newGrid[y].push(0);
    }
  }
  return newGrid;
}

function generateColourSequence(){
  let theSequence = "";

  for(let i = 0; i<GAME_WIDTH*GAME_HEIGHT; i++){
    let pretendX = i%GAME_WIDTH;
    let pretendY = Math.floor(i/GAME_WIDTH);

    let isWarmColoured = (pretendX + pretendY)%2 === 0;

    if(isWarmColoured){
      theSequence += str(Math.round(random(0,2.5)));
    }
    else{
      theSequence += str(Math.round(random(2.5,5)));
    }
  }

  return theSequence;
}

// function demoTheSequence(theSequence){
//   testingGrid = setupGrid(theSequence, false);
//   newSequence = "";
  
//   for(let y = 0; y<GAME_HEIGHT; y++){
//     for(let x = 0; x<GAME_WIDTH; x++){
//       if(checkForTwins(testingGrid, x, y)){
//         testingGrid[y][x] = colourArray.length-1;
//         newSequence += str(colourArray.length-1);
//       }
//       else{
//         newSequence += str(testingGrid[y][x]);
//       }
//     }
//   }

//   return newSequence;
// }

// function checkForTwins(myGrid, x, y){
//   let matchesFound = 0;

//   changes = [
//     [x, y+1],
//     [x, y-1],
//     [x+1, y],
//     [x-1, y]
//   ];

//   for(let change of changes){
//     if( change[1] >=0 && change[1] < GAME_HEIGHT &&
//         change[0] >=0 && change[0] < GAME_HEIGHT &&
//         myGrid[change[1]][change[0]] !== colourArray.length-1 &&
//         myGrid[y][x] === myGrid[change[1]][change[0]]){
//       matchesFound ++;
//     }
//   }

//   return matchesFound;
// }

function setupGrid(theSequence, isForReal){
  let myGrid = generateEmptyGrid();

  for(let y = 0; y<GAME_HEIGHT; y++){
    for(let x = 0; x<GAME_WIDTH; x++){
      myGrid[y][x] = int(theSequence[GAME_WIDTH*y + x]);
    }
  }

  if(isForReal){
    myGrid[GAME_HEIGHT -1][0] = PLAYER_ONE;
    myGrid[0][GAME_WIDTH-1] = PLAYER_TWO;
  }

  return myGrid;
}