// initialize matter js elements
const{Engine, Events, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

// create an engine
let engine = Engine.create();
let world = engine.world;
engine.gravity.y = 0;

// create and run runner
let runner = Runner.create();
Runner.run(runner, engine);

let poolTableHalfWidth;

// define initial variables
let holeRadius;
let ballRadius;
let shadowOffset;
let scoreBallRadius;

//defining constants measured from width/2 and height/2
let hFarTrapX;
let hMiddleTrapX;
let hCloseTrapX;
let hFarTrapY;
let hCloseTrapY;

let horizontalTrapezoidMeasurments;

let vFarTrapX;
let vCloseTrapX;
let vMiddleTrapY;
let vCloseTrapY;
let vFarTrapY;

let verticalTrapezoidMeasurements;

let holeFarX;
let holeFarY;

const MOUSE_FORGIVENESS = 50;

// defining variables, including state vairables and arrays
let balls = [];
let walls = [];
let holes = [];
let scoreDisplayers = [];
let cue;
let winDisplayer;

let ballsMovingVar = false;
let isDrawnBack = false;
let cueSpeedFactor = 20;
let velocityRatio = 20;
let stripedPlayerPlaying = true;
let correctBallFallen = false;
let cueBallFallen = false;
let blackBallFallen = false;
let ballsJustMoving = false;
let currentMilis;
let gapMilis = 5000;
let stripedPlayerBalls = 7;
let nonStripedPlayerBalls = 7;
let playerHasWon = false;

let poolTableImg;
let ballImg;

let pixelRatio;

// preload assets
function preload(){
  poolTableImg = loadImage("assets/images/pool-tabeel.png");
  ballGridImage = loadImage("assets/images/balls.png");
  poppins = loadFont("assets/fonts/bold-poppins.ttf");
  ballSound = loadSound("assets/sounds/ball-hitting-ball.mp3");
  sinkingSound = loadSound("assets/sounds/ball-sinking.mp3");
}

function setupCanvas(){
  createCanvas(windowWidth, windowHeight);

  // define initial variables
  holeRadius = 5*poolTableHalfWidth/500;
  ballRadius = 17*poolTableHalfWidth/500;
  shadowOffset = 5*poolTableHalfWidth/500;
  scoreBallRadius = 30*poolTableHalfWidth/500;

  //defining constants measured from width/2 and height/2
  hFarTrapX = 440*poolTableHalfWidth/500;
  hMiddleTrapX = 410*poolTableHalfWidth/500;
  hCloseTrapX = 30*poolTableHalfWidth/500;
  hFarTrapY = 260*poolTableHalfWidth/500;
  hCloseTrapY = 205*poolTableHalfWidth/500;

  horizontalTrapezoidMeasurments;

  vFarTrapX = 500*poolTableHalfWidth/500;
  vCloseTrapX = 440*poolTableHalfWidth/500;
  vMiddleTrapY = 160*poolTableHalfWidth/500;
  vCloseTrapY = 0.5;
  vFarTrapY = 200*poolTableHalfWidth/500;

  verticalTrapezoidMeasurements;

  holeFarX = 460*poolTableHalfWidth/500;
  holeFarY = 220*poolTableHalfWidth/500;

  pixelRatio = 2*poolTableHalfWidth/poolTableImg.width;

  horizontalTrapezoidMeasurments = {
    vertices: [
      {x: hFarTrapX, y:hFarTrapY},
      {x: hCloseTrapX, y: hFarTrapY},
      {x: hCloseTrapX, y: hCloseTrapY},
      {x: hMiddleTrapX, y: hCloseTrapY},
    ],
    centre: {
      x: (hFarTrapX + hCloseTrapX)/2,
      y: (hFarTrapY + hCloseTrapY)/2,
    },
  };

  verticalTrapezoidMeasurements = {
    vertices: [
      {x: vFarTrapX, y: vFarTrapY},
      {x: vCloseTrapX, y: vMiddleTrapY},
      {x: vCloseTrapX, y: vCloseTrapY},
      {x: vFarTrapX, y: vCloseTrapY},
    ],
    centre: {
      x: (vFarTrapX + vCloseTrapX)/2,
      y: (vFarTrapY + vCloseTrapY)/2,
    },
  };
}

// create canvas and set trapezoid measurements, as well as initializing collisionStarted event
function setup(){
  poolTableHalfWidth = windowHeight/4*poolTableImg.width/poolTableImg.height;
  setupCanvas();
  
  // calls functions to create barriers and balls
  Events.on(engine, "collisionStart", collisionManager);
  createGame();
}

// manages response to collisions based on collisionStarted event, including balls sinking and sounds
function collisionManager(event){
  let pairsArray = structuredClone(event.pairs);
  let ballHasSunk = false;
  let sinkingBallIds = [];
  let sinkingBallPositions = [];

  for(let pair of pairsArray){
    if(pair.bodyA.label === "hole" && pair.bodyB.label === "ball"){
      sinkingBallIds.push(pair.bodyB.id);
      sinkingBallPositions.push(pair.bodyA.position);
      ballHasSunk = true;
    }
    else if (pair.bodyA.label === "ball" && pair.bodyB.label === "hole"){
      sinkingBallIds.push(pair.bodyA.id);
      sinkingBallPositions.push(pair.bodyB.position);
      ballHasSunk = true;
    }
  }

  if(ballHasSunk){
    for(let ball of balls){
      for(let i = 0; i<sinkingBallIds.length; i++){
        if(ball.body.id === sinkingBallIds[i]){
          ball.ballSinking = true;
          Body.setPosition(ball.body, sinkingBallPositions[i]);
          ball.desiredX = sinkingBallPositions[i].x;
          ball.desiredY = sinkingBallPositions[i].y;
          Body.setVelocity(ball.body, {x:0, y:0});
        }
      }
    }
  }
  for (let pair of pairsArray) {
    if (pair.bodyA.label === "ball" && pair.bodyB.label === "ball") {
      ballSound.play();
    }
    else if ((pair.bodyA.label === "hole" || pair.bodyB.label === "hole") && (pair.bodyA.label === "ball" || pair.bodyA.label === "ball")) {
      sinkingSound.play();
    }
  }
}

function draw(){
  background("#294535");
  imageMode(CENTER);
  smooth();
  tint(10, 50);
  image(poolTableImg, width/2 - 2*shadowOffset, height/2 + 2*shadowOffset, poolTableImg.width*pixelRatio, poolTableImg.height*pixelRatio);
  noTint();
  noSmooth();
  image(poolTableImg, width/2, height/2, poolTableImg.width*pixelRatio, poolTableImg.height*pixelRatio);

  // if the eight ball has been sunk, displays winning message
  if (playerHasWon){
    for (let ball of balls) {
      ball.show();
    }
    winDisplayer.update();
    winDisplayer.show();
  }

  // otherwise
  else{
    let ballX;
    let ballY;

    // iterates through all balls, showing and updating them, as well as giving the x and y values of the cue ball
    for (let ball of balls){
      ball.drawShadow();
    }
    
    for (let ball of balls){
      if (ball.cueBall){
        ballX = ball.body.position.x;
        ballY = ball.body.position.y;
      }
      ball.update();
    }

    // checks if the cue should be shown and if the balls just stopped moving last frame
    let showCue = !ballsMoving();
    ballsJustStoppedMoving();

    // shows the cue when balls are not moving, and updates the cue always
    if (showCue){
      cue.show();
    }
    cue.update(ballX, ballY);

    for (let ball of balls) {
      ball.show();
    }

    // shows barriers (for debug)
    for (let wall of walls){
      wall.show();
    }
    for(let hole of holes){
      hole.show();
    }

    fill(255, 220);
    noStroke();
    textFont(poppins);
    textSize(20*pixelRatio);
    text("8 Ball Pool", width/2, height/2 - poolTableHalfWidth*0.7);

    for(let displayer of scoreDisplayers){
      displayer.update();
      displayer.show();
    }
  }
}

// calls createBalls and createBoundaries
function createGame(){
  createBalls();
  createBoundaries();
  createHoles();
  createScoreDisplayers();
}

// called when the eight ball has been sunk, shows which player won
function showWinningPlayer(player){

  // clears walls and balls
  walls = [];
  balls = [];

  // if the player who sunk the cue ball has all their other balls sunk, displays that they won, otherwise displays that the opponent won
  if (player === stripedPlayerPlaying && stripedPlayerBalls === 0 || player === !stripedPlayerPlaying && nonStripedPlayerBalls === 0){
    text("Did the striped player win the game? " + player + "!!!", 100, 100);
  }
  else{
    text("Did the striped player lose? " + player + "!!!", 100, 100);
  }

  // if 5 seconds have passed since the end of the game, starts a new game
  if (currentMilis + gapMilis < millis()){
    stripedPlayerPlaying = false;
    createGame();
  }
}

// checks if balls were moving last frame but are not this frame
function ballsJustStoppedMoving(){
  if (!ballsMoving() && ballsJustMoving){
    ballOut();
  }
  ballsJustMoving = ballsMoving();
}

function ballOut(){
  console.log("working");
  // checks if each ball is in the area
  let samePlayerAgain = false;
  for (let i = balls.length - 1; i >= 0; i --){
    console.log("looping");
    if (balls[i].ballSunk){

      // if the ball is the cue call, sets a variable to true and tries to move it back to the middle, as well as switching the player
      // playing if it fell (works because it is always the last ball in the array)
      if (balls[i].cueBall){
        cueBallFallen = true;
        let homeBase = Vector.create(width/2-200, height/2);

        // Composite.add(world, balls[i].body);
        Body.setPosition(balls[i].body, homeBase);
        balls[i].r = ballRadius;
        balls[i].ballSinking = false;
        balls[i].ballSunk = false;

        samePlayerAgain = false;
      }

      // this stuff is irrelevant (hopefully) but it checks if it is striped, which eventually will
      // be relevant for turns, if its the cue ball, and if its the 8 ball
      else{
        if (balls[i].striped === stripedPlayerPlaying){
          samePlayerAgain = true;
        }
        if (balls[i].eightBall){
          currentMilis = millis();
          determineWinner();
        }
        else if (balls[i].striped){
          stripedPlayerBalls --;
        }
        else{
          nonStripedPlayerBalls --;
        }

        Composite.remove(world, balls[i].body);
        balls.splice(i, 1);
      }
    }
  }
  if (!samePlayerAgain){
    stripedPlayerPlaying = !stripedPlayerPlaying;
  }
}

function determineWinner(){
  if(stripedPlayerPlaying && stripedPlayerBalls === 0 || !stripedPlayerPlaying && nonStripedPlayerBalls !== 0){
    winDisplayer = new WinDisplayer("STRIPES");
  }
  else if(!stripedPlayerPlaying && nonStripedPlayerBalls === 0 || stripedPlayerPlaying && stripedPlayerBalls !== 0){
    winDisplayer = new WinDisplayer("SOLIDS");
  }
  playerHasWon = true;
}

// checks if there are any balls in motion
function ballsMoving(){
  for (let ball of balls){
    if (ball.isMoving() || ball.ballSinking){
      return true;
    }
  }
  return false;
}

// creates balls in triangle formation at start of new game
function createBalls(){
  for(let i = 0; i<15; i++){
    let index;
    if(i === 4){
      index = 7;
    }
    else if (i === 7){
      index = 4;
    }
    else{
      index = i;
    }
    let column = findColumn(index);
    let x = findX(column);
    let y = findY(index,column);
    let someBall = new Ball(x, y, i);
    balls.push(someBall);
  }
  let cueBall = new Ball(width/2, height/2, 15);
  balls.push(cueBall);

  cue = new Cue(width / 3, height / 2);
}

function findColumn(n){
  for(let column  = 4; column>=0; column--){
    let lastOfRow = column*(column+1)/2;
    if(n >= lastOfRow){
      return column +1;
    }
  }
}

// find the x value for a column of balls
function findX(column){
  let startingX = width/2 + 100;
  let horizontalGap = sqrt(3)*ballRadius;
  return startingX + horizontalGap*column;
}

// finds y value for a column of balls
function findY(n, column){
  let startingY = height/2;
  let firstOfRow = column*(column-1)/2;
  let placement = n-firstOfRow;

  return startingY +(column-1)*ballRadius - placement*2*ballRadius;
}

// creates pool table boundaries
function createBoundaries(){
  walls = [];

  for(let upDown=-1; upDown<=1; upDown+=2){
    for(let leftRight = -1; leftRight <=1; leftRight +=2){

      let measurementsArray = findTrapezoidMeasurements(leftRight, upDown);

      for(let measurements of measurementsArray){
        let someShortTrapezoid = new TrapezoidWall(measurements.x, measurements.y, measurements.vertices);
        walls.push(someShortTrapezoid);

      }
    }
  }
  
  playerHasWon = false;
}

function findTrapezoidMeasurements(xSign, ySign){
  //uses various arrays to create an array of vertex measurements

  let orientations = [horizontalTrapezoidMeasurments, verticalTrapezoidMeasurements];
  let newMeasurementsArray = [];

  for(let orientation of orientations){
    x = width/2 + xSign*orientation.centre.x;
    y = height/2 + ySign*orientation.centre.y;

    let vertexArray = [];

    //uses each object to load vertices
    for (let vertexPair of orientation.vertices){
      let adjustedX = width/2 + xSign*vertexPair.x;
      let adjustedY = height/2 + ySign*vertexPair.y;
  
      let theObject = {
        x: adjustedX,
        y: adjustedY,
      };

      vertexArray.push(theObject);
    }

    let newMeasurements = {
      vertices: vertexArray,
      x: x,
      y: y,
    };

    newMeasurementsArray.push(newMeasurements);
  }

  return newMeasurementsArray;
}

function createHoles(){
  //creates physics bodies for each hole that a ball could fall into

  holes = [];

  let verticalSpots = 3;
  let horizontalSpots = 2;

  //arranges them in a grid based on constants for position
  for(let ix = 0; ix<verticalSpots; ix++){
    for(let iy = 0.5; iy<horizontalSpots; iy++){

      let x = width/2 + (ix-1)*holeFarX;
      let y = x !== width/2 ? height/2 + 2*(iy-1)*holeFarY: height/2 + 2*(iy-1)*(holeFarY+2.5*holeRadius);

      let someHole = new Hole(x, y);
      holes.push(someHole);
    }
  }
}

function createScoreDisplayers(){
  //create score displayer for each player
  let stripedScoreDisplayer = new ScoreDisplayer(width/2-poolTableHalfWidth*1.2, height/2, "striped");
  let solidScoreDisplayer = new ScoreDisplayer(width/2+poolTableHalfWidth*1.2, height/2, "solid");
  scoreDisplayers = [stripedScoreDisplayer, solidScoreDisplayer];
}

// ---------------------------------------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------------------------------------

class Ball{
  constructor(x, y, id){
    this.x = x;
    this.y = y;

    this.desiredX = x;
    this.desiredY = y;

    this.id = id;

    // comment this shit broski
    this.imageX = this.id%8*15;
    this.imageY = Math.floor(this.id/8)*15;
    this.imageW = 15;

    this.striped = this.id > 7 && this.id <15;
    this.eightBall = id === 7;
    this.cueBall = id === 15;

    this.r = ballRadius;

    this.options ={
      restitution: 1,
      friction: 0.25,
    };

    this.body = Bodies.circle(this.x, this.y, this.r, this.options);
    this.body.label = "ball";

    this.ballSinking = false;
    this.ballSunk = false;

    Composite.add(world, this.body);

    this.angle = this.body.angle;
  }

  // if the ball is still in play, shows the ball
  show(){
    if(!this.ballSunk){
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      noSmooth();
      imageMode(CENTER);
      let tintFactor = ballRadius - this.r;
  
      tint(230-10*tintFactor);
      image(ballGridImage, 0, 0, this.r*2, this.r*2, this.imageX, this.imageY, this.imageW, this.imageW);
      noTint();
      pop();
    }
  }

  // if the ball is sinking reduces its radius then sets ballSunk to be true, otherwise updates position
  update(){
    if (!this.ballSinking) {
      if (Math.abs(this.body.velocity.x) < 0.1 && Math.abs(this.body.velocity.y) < 0.1){
        let stationary = Vector.create(0, 0);
        Body.setVelocity(this.body, stationary);
      }
  
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }
    else{
      if(this.r >0.5){
        this.r -=0.5;
        this.x = (this.desiredX +this.x)/2;
        this.y = (this.desiredY + this.y)/2;
      }

      if(this.r <2){
        this.ballSunk = true;
        this.ballSinking = false;
      }
    }
  }

  //sets the velocity based on the position of the cue relative to the ball
  changeVelocity(distanceX, distanceY){
    this.velocity = Vector.create(distanceX, distanceY);
    Body.setVelocity(this.body, this.velocity);
  }

  //draws a shadow by drawing a tinted image of the ball under and to the side of each ball
  drawShadow(){
    smooth();
    tint(10, 50);
    image(ballGridImage, this.x - shadowOffset, this.y + shadowOffset, this.r*2, this.r*2, this.imageX, this.imageY, this.imageW, this.imageW);
    noTint();
    noSmooth();
  }

  // checks if the ball is moving
  isMoving(){
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0){
      return false;
    }
    return true;
  }

  // removes the ball's body if it is sinking
  sinkBall(){
    this.ballSinking = true;
    Composite.remove(world, this.body);
  }
}

