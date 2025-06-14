// Final Project - Filler Game
// Samuel Wardell & Arbe Chumala
// June 13th, 2025
//
// Description of coding application / Challenges
// - Used recursion to go through potential captures and display
// - Creation of bot to play against player



let myRoom = undefined;
let userInput;
let botModeButton;
let sameScreenButton;

let mode;
let winDisplayer;
let gameOver = false;

let poppins;
let frameImg;
let frameShadowImg;
let squareShadowImg;
let mouseClick;
let jazzMusic;

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

//loading assets
function preload(){
  jazzMusic = loadSound("assets/sounds/jazz-music.mp3");
  poppins = loadFont("assets/fonts/bold-poppins.ttf");
  frameImg = loadImage("assets/images/frame.png");
  frameShadowImg = loadImage("assets/images/outer-shadow.png");
  squareShadowImg = loadImage("assets/images/square-shadow.png");
  mouseClick = loadSound("assets/sounds/button-sound.m4a");
}

//resets the canvas for dynamic resizing
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

  //title display
  textSize(100);
  textAlign(CENTER);
  textFont(poppins);
  fill(255);
  text("Filler", width/2, height/2 - 150);

  //instructions to join room
  textSize(25);
  text("Press Enter to Join A Room", width/2, height/2);
  imageMode(CENTER);

  //creates html elements to join different modes
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
  //only draws if they are in a p5 party room or have selected a game mode
  if(myRoom || mode){
    background("#948d8a");

    //display functions
    displayTiles();
    displayFrame();
    displayButtons();
    displayScore();

    //determines winner if not game over, otherwise win screen displays
    if(!gameOver){
      determineWinner();
    }
    else{
      displayWinScreen();
    }
  }
}

function keyPressed(){
  //pressing enter will join them to a party
  if (key === "Enter" && !myRoom){
    startParty();
  }
}

function mousePressed(){
  //plays music
  if ((myRoom || mode) && !jazzMusic.isPlaying()){
    jazzMusic.setVolume(0.5);
    jazzMusic.loop();
  }

  //plays a mouseclick sound
  mouseClick.play();

  //checks which buttons are pressed
  for(let button of buttons){
    button.checkIfPressed();
  }
}

//-----------------------------------------------------------------------------------------------
//functions that are solely triggered by other functions
//-----------------------------------------------------------------------------------------------

function determineWinner(){
  //uses the score displayer to get the score for each player
  let playerOneScore = scoreDisplayers[0].score;
  let playerTwoScore = scoreDisplayers[1].score;

  //if all tiles are claimed by players, then someone has won
  if(playerOneScore + playerTwoScore === GAME_WIDTH*GAME_HEIGHT){

    //determines winner based on who has the most wins
    if(playerOneScore>playerTwoScore){
      winDisplayer = new WinDisplayer(PLAYER_ONE);
    }
    else if(playerTwoScore > playerOneScore){
      winDisplayer = new WinDisplayer(PLAYER_TWO);
    }
    else if(playerTwoScore === playerOneScore){
      winDisplayer = new WinDisplayer("TIE");
    }

    //changes game state
    gameOver = true;
  }
}

function displayWinScreen(){
  //displays win screen from the class
  winDisplayer.update();
  winDisplayer.show();
}

function startBotMode(){
  //changes game mode and sets up the game
  mode = "pvb";
  setupGame();
}

function startPlayerMode(){
  //changes game mode and sets up the game
  mode = "pvp";
  setupGame();
}

