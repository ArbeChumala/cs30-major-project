let grid;
let checkedSpaces = [];

let playerMovesInterval;

let colourArray = ["#F54E29", "#F89012", "#F7B926", "#90BE6D", "#43AA8B", "#577590"];
let shared;

const SQUARE_DIMENSIONS = 75;
const GAME_WIDTH= 8;
const GAME_HEIGHT = 7;

const PLAYER_ONE = -1;
const PLAYER_TWO = -2;

let yourPlayer;

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
    theSequence += str(Math.round(random(colourArray.length-1)));
  }
  return theSequence;
}

function setupGrid(){
  let myGrid = generateEmptyGrid();

  for(let y = 0; y<GAME_HEIGHT; y++){
    for(let x = 0; x<GAME_WIDTH; x++){
      myGrid[y][x] = int(shared.colourSequence[GAME_WIDTH*y + x]);
    }
  }

  myGrid[GAME_HEIGHT -1][0] = PLAYER_ONE;
  myGrid[0][GAME_WIDTH-1] = PLAYER_TWO;

  return myGrid;
}

function preload(){
  partyConnect(
    "wss://demoserver.p5party.org", 
    "our-amazing-filler-game", 
    "main"
  );
  tempSequence = generateColourSequence();
  shared = partyLoadShared(
    "shared", 
    {
      colourSequence: tempSequence,
      desiredColour: 0,
      currentPlayer: PLAYER_ONE,
    }
  );
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  yourPlayer = partyIsHost() ? PLAYER_ONE : PLAYER_TWO;
  grid = setupGrid();
  partySubscribe("play", playerMoves);
}

function draw(){
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

      square(x, y, SQUARE_DIMENSIONS);
    }
  }
}

function keyPressed(){
  if(shared.currentPlayer === yourPlayer){
    partyUnsubscribe("play");
    partyEmit("play");
    partySubscribe("play", playerMoves);
    shared.desiredColour = int(key);
    playerMovesInterval = setInterval(playerMoves, 500);
  }
}

function toggleCurrentPlayer(){
  shared.currentPlayer = shared.currentPlayer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
}

function playerMoves(){
  clearInterval(playerMovesInterval);
  console.log(shared.desiredColour);
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
    else if (grid[y][x] === shared.desiredColour){
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