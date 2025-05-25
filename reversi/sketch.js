// 2D Arrays Assignment - Reversi
// Arbe Chumala
// April 10, 2025
//
// Extra for Experts:
// - made a (challenging, sigh) reversi bot to play against
// - changed the appearance of the cursor based on mouseX and mouseY
// - manually animated the flipping of the tiles (so tedious)
// - uploaded a custom font

//grid and tile constants
const EMPTY = 0;
const WHITE = 1;
const BLACK = 2;
const GRID_DIMENSIONS = 8;

//perlin noise used for the congratulations message
const DELTA_NOISE_TIMER = 0.01;
let noiseTimer = 0;

//global animation variables (30fps animation)
const ANIMATION_DELAY = 2;

//game states and variables
let gameOver = false;
let currentPlayer = WHITE;
let whiteTileCount = 2;
let blackTileCount = 2;
let mode = "pvb";
let timerStarted = false;

//grids
let grid = generateStartGrid();
let drawingGrid = structuredClone(grid);
let movesArray;

//images, fonts, and animation frames
let whiteTile;
let blackTile;
let blackGhostTile;
let whiteGhostTile;
let gameFont;
let board;
let animationFrameArray = [];
let jazzMusic;

//coordinates and image size shortcuts
let resizingRatio;
let cellSize;
let aisleSize;
let startingImageX;
let startingImageY;
let startingMouseX;
let startingMouseY;
let gridUnit;

function preload(){
  board = loadImage("assets/board.png");
  blackTile = loadImage("assets/black-tile.png");
  whiteTile = loadImage("assets/white-tile.png");
  whiteGhostTile = loadImage("assets/ghost-white-tile.png");
  blackGhostTile = loadImage("assets/ghost-black-tile.png");
  gameFont = loadFont("assets/gamefont.otf");
  jazzMusic = loadSound("assets/jazz-music.mp3");
  for (let i = 0; i<=12; i++){
    animationFrameArray.push(loadImage(`assets/animation-frames/${i}.png`));
  }
}

function setup(){
  setupCanvas();
  toggleCurrentPlayer();

  //setting visual parameters
  imageMode(CENTER);
  textAlign(CENTER);
  textFont(gameFont);
  textSize(40);
  fill(255);
}

function windowResized(){
  //allows canvas to be resizable
  setupCanvas();
}

function setupCanvas(){
  //makes canvas again and continues noSmooth()
  createCanvas(windowWidth, windowHeight);
  noSmooth();

  //reassigns variables based on canvas size
  resizingRatio = height/228;
  cellSize = 18*resizingRatio;
  aisleSize = 1*resizingRatio;
  gridUnit = aisleSize + cellSize;
  startingImageX = width/2 - 3.5*gridUnit;
  startingImageY = height/2 - 3.5*gridUnit;
  startingMouseX = startingImageX - 0.5*cellSize;
  startingMouseY = startingImageY - 0.5*cellSize;
}

function draw(){
  background(27, 117, 92);
  startBotTimer();
  setCursor();
  displayGrid();
  displayScore();
  displayWinScreen();
}

function generateEmptyGrid(){
  //generates a new 8x8 grid with empty tiles

  let newGrid = [];
  
  for (let y = 0; y<GRID_DIMENSIONS; y++){
    newGrid.push([]);

    for (let x = 0; x<GRID_DIMENSIONS; x++){
      newGrid[y].push(EMPTY);
    }
  }

  return newGrid;
}

function generateStartGrid(){
  //generates an empty grid
  let newGrid = generateEmptyGrid();

  //places tiles based on reversi starting position
  newGrid[3][3] = WHITE;
  newGrid[3][4] = BLACK;
  newGrid[4][3] = BLACK;
  newGrid[4][4] = WHITE;
  
  return newGrid;
}