function startParty(){
  //sets the room to the value that was typed in
  myRoom = userInput.value();

  //connects to the party
  partyConnect(
    "wss://demoserver.p5party.org", 
    "our-amazing-filler-game", 
    myRoom
  );

  //when a player is ready, they will emit "play" and other players on the server will call "playerMoves"
  partySubscribe("play", playerMoves);

  //creates a colour sequence that will be converted into a grid later (string for easy sharing)
  tempSequence = generateColourSequence();

  //will set up the game once the colour sequence is uploaded and synced (will use hosts sequence)
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
  //creates the buttons to change colours
  for(let i = 0; i<colourArray.length; i++){
    let someButton = new Button(height/2 + 5*squareDimensions, i);
    buttons.push(someButton);
  }

  //creates the score displayers
  for(let i = 0; i<2; i++){
    let someDisplayer = new ScoreDisplayer(-(i+1));
    scoreDisplayers.push(someDisplayer);
  }

  //chooses the player if you are in a p5 party room
  if(myRoom){
    yourPlayer = partyIsHost() ? PLAYER_ONE : PLAYER_TWO;
    grid = setupGrid(shared.colourSequence);
  }

  //creates the grid sequence based on a non-synced string if not in a room
  else if (mode){
    let theSequence = generateColourSequence();
    grid = setupGrid(theSequence);
  }

  //removes html elements to prepare for the draw
  removeElements();
  loop();
}


function toggleCurrentPlayer(){
  //changes the player (uses shared if in party)
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

  //finds the best move to make
  for(let i = 0; i<colourArray.length; i++){
    if(i !== playerOneColour && i !==playerTwoColour){
      
      //changes the colour and resets variables to do so
      fakeGrid = structuredClone(grid);
      points = 0;
      desiredColour = i;
      checkedSpaces = [];

      //runs the algorithm to simulate a move
      changeBoxes(GAME_WIDTH-1, 0, fakeGrid);

      //counts how many hypothetical points the bot could get for each colour change
      for(let iy = 0; iy<GAME_HEIGHT; iy++){
        for(let ix = 0; ix<GAME_WIDTH; ix++){
  
          if(fakeGrid[iy][ix] === PLAYER_TWO){
            points++;
          }
        }
      }

      //tracks the move that will get the most points
      if(points > mostPoints){
        mostPoints = points;
        winningIndex = i;
      }
    }
  }

  //returns the best move
  playerMoves({colour: winningIndex, player: PLAYER_TWO});
}

function playerMoves(object){
  //desired colour is the colour that the player will infect
  desiredColour = object.colour;

  //if the player is player one, it starts in the bottom left corner and changes adjacent desired colour squares
  if(object.player === PLAYER_ONE){
    playerOneColour = desiredColour;
    checkedSpaces = [];
    changeBoxes(0, GAME_HEIGHT-1, grid);
  }

  //moves the starting position for player two
  else{
    playerTwoColour = desiredColour;
    checkedSpaces = [];
    changeBoxes(GAME_WIDTH-1, 0, grid);
  }

  //updates score fter each move
  for(let displayer of scoreDisplayers){
    displayer.updateScore();
  }

  //sets a timer until the bot plays
  if(mode === "pvb" && currentPlayer === PLAYER_ONE){
    setTimeout(botMoves, 1000);
  }

  toggleCurrentPlayer();
}

