let myRoom = undefined;
let userInput;
let botModeButton;
let sameScreenButton;

let mode;

let poppins;
let frameImg;
let frameShadowImg;
let squareShadowImg;

let grid;
let fakeGrid;
let checkedSpaces = [];

let colourArray = ["#FF50A4", "#FFAE00", "#FFEA00", "#00FFBB", "#00AEFF", "#984AFF"];
let shared;

let desiredColour;

let buttons = [];
let scoreDisplayers = [];

let playerOneColour;
let playerTwoColour;


let squareDimensions;
const GAME_WIDTH= 8;
const GAME_HEIGHT = 7;
const BUTTON_WIDTH = 60;
const BUTTON_GAP = 20;

const PLAYER_ONE = -1;
const PLAYER_TWO = -2;

let currentPlayer = PLAYER_ONE;


let yourPlayer;

let pixelRatio;
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

function setupCanvas(){
  createCanvas(windowWidth, windowHeight);
  squareDimensions = height / 15;
  pixelRatio = 8*squareDimensions/151;
}

function windowResized(){
  setupCanvas();
}

function setup(){
  setupCanvas();
  noLoop();
  noSmooth();

  background("#948d8a");

  textSize(100);
  textAlign(CENTER);
  textFont(poppins);
  fill(255);
  text("Filler", width/2, height/2 - 150);

  textSize(40);
  text("Enter A Room", width/2, height/2);
  imageMode(CENTER);
  userInput = createInput('main');
  userInput.position(width/2, height/2+25);
  userInput.center("horizontal");

  botModeButton = createButton('Play With A Bot');
  botModeButton.position(width/2, height/2+100);
  botModeButton.center("horizontal");
  botModeButton.mousePressed(startBotMode);

  sameScreenButton = createButton('Play Locally With A Friend');
  sameScreenButton.position(width/2, height/2+175);
  sameScreenButton.center("horizontal");
  sameScreenButton.mousePressed(startPlayerMode);
}

function draw(){
  if(myRoom || mode){
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

function startBotMode(){
  mode = "pvb";
  setupGame();
}

function startPlayerMode(){
  mode = "pvp";
  setupGame();
}

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
    let someButton = new Button(height/2 + 5*squareDimensions, i);
    buttons.push(someButton);
  }
  for(let i = 0; i<2; i++){
    let someDisplayer = new ScoreDisplayer(-(i+1));
    scoreDisplayers.push(someDisplayer);
  }

  if(myRoom){
    yourPlayer = partyIsHost() ? PLAYER_ONE : PLAYER_TWO;
    grid = setupGrid(shared.colourSequence, true);
  }
  else if (mode){
    let theSequence = generateColourSequence();
    grid = setupGrid(theSequence, true);
  }

  removeElements();
  loop();
}

function toggleCurrentPlayer(){
  if(myRoom){
    shared.currentPlayer = shared.currentPlayer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  }
  else if(mode){
    currentPlayer = currentPlayer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  }
}

function botMoves(){
  let mostPoints = 0;
  let winningIndex;
  let points;

  for(let i = 0; i<colourArray.length; i++){
    if(i !== playerOneColour && i !==playerTwoColour){
      
      fakeGrid = structuredClone(grid);
      points = 0;

      desiredColour = i;
      checkedSpaces = [];

      changeBoxes(GAME_WIDTH-1, 0, fakeGrid);
  
      for(let iy = 0; iy<GAME_HEIGHT; iy++){
        for(let ix = 0; ix<GAME_WIDTH; ix++){
  
          if(fakeGrid[iy][ix] === PLAYER_TWO){
            points++;
          }
  
        }
      }
  
      if(points > mostPoints){
        mostPoints = points;
        winningIndex = i;
      }
    }
  }

  playerMoves({colour: winningIndex, player: PLAYER_TWO});
}

function playerMoves(object){
  desiredColour = object.colour;

  if(object.player === PLAYER_ONE){
    playerOneColour = desiredColour;
    checkedSpaces = [];
    changeBoxes(0, GAME_HEIGHT-1, grid);
  }
  else{
    playerTwoColour = desiredColour;
    checkedSpaces = [];
    changeBoxes(GAME_WIDTH-1, 0, grid);
  }

  for(let displayer of scoreDisplayers){
    displayer.updateScore();
  }
  
  if(mode === "pvb" && currentPlayer === PLAYER_ONE){
    setTimeout(botMoves, 500);
  }

  toggleCurrentPlayer();
}