function findMoves(thePlayer) {
  //General Conext: In order for a move to be playable, a new tile, when placed in that position, should "connect"
  //in a diagonal or horizontal line to another tile of the same colour. Connection can only occur if all the tiles between
  //are the opposite colour. When I wroe this function, I started from the tiles currently on the board, and went
  //outwards to find lines where "connection points" could be placed.

  //boolean that is later returned
  let moveFound = false;

  //possible moves are refreshed after each turn
  movesArray = generateEmptyGrid();

  //iterates through all tiles
  for (let y = 0; y<GRID_DIMENSIONS; y++){
    for (let x = 0; x<GRID_DIMENSIONS; x++){

      //the starting position can only be the player itself
      if (grid[y][x] === thePlayer){

        //there are 8 directions in which you can protrude out of the tile
        //ix and iy represent the change in x and the change in y for each direction (when same index value)
        let ix = [1, 1, 0, -1, -1, -1, 0, 1];
        let iy = [0, 1, 1, 1, 0, -1, -1, -1];
        
        //each direction is explored by this loop (N, NE, E, etc.)
        for (let i = 0; i<8; i++){
          let counter = 1;

          //a connection line must cross over only the opposite colour tiles, so this while loop runs based on that conditional
          while (y+iy[i]*counter >=0 && y+iy[i]*counter < GRID_DIMENSIONS &&
                 x+ix[i]*counter >=0 && x+ix[i]*counter < GRID_DIMENSIONS &&
                 grid[y+iy[i]*counter][x+ix[i]*counter] !== thePlayer && 
                 grid[y+iy[i]*counter][x+ix[i]*counter] !== EMPTY){
            //for every change in the counter, the change in x and the change in y will be multiplied, thus checking a new tile
            counter++;
          }

          //the connection line can only be finished if the final space is empty
          if(y+iy[i]*counter >=0 && y+iy[i]*counter < GRID_DIMENSIONS &&
             x+ix[i]*counter >=0 && x+ix[i]*counter < GRID_DIMENSIONS &&
             grid[y+iy[i]*counter][x+ix[i]*counter] === EMPTY && 
             counter>1){
            
            //the movesArray will end up showing the amount of tiles that are taken over by the connection line
            movesArray[y+iy[i]*counter][x+ix[i]*counter] += counter-1;
            moveFound = true;
          }
        }
      }
    }
  }

  //returns true if a move was found (if a move is not possible, a player's turn will be skipped)
  return moveFound;
}

function playerMoves(x, y){
  //only makes a move if it is a legal move (at least one tile will be gained)
  if (movesArray[y][x]){
    changeGrid(x, y);
    updateTileCount();
    toggleCurrentPlayer();
  }
}

function changeGrid(x, y){
  //uses the same indexes as the findMoves() function
  let ix = [1, 1, 0, -1, -1, -1, 0, 1];
  let iy = [0, 1, 1, 1, 0, -1, -1, -1];

  //updates the drawingGrid for each move
  drawingGrid = structuredClone(grid);
  
  //looking for connection lines in all 8 possible directions
  for (let i = 0; i<8; i++){
    let counter = 1;

    //tiles in the middle of the connection line must be the opposite colour
    while (y+iy[i]*counter >=0 && y+iy[i]*counter < GRID_DIMENSIONS &&
            x+ix[i]*counter >=0 && x+ix[i]*counter < GRID_DIMENSIONS &&
            grid[y+iy[i]*counter][x+ix[i]*counter] !== currentPlayer && 
            grid[y+iy[i]*counter][x+ix[i]*counter] !== EMPTY){

      //counter will increase for each tile that is part of the line
      counter++;
    }

    //if the tile found at the end of the line is the current player, then they will go backwards and fill in the tiles that make the line
    if(y+iy[i]*counter >=0 && y+iy[i]*counter < GRID_DIMENSIONS &&
        x+ix[i]*counter >=0 && x+ix[i]*counter < GRID_DIMENSIONS &&
        grid[y+iy[i]*counter][x+ix[i]*counter] === currentPlayer && 
        counter>1){
      
      //when the counter goes down, it will cover all of the tiles until it hits the new tile 
      for (counter; counter >=0; counter --){

        //the tiles that will be animated are turned into objects and the animation direction is determined by the original colour of the tile
        let flippingTile = {
          number: currentPlayer,
          animationFrame: grid[y+iy[i]*counter][x+ix[i]*counter] === WHITE ? 12:0,
        };

        //if the tile is the opposite player, then the tile must be flipped (animated) on the drawing Grid
        if (grid[y+iy[i]*counter][x+ix[i]*counter] !== currentPlayer && grid[y+iy[i]*counter][x+ix[i]*counter] !== EMPTY){
          grid[y+iy[i]*counter][x+ix[i]*counter] = currentPlayer;
          drawingGrid[y+iy[i]*counter][x+ix[i]*counter] = flippingTile;
        }

        //if the cell is empty, then the tile will just be placed
        else{
          grid[y+iy[i]*counter][x+ix[i]*counter] = currentPlayer;
          drawingGrid[y+iy[i]*counter][x+ix[i]*counter] = currentPlayer;
        }
      }
    }      
  }
}