class Cue{
  constructor(ballX, ballY){
    this.ballX = ballX;
    this.ballY = ballY;

    this.x = ballX - 100 - ballRadius;
    this.y = ballY;

    this.strikeX = ballX;
    this.strikeY = ballY;

    this.distanceX = 100;
    this.distanceY = 0;

    this.ratio;
    this.distance;
    this.strikeDistance;
    this.strikeRatio;

    this.isDrawnBack = false;
    this.justStoppedMoving = false;
  };

  // updates the location of the cue
  update(newBallX, newBallY){
    this.ballY = newBallY;
    this.ballX = newBallX;

    this.distance = dist(this.x, this.y, this.ballX, this.ballY);
    this.strikeDistance = dist(this.strikeX, this.strikeY, this.ballX, this.ballY);

    // if the cue has been released and is moving towards the cue ball, approaches the cue ball in a straight line stoppen when it is struck
    if (this.movingIn){
      this.x -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.y -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      this.strikeX -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.strikeY -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      if (this.distance < 100 + ballRadius){
        this.movingIn = false;
        for (let ball of balls){
          if (ball.cueBall){
            ball.changeVelocity(- this.distanceX / velocityRatio, - this.distanceY / velocityRatio);
          }
        }
      }
    }

    // follows the mouse if pressed and if the mouse is within 100 pixels along x and y of the tip of the cue
    else if (mouseIsPressed && mouseX < this.x + MOUSE_FORGIVENESS && mouseX > this.x - MOUSE_FORGIVENESS && mouseY > this.y - MOUSE_FORGIVENESS && mouseY < this.y + MOUSE_FORGIVENESS && this.distance >= MOUSE_FORGIVENESS){
      this.ratio = 100 /this.distance;
      this.strikeRatio = 100 / this.strikeDistance;
      
      this.x = mouseX;
      this.y = mouseY;

      this.distanceX = mouseX - this.ballX;
      this.distanceY = mouseY - this.ballY;

      this.strikeX = this.x - this.ratio * this.distanceX;
      this.strikeY = this.y - this.ratio * this.distanceY;

      this.isDrawnBack = true;
      this.movingIn = false;
    }

    // returns the cue to home position if the cue is too close to the ball
    else if (this.isDrawnBack && this.distance <= 100 + ballRadius){
      this.isDrawnBack = false;

      this.x = this.ballX - 100 - ballRadius;
      this.y = this.ballY;
      this.strikeX = this.ballX;
      this.strikeY = this.ballY;
    }

    // starts the cue moving inward when the mouse is released
    else if (this.isDrawnBack && !mouseIsPressed){
      this.dx ++;
      this.dy ++;
      this.movingIn = true;
      this.isDrawnBack = false;

      this.distanceX = this.x - this.ballX;
      this.distanceY = this.y - this.ballY;

      cueSpeedFactor = 2000 / this.strikeDistance;
    }

    // returns to home cue location
    else{
      this.x = this.ballX - 100;
      this.y = this.ballY;
      this.strikeX = this.ballX;
      this.strikeY = this.ballY;
    }
  }