function changeBoxes(x, y, myGrid){
  //recursive function to change the squares necessary:
  //some context: in filler, you start in a corner and "absorb" adjacent tiles that have the same "desired colour"

  //checks if in the grid
  if(x < GAME_WIDTH && x >=0 && y<GAME_HEIGHT && y>=0){

    //changes the current player variable for p5 party and for the local mode
    if(myRoom){

      //doesn't check the same space twice and also changes adjacent tiles
      //if you already "own" the square, you change the neighbour squares
      if(myGrid[y][x] === shared.currentPlayer && !checkedSpaces.includes(`${x}${y}`)){
        checkedSpaces.push(`${x}${y}`);
        changeNeighbours(x, y, myGrid);
      }

      //if the tile is the square you're absorbing, you absorb it and then check the neighbours
      else if (myGrid[y][x] === desiredColour){
        checkedSpaces.push(`${x}${y}`);
        myGrid[y][x] = shared.currentPlayer;
        changeNeighbours(x, y, myGrid);
      }
    }

    //similar function, different variables (I cannot reassign p5 party variables)
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
  //changes adjacent boxes (not diagonal)

  changeBoxes(x, y+1, myGrid);
  changeBoxes(x, y-1, myGrid);
  changeBoxes(x+1, y, myGrid);
  changeBoxes(x-1, y, myGrid);
}

function generateEmptyGrid(){
  //creates empty grid

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
  //creates a string of numbers that correlate with colours in the colour array

  let theSequence = "";

  for(let i = 0; i<GAME_WIDTH*GAME_HEIGHT; i++){
    let pretendX = i%GAME_WIDTH;
    let pretendY = Math.floor(i/GAME_WIDTH);

    //creates a "checkered" grid that only spawns some colours in certain diagonal patterns
    //this way, there won't be long strands of the same colour in one row/column
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

function setupGrid(theSequence){
  let myGrid = generateEmptyGrid();

  //uses the colour sequence to change the colours in the grid
  for(let y = 0; y<GAME_HEIGHT; y++){
    for(let x = 0; x<GAME_WIDTH; x++){
      myGrid[y][x] = int(theSequence[GAME_WIDTH*y + x]);
    }
  }

  //sets variables based on where the player should be
  playerOneColour = myGrid[GAME_HEIGHT -1][0];
  playerTwoColour = myGrid[0][GAME_WIDTH-1];

  myGrid[GAME_HEIGHT -1][0] = PLAYER_ONE;
  myGrid[0][GAME_WIDTH-1] = PLAYER_TWO;

  return myGrid;
}

function displayTiles(){
  //displays all tiles in the grid by filling in their colour

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
  //displays the frame surrounding the tiles
  imageMode(CENTER);
  image(frameShadowImg, width/2 - SHADOW_OFFSET, height/2 + SHADOW_OFFSET, frameShadowImg.width*pixelRatio, frameShadowImg.height*pixelRatio);
  image(frameShadowImg, width/2 - 0.5*SHADOW_OFFSET, height/2 + 0.5*SHADOW_OFFSET, frameShadowImg.width*pixelRatio, frameShadowImg.height*pixelRatio);
  image(frameImg, width/2, height/2, frameImg.width*pixelRatio, frameImg.height*pixelRatio);
}

function displayButtons(){
  //displays the buttons to click on - only does it if it was your turn
  for(let button of buttons){
    if(mode === "pvp" || myRoom && yourPlayer === shared.currentPlayer || mode === "pvb" && currentPlayer === PLAYER_ONE){
      button.update();
      button.show();
    }
  }
}

function displayScore(){
  //displays the title and the score

  fill(255);
  textSize(100);
  textAlign(CENTER);
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
    //initializes the button
    this.y = y;
    this.width = squareDimensions*1.2;
    this.colourIndex = colourIndex;
    this.isSelectable;
  }

  show(){
    //fills based on the index that it was initialized with
    fill(colourArray[this.colourIndex]);
    stroke("#5c5550");
    strokeWeight(4);
    rectMode(CENTER);
    imageMode(CENTER);
    image(squareShadowImg, this.x - 0.5*SHADOW_OFFSET, this.y + 0.5*SHADOW_OFFSET, this.width, this.width);
    image(squareShadowImg, this.x - 0.25*SHADOW_OFFSET, this.y + 0.25*SHADOW_OFFSET, this.width, this.width);
    square(this.x, this.y, this.width);

    //makes it darker if it's not a selectable button
    if(!this.isSelectable){
      fill(10, 10, 10, 100);
      square(this.x, this.y, this.width);
    }

    noStroke();
  }

  update(){
    //math to centre the row of buttons
    this.y = height/2 + 5*squareDimensions;
    this.x = width/2-(2.5*squareDimensions*1.2 + 2.5*BUTTON_GAP) + this.colourIndex*(squareDimensions*1.2+BUTTON_GAP);

    this.isSelectable = this.colourIndex !== playerOneColour && this.colourIndex !== playerTwoColour;

    //grows the square when it is selectable
    if(this.isSelectable && this.width < squareDimensions*1.2){
      this.width ++;
    }

    //shrinks the square when it isn't
    else if(!this.isSelectable && this.width > squareDimensions*0.9){
      this.width --;
    }
  }

  checkIfPressed(){
    //makes sure that the click is on the button
    if(Math.abs(this.x - mouseX) < BUTTON_WIDTH/2 && Math.abs(this.y - mouseY) < BUTTON_WIDTH/2 && this.isSelectable){
      if(myRoom && shared.currentPlayer === yourPlayer){
        
        //emits a message if in the party
        if(myRoom){
          partyEmit("play", {
            colour: this.colourIndex,
            player: shared.currentPlayer,
          });
        }
      }
  
      else if(mode){
        //calls the local function if not in a party
        playerMoves({
          colour: this.colourIndex,
          player: currentPlayer,
        });
      }
    }
  }
}

class ScoreDisplayer{
  constructor(player){
    this.player = player;
    this.size = this.player === PLAYER_ONE ? SCORE_BOX_WIDTH : 0.7*SCORE_BOX_WIDTH;
    this.score = 1;

    //changes location based on which player it displays
    if(this.player === PLAYER_ONE){
      this.x = width/2 - squareDimensions*6;
    }
    else{
      this.x = width/2 + squareDimensions*6;
    }

    this.y = height/2;
  }
  
  show(){
    //displays a square based on the current colour of the player
    fill(colourArray[this.colour]);
    textAlign(CENTER);
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
    //changes the position when resized
    if(this.player === PLAYER_ONE){
      this.x = width/2 - squareDimensions*6;
    }
    else{
      this.x = width/2 + squareDimensions*6;
    }
    this.y = height/2;
  }

  updateColour(){
    //matches the player colour
    this.colour = this.player === PLAYER_ONE ? playerOneColour : playerTwoColour;
  }

  updateSize(){
    //grows the square when it is the current player, shrinks otherwise

    if(myRoom){
      if(shared.currentPlayer === this.player && this.size < squareDimensions*1.5){
        this.size ++;
      }
      else if(shared.currentPlayer !== this.player && this.size > squareDimensions*0.7){
        this.size--;
      }
    }

    //same function, different variables (didn't want to reassign shared variables)
    else if(mode){
      if(currentPlayer === this.player && this.size < squareDimensions*1.5){
        this.size ++;
      }
      else if(currentPlayer !== this.player && this.size > 0.9*squareDimensions){
        this.size--;
      }
    }
  }

  updateScore(){
    //updates the score based on how many squares the player currently occupies

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

class WinDisplayer{
  constructor(winningPlayer){
    this.winningPlayer = winningPlayer;
    this.x = width/2;
    this.y = height;
    this.w = 500;
    this.h = 100;
    this.a = 1;
    this.colour = color(64, 42, 51);
  }

  update(){
    //raises the text box
    if(this.y > height/2){
      this.y*=0.98;
    }
    if(this.a < 100){
      this.a*=1.3;
    }
  }

  show(){
    //fills the text box that surrounds the win message
    noStroke();
    background(10, 10, 10, this.a);
    fill(this.colour);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 10, 10, 10, 10);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(50);

    //displays the text based on who wins and whether or not they are in a party
    if(this.winningPlayer === PLAYER_ONE){
      if(mode){
        if(mode === "pvp"){
          text("PLAYER ONE WINS", this.x, this.y-10);
        }
        else if(mode === "pvb"){
          text("YOU WIN", this.x, this.y-10);
        }
      }
      if(myRoom){
        if(yourPlayer === PLAYER_ONE){
          text("YOU WIN");
        }
        else{
          text("YOU LOST");
        }
      }
    }
    else if(this.winningPlayer === PLAYER_TWO){
      if(mode){
        if(mode === "pvp"){
          text("PLAYER TWO WINS", this.x, this.y-10);
        }
        else if(mode === "pvb"){
          text("BOT WINS", this.x, this.y-10);
        }
      }
      if(myRoom){
        if(yourPlayer === PLAYER_TWO){
          text("YOU WIN");
        }
        else{
          text("YOU LOST");
        }
      }   
    }
  }
}