function toggleCurrentPlayer(){
  //uses a ternary operator to concisely toggle the player
  currentPlayer = currentPlayer === BLACK ? WHITE: BLACK;
  let otherPlayer = currentPlayer === BLACK ? WHITE: BLACK;
  
  //if the new player has no moves, it will either toggle the player again or cut to the win screen
  if (!findMoves(currentPlayer)){
    if(findMoves(otherPlayer)){
      toggleCurrentPlayer();
    }
    else{
      determineWinner();
    }
  }
}

function updateTileCount(){
  //resets global variables to zero until recounted
  whiteTileCount = 0;
  blackTileCount = 0;

  //iterates through the 2d array to count each kind of tile
  for (let y = 0; y<GRID_DIMENSIONS; y++){
    for(let x = 0; x<GRID_DIMENSIONS; x++){
      if (grid[y][x] === WHITE){
        whiteTileCount++;
      }
      else if(grid[y][x] === BLACK){
        blackTileCount++;
      }
    }
  }
}

function startBotTimer(){
  //waits one second after the human plays for the bot to move
  if (!timerStarted && currentPlayer === WHITE && mode === "pvb"){
    setTimeout(botMoves, 1000);
    timerStarted = true;
  }
}

function botMoves(){
  //the bot will always be white
  if(currentPlayer === WHITE && mode === "pvb"){

    //intializing variables...
    let maxGain = 0;
    let botX;
    let botY;
    let moveFound = false;

    for(let y = 0; y<GRID_DIMENSIONS; y++){
      for(let x = 0; x<GRID_DIMENSIONS; x++){

        //it will initially avoid playing squares that would allow the other player to gain a corner
        if(!((y===1 || y===6||y===0||y===7)&& (x===1 ||x===6||x===0||x===7))){
          if (movesArray[y][x] > maxGain){
            maxGain = movesArray[y][x];
            botX = x;
            botY = y;
            moveFound = true; //indicates that a move has been found, even after excluding certain squares
          }
        }
      }
    }

    //will check through the entire array if no move is found
    if(!moveFound){
      for(let y = 0; y<GRID_DIMENSIONS; y++){
        for(let x = 0; x<GRID_DIMENSIONS; x++){
          if (movesArray[y][x] > maxGain){
            maxGain = movesArray[y][x];
            botX = x;
            botY = y;
          }
        }
      }
    }

    //the highest priority areas are the corners, so it will always take these if possible
    for(let y = 0; y<8; y+=7){
      for(let x = 0; x<8; x+=7){
        if(movesArray[y][x]){
          botY = y;
          botX = x;
        }
      }
    }
    
    //sends its final move and restarts the timer boolean
    playerMoves(botX, botY);
    timerStarted = false;
  }

}

function determineWinner(){
  //very advanced logic here... having more tiles means you win
  theWinner = whiteTileCount > blackTileCount ? "WHITE":"BLACK";
  gameOver = true;
}

function displayGrid(){
  //displays the board
  image(board, width/2, height/2, board.width*resizingRatio, board.height*resizingRatio);

  //iterates through all tiles
  for (let y = 0; y<GRID_DIMENSIONS; y++){
    for(let x = 0; x<GRID_DIMENSIONS; x++){

      //draws a black tile on a black square
      if (drawingGrid[y][x]===BLACK){
        image(blackTile, startingImageX+x*gridUnit, startingImageY+y*gridUnit, blackTile.width*resizingRatio, blackTile.height*resizingRatio);
      }

      //draws a white tile on a white square
      else if (drawingGrid[y][x]===WHITE){
        image(whiteTile, startingImageX+x*gridUnit, startingImageY+y*gridUnit, whiteTile.width*resizingRatio, whiteTile.height*resizingRatio);
      }

      //since animated tiles are objects, they won't be registered as being white, black, or empty
      else if (drawingGrid[y][x] !== EMPTY){

        //selects the correct frame out of the animation frame array
        let img = animationFrameArray[drawingGrid[y][x].animationFrame];

        //the size will be greater when the animation frame is closer to the middle - this allows the tile to appear "higher up" when in mid-air
        let sizeFactor = (-abs(drawingGrid[y][x].animationFrame-6)+7)/10;

        //displays the animation frame
        image(img, startingImageX+x*gridUnit, startingImageY+y*gridUnit,img.width*resizingRatio, img.height*resizingRatio+img.height*sizeFactor);
      }
      
      //only updates the animation every n frames, where n = ANIMATION_DELAY
      if(frameCount%ANIMATION_DELAY === 0){

        //the animation moves forward to turn into a white tile
        if (drawingGrid[y][x].number === WHITE){
          drawingGrid[y][x].animationFrame ++;
        }

        //backwards to turn into a black tile
        else if (drawingGrid[y][x].number === BLACK){
          drawingGrid[y][x].animationFrame --;
        }

        //if it is at the end of the animation, it turns back into a regular tile
        if(drawingGrid[y][x].animationFrame === 0 || drawingGrid[y][x].animationFrame ===12){
          drawingGrid[y][x] = drawingGrid[y][x].number;
        }
      }

      //will only display the possible moves (50% opacity) if the player is a human
      if (movesArray[y][x] && (mode === "pvp" || currentPlayer === BLACK)){
        let theImage = currentPlayer - 1 ? blackGhostTile: whiteGhostTile;
        image(theImage,startingImageX+x*gridUnit, startingImageY+y*gridUnit, theImage.width*resizingRatio, theImage.height*resizingRatio);
      }
    }
  }
}