  // shows the cue as a simple black line
  show(){
    stroke(82, 46, 51);
    strokeWeight(4);
    line(this.x, this.y, this.strikeX, this.strikeY);
  }

}

class TrapezoidWall{
  constructor(x, y, vertices){
    this.x = x;
    this.y = y;

    //uses the vertices in an array that is initialized earlier
    this.vertices = vertices;
    
    this.options ={
      isStatic: true,
      restitution: 1,
    };

    //creates a trapezoidal body that matches the pool table image
    this.body = Bodies.fromVertices(this.x, this.y, this.vertices, this.options);
    this.body.label = "wall";
    Composite.add(world, this.body);
  }

  show(){
    //displays it for debugging purposes (currently set to transparent)
    push();
    noStroke();
    fill(255, 255, 255, 0);
    quad(
      this.vertices[0].x, this.vertices[0].y, 
      this.vertices[1].x, this.vertices[1].y,
      this.vertices[2].x, this.vertices[2].y,
      this.vertices[3].x, this.vertices[3].y,
    );
    pop();
  }
}

class Hole{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.r = holeRadius;
    
    this.options = {
      restitution: 0,
      isStatic: true,
    };

    //creates a physics body that will detect collisions to sink the ball
    this.body = Bodies.circle(this.x, this.y, this.r, this.options);
    this.body.label = "hole";

