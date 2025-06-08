let myRoom = undefined;
let userInput;

let poppins;
let frameImg;
let frameShadowImg;
let squareShadowImg;

let grid;
let checkedSpaces = [];

let colourArray = ["#FF50A4", "#FFAE00", "#FFEA00", "#00FFBB", "#00AEFF", "#984AFF"];
let shared;

let desiredColour;

let buttons = [];
let scoreDisplayers = [];

let playerOneColour;
let playerTwoColour;

const SQUARE_DIMENSIONS = 60;
const GAME_WIDTH= 8;
const GAME_HEIGHT = 7;
const BUTTON_WIDTH = 60;
const BUTTON_GAP = 20;

const PLAYER_ONE = -1;
const PLAYER_TWO = -2;

let yourPlayer;

const PIXEL_RATIO = 8*SQUARE_DIMENSIONS/151;
const SHADOW_OFFSET = 20;
const SCORE_BOX_WIDTH = 80;

//-----------------------------------------------------------------------------------------------
// automatic and player-input functions
//-----------------------------------------------------------------------------------------------

function preload(){
  poppins = loadFont("assets/fonts/bold-poppins.ttf");
  frameImg = loadImage("assets/images/frame.png");
  frameShadowImg = loadImage("assets/images/outer-shadow.png");
  squareShadowImg = loadImage("assets/images/square-shadow.png");
}

function setup(){
  noLoop();
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  imageMode(CENTER);
  userInput = createInput('main');
  userInput.center();
  background("#948d8a");
  textSize(100);
  textAlign(CENTER);
  textFont(poppins);
  fill(255);
  text("Join Room", width/2, height/2 - 100);
}

function draw(){
  if(myRoom){
    background("#948d8a");
    displayTiles();
    displayFrame();
    displayButtons();
    displayScore();
  }
}

function keyPressed(){
  if (key === "Enter" && !myRoom){
    startParty();
  }
}

function mousePressed(){
  for(let button of buttons){
    button.checkIfPressed();
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
  for(let i = 0; i<colourArray.length; i++){
    let someButton = new Button(height/2 + 300, i);
    buttons.push(someButton);
  }
  for(let i = 0; i<2; i++){
    let someDisplayer = new ScoreDisplayer(-(i+1));
    scoreDisplayers.push(someDisplayer);
  }
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
    playerOneColour = desiredColour;
    changeBoxes(0, GAME_HEIGHT-1);
    checkedSpaces = [];
  }
  else{
    playerTwoColour = desiredColour;
    changeBoxes(GAME_WIDTH-1, 0);
    checkedSpaces = [];
  }

  for(let displayer of scoreDisplayers){
    displayer.updateScore();
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
      theSequence += str(Math.floor(random(0,3)));
    }
    else{
      theSequence += str(Math.floor(random(3,6)));
    }
  }

  return theSequence;
}

function setupGrid(theSequence, isForReal){
  let myGrid = generateEmptyGrid();

  for(let y = 0; y<GAME_HEIGHT; y++){
    for(let x = 0; x<GAME_WIDTH; x++){
      myGrid[y][x] = int(theSequence[GAME_WIDTH*y + x]);
    }
  }

  if(isForReal){
    playerOneColour = myGrid[GAME_HEIGHT -1][0];
    playerTwoColour = myGrid[0][GAME_WIDTH-1];

    myGrid[GAME_HEIGHT -1][0] = PLAYER_ONE;
    myGrid[0][GAME_WIDTH-1] = PLAYER_TWO;
  }

  return myGrid;
}

function displayTiles(){
  for(let iy = 0; iy<GAME_HEIGHT; iy++){
    for(let ix = 0; ix<GAME_WIDTH; ix++){
      let x = (width - SQUARE_DIMENSIONS*GAME_WIDTH)/2 + SQUARE_DIMENSIONS*ix;
      let y = (height - SQUARE_DIMENSIONS*GAME_HEIGHT)/2 + SQUARE_DIMENSIONS*iy;

      if(grid[iy][ix] === PLAYER_ONE){
        if(str(playerOneColour) === playerOneColour){
          fill(playerOneColour);
        }
        else{
          fill(colourArray[playerOneColour]);
        }
      }
      else if(grid[iy][ix] === PLAYER_TWO){
        if(str(playerTwoColour) === playerTwoColour){
          fill(playerTwoColour);
        }
        else{
          fill(colourArray[playerTwoColour]);
        }
      }
      else{
        fill(colourArray[grid[iy][ix]]);
      }
      noStroke();
      rectMode(CORNER);
      square(x, y, SQUARE_DIMENSIONS);
    }
  }
}