function changeBoxes(x, y, myGrid){
  if(x < GAME_WIDTH && x >=0 && y<GAME_HEIGHT && y>=0){
    if(myRoom){
      if(myGrid[y][x] === shared.currentPlayer && !checkedSpaces.includes(`${x}${y}`)){
        checkedSpaces.push(`${x}${y}`);
        changeNeighbours(x, y, myGrid);
      }
      else if (myGrid[y][x] === desiredColour){
        checkedSpaces.push(`${x}${y}`);
        myGrid[y][x] = shared.currentPlayer;
        changeNeighbours(x, y, myGrid);
      }
    }
    else if(mode){
      if(myGrid[y][x] === currentPlayer && !checkedSpaces.includes(`${x}${y}`)){
        checkedSpaces.push(`${x}${y}`);
        changeNeighbours(x, y, myGrid);
      }
      else if (myGrid[y][x] === desiredColour){
        checkedSpaces.push(`${x}${y}`);
        myGrid[y][x] = currentPlayer;
        changeNeighbours(x, y, myGrid);
      }
    }
  }
}

function changeNeighbours(x, y, myGrid){
  changeBoxes(x, y+1, myGrid);
  changeBoxes(x, y-1, myGrid);
  changeBoxes(x+1, y, myGrid);
  changeBoxes(x-1, y, myGrid);
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
      let x = (width - squareDimensions*GAME_WIDTH)/2 + squareDimensions*ix;
      let y = (height - squareDimensions*GAME_HEIGHT)/2 + squareDimensions*iy;

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
      square(x, y, squareDimensions);
    }
  }
}

function displayFrame(){
  imageMode(CENTER);
  image(frameShadowImg, width/2 - SHADOW_OFFSET, height/2 + SHADOW_OFFSET, frameShadowImg.width*pixelRatio, frameShadowImg.height*pixelRatio);
  image(frameShadowImg, width/2 - 0.5*SHADOW_OFFSET, height/2 + 0.5*SHADOW_OFFSET, frameShadowImg.width*pixelRatio, frameShadowImg.height*pixelRatio);
  image(frameImg, width/2, height/2, frameImg.width*pixelRatio, frameImg.height*pixelRatio);
}

function displayButtons(){
  for(let button of buttons){
    if(mode === "pvp" || myRoom && yourPlayer === shared.currentPlayer || mode === "pvb" && currentPlayer === PLAYER_ONE){
      button.update();
      button.show();
    }
  }
}

function displayScore(){
  fill(255);
  textSize(100);
  text("Filler", width/2, height/2 - 5*squareDimensions);
  textSize(15);
  text("Absorb all the colour!", width/2, height/2-4.5*squareDimensions);

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
    this.y = height/2 + 5*squareDimensions;
    this.x = width/2-(2.5*BUTTON_WIDTH + 2.5*BUTTON_GAP) + this.colourIndex*(BUTTON_WIDTH+BUTTON_GAP);

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
    if(myRoom && this.isSelectable && 
        shared.currentPlayer === yourPlayer &&
        Math.abs(this.x - mouseX) < BUTTON_WIDTH/2 && 
        Math.abs(this.y - mouseY) < BUTTON_WIDTH/2){

      if(myRoom){
        partyEmit("play", {
          colour: this.colourIndex,
          player: shared.currentPlayer,
        });
      }
      this.gradientTime = true;
    }

    else if(this.isSelectable && mode &&  
            Math.abs(this.x - mouseX) < BUTTON_WIDTH/2 && 
            Math.abs(this.y - mouseY) < BUTTON_WIDTH/2){
      playerMoves({
        colour: this.colourIndex,
        player: currentPlayer,
      });
    }
  }
}

class ScoreDisplayer{
  constructor(player){
    this.player = player;
    this.size = this.player === PLAYER_ONE ? SCORE_BOX_WIDTH : 0.7*SCORE_BOX_WIDTH;
    this.score = 1;

    if(this.player === PLAYER_ONE){
      this.x = width/2 - squareDimensions*6;
    }
    else{
      this.x = width/2 + squareDimensions*6;
    }
    this.y = height/2;
  }
  
  show(){
    fill(colourArray[this.colour]);
    stroke("#5c5550");
    strokeWeight(4);
    rectMode(CENTER);
    square(this.x, this.y, this.size);
    noStroke();

    textSize(40);
    text(this.score, this.x, this.y + 100);
  }

  update(){
    this.updatePosition();
    this.updateColour();
    this.updateSize();
  }

  updatePosition(){
    if(this.player === PLAYER_ONE){
      this.x = width/2 - squareDimensions*6;
    }
    else{
      this.x = width/2 + squareDimensions*6;
    }
    this.y = height/2;
  }

  updateColour(){
    this.colour = this.player === PLAYER_ONE ? playerOneColour : playerTwoColour;
  }

  updateSize(){
    if(myRoom){
      if(shared.currentPlayer === this.player && this.size < SCORE_BOX_WIDTH){
        this.size ++;
      }
      else if(shared.currentPlayer !== this.player && this.size > 0.7*SCORE_BOX_WIDTH){
        this.size--;
      }
    }
    else if(mode){
      if(currentPlayer === this.player && this.size < SCORE_BOX_WIDTH){
        this.size ++;
      }
      else if(currentPlayer !== this.player && this.size > 0.7*SCORE_BOX_WIDTH){
        this.size--;
      }
    }
  }

  updateScore(){
    if(myRoom && shared.currentPlayer === this.player || mode && currentPlayer === this.player){
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