    Composite.add(world, this.body);
  }

  show(){
    push();
    noStroke();
    fill(255, 0, 0, 0);
    circle(this.x, this.y, this.r*2);
    pop();
  }
}

class ScoreDisplayer{
  constructor(x, y, team){
    this.x = x;
    this.y = y;
    this.r = scoreBallRadius;
    this.team = team;
    this.imageX = 30;

    //determines which row in the spritesheet that the image comes from
    this.imageY = this.team === "striped" ? 15: 0;
  }

  update(){
    //updates the amount of balls left (for display purposes)
    this.ballsLeft = this.team === "striped" ? stripedPlayerBalls : nonStripedPlayerBalls;
    if(this.team === "striped" === stripedPlayerPlaying && this.r < scoreBallRadius*1.5){
      this.r ++;
    }
    else if (this.team === "striped" !== stripedPlayerPlaying && this.r > scoreBallRadius*0.9){
      this.r--;
    }
  }

  show(){
    //displays a ball and a shadow for the ball being shown

    imageMode(CENTER);
    tint(10, 50);
    image(ballGridImage, this.x - shadowOffset, this.y + shadowOffset, this.r * 2, this.r * 2, this.imageX, this.imageY, 15, 15);
    
    noTint();
    image(ballGridImage, this.x, this.y, this.r * 2, this.r * 2, this.imageX, this.imageY, 15, 15);
    
    //displays the balls left
    textAlign(CENTER);
    textFont(poppins);
    textSize(30);
    fill(255);
    text(this.ballsLeft, this.x, this.y + 80);
  }
}


class WinDisplayer{
  constructor(winningPlayer){
    this.winningPlayer = winningPlayer;
    this.x = width/2;
    this.y = height;
    this.w = 600;
    this.h = 100;
    this.a = 1;
    this.colour = color(33, 58, 42);
  }
  update(){
    //raises the y value until it is at height over 2
    if(this.y > height/2){
      this.y*=0.98;
    }

    //raises the opacity of the dimming background
    if(this.a < 100){
      this.a*=1.3;
    }
  }
  show(){
    //changes the background colour
    noStroke();
    background(10, 10, 10, this.a);

    //creates a coloured rectangle around the text
    fill(this.colour);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 10, 10, 10, 10);
    
    textAlign(CENTER);
    fill(255);
    textSize(50);
    //displays which player wins
    text(this.winningPlayer + " WINS!", this.x, this.y-10);
  }
}