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
    stroke(255);
    strokeWeight(3);
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
  grid = setupGrid();
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