function displayFrame(){
  imageMode(CENTER);
  image(frameShadowImg, width/2 - SHADOW_OFFSET, height/2 + SHADOW_OFFSET, frameShadowImg.width*PIXEL_RATIO, frameShadowImg.height*PIXEL_RATIO);
  image(frameShadowImg, width/2 - 0.5*SHADOW_OFFSET, height/2 + 0.5*SHADOW_OFFSET, frameShadowImg.width*PIXEL_RATIO, frameShadowImg.height*PIXEL_RATIO);
  image(frameImg, width/2, height/2, frameImg.width*PIXEL_RATIO, frameImg.height*PIXEL_RATIO);
}

function displayButtons(){
  for(let button of buttons){
    button.update();
    button.show();
  }
}

function displayScore(){
  for(let displayer of scoreDisplayers){
    displayer.update();
    displayer.show();
  }
}

//-----------------------------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------------------------
class Button{
  constructor(y, colourIndex){
    this.y = y;
    this.width = BUTTON_WIDTH;
    this.colourIndex = colourIndex;
    this.isSelectable;
    this.gradientTime = false;
  }

  show(){
    this.x = width/2-(2.5*BUTTON_WIDTH + 2.5*BUTTON_GAP) + this.colourIndex*(BUTTON_WIDTH+BUTTON_GAP);

    fill(colourArray[this.colourIndex]);
    stroke("#5c5550");
    strokeWeight(4);
    rectMode(CENTER);
    imageMode(CENTER);
    image(squareShadowImg, this.x - 0.5*SHADOW_OFFSET, this.y + 0.5*SHADOW_OFFSET, this.width, this.width);
    image(squareShadowImg, this.x - 0.25*SHADOW_OFFSET, this.y + 0.25*SHADOW_OFFSET, this.width, this.width);
    square(this.x, this.y, this.width);

    if(!this.isSelectable){
      fill(10, 10, 10, 100);
      square(this.x, this.y, this.width);
    }

    noStroke();
  }

  update(){
    this.isSelectable = this.colourIndex !== playerOneColour && this.colourIndex !== playerTwoColour;

    if(this.isSelectable){
      if(this.gradientTime){
        this.width -= 0.5;
        this.gradientTime = this.width < BUTTON_WIDTH*0.95;
      }
      else{
        this.width =  BUTTON_WIDTH;
      }
    }
    else{
      if(this.gradientTime){
        this.width += 0.5;
        this.gradientTime = this.width < BUTTON_WIDTH*0.75;
      }
      else{
        this.width = 0.7*BUTTON_WIDTH;
      }
    }
  }

  checkIfPressed(){
    if(this.isSelectable && 
        shared.currentPlayer === yourPlayer &&
        Math.abs(this.x - mouseX) < BUTTON_WIDTH/2 && 
        Math.abs(this.y - mouseY) < BUTTON_WIDTH/2){

      partyEmit("play", {colour: this.colourIndex});
      this.gradientTime = true;
    }
  }
}

class ScoreDisplayer{
  constructor(player){
    this.player = player;
    this.score = 1;

    if(this.player === PLAYER_ONE){
      this.x = width/2 - 350;
    }
    else{
      this.x = width/2 + 350;
    }
    this.y = height/2;
  }
  
  show(){
    fill(colourArray[this.colour]);
    stroke("#5c5550");
    strokeWeight(4);
    rectMode(CENTER);
    square(this.x, this.y, BUTTON_WIDTH);
    noStroke();

    textSize(40);
    text(this.score, this.x, this.y + 100);
  }

  update(){
    this.updateColour();
    this.updateSize();
  }

  updateColour(){
    this.colour = this.player === PLAYER_ONE ? playerOneColour : playerTwoColour;
  }

  updateSize(){
    this.size = shared.currentPlayer === this.player ? SCORE_BOX_WIDTH : 0.5*SCORE_BOX_WIDTH;
  }

  updateScore(){
    if(shared.currentPlayer === this.player){
      let score = 0;
  
      for(let y = 0; y<GAME_HEIGHT; y++){
        for(let x = 0; x<GAME_WIDTH; x++){
          if(grid[y][x] === this.player){
            score ++;
          }
        }
      }
  
      this.score = score;
    }
  }
}