function displayScore(){
  //displays the title and objective
  textSize(70);
  text("Reversi", width/2, 65);
  textSize(15);
  text("Gain as many tiles as possible", width/2, 90);

  //displays the score for each player
  textSize(40);
  text(blackTileCount, width/2-6*gridUnit, height/2+gridUnit*0.5);
  text(whiteTileCount, width/2+6*gridUnit, height/2+gridUnit*0.5);

  //the tile that is opaque will indicate the current player
  if (currentPlayer === BLACK){
    image(blackTile, width/2-6*gridUnit, height/2-gridUnit, blackTile.width*resizingRatio*1.5, blackTile.height*resizingRatio*1.5);
    image(whiteGhostTile, width/2+6*gridUnit, height/2-gridUnit, whiteTile.width*resizingRatio*1.5, whiteTile.height*resizingRatio*1.5);
  }
  else{
    image(blackGhostTile, width/2-6*gridUnit, height/2-gridUnit, blackTile.width*resizingRatio*1.5, blackTile.height*resizingRatio*1.5);
    image(whiteTile, width/2+6*gridUnit, height/2-gridUnit, whiteTile.width*resizingRatio*1.5, whiteTile.height*resizingRatio*1.5);
  }

  //displays some instructions
  if(mode === "pvp"){
    textSize(15);
    text("Press B to switch to Player versus Bot Mode", width/2, height-20);
  }
  else if(mode === "pvb"){
    textSize(15);
    text("Press P to switch to Player versus Player Mode", width/2, height-20);
  }
  text("Press R to Reset", width/2, height-40);
}

function displayWinScreen(){
  //displays the win screen if the game is over
  if(gameOver){
    let x = noise(noiseTimer, 0)*width;
    let y = noise(0, noiseTimer)*height;
  
    noiseTimer += DELTA_NOISE_TIMER;

    textSize(70);
    text(`CONGRATULATIONS, ${theWinner} WON!`, x, y);
  }
}

function setCursor(){
  //finds the x and y coordinates (with respect to the grid cells) of the mouse
  let x = Math.floor((mouseX-startingMouseX)/gridUnit);
  let y = Math.floor((mouseY-startingMouseY)/gridUnit);

  //if the mouse is on a tile that can be played, the cursor changes to a hand
  if (y<GRID_DIMENSIONS && y>=0 && x<GRID_DIMENSIONS && x>=0 && movesArray[y][x]&&(currentPlayer === BLACK || mode === "pvp")){
    cursor(HAND);
  }
  else{
    cursor(ARROW);
  }
}

function mousePressed(){
  //plays music on first click
  if (!jazzMusic.isPlaying()){
    jazzMusic.loop();
  }

  //finds the x and y coordinates (with respect to the grid cells) of the mouse
  let playerX = Math.floor((mouseX-startingMouseX)/gridUnit);
  let playerY = Math.floor((mouseY-startingMouseY)/gridUnit);

  //either the mode is pvp and either colour can play by clicking, or it is against the bot and only black can play by clicking
  if(mode === "pvp" || currentPlayer === BLACK){
    if (playerX >=0 && playerX <GRID_DIMENSIONS && playerY >= 0 && playerY < GRID_DIMENSIONS){
      playerMoves(playerX, playerY);
    }
  }
}

function keyPressed(){
  //switches the mode
  if (key === "p" && mode === "pvb"){
    resetGame();
    mode = "pvp";
  }
  else if (key === "b" && mode === "pvp"){
    resetGame();
    mode = "pvb";
  }
  else if (key === "r"){
    resetGame();
  }
}

function resetGame(){
  //resets the game board
  grid = generateStartGrid();
  drawingGrid = structuredClone(grid);
  gameOver = false;
  currentPlayer = WHITE;
  updateTileCount();
  toggleCurrentPlayer();
}