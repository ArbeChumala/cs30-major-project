// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// initialize matter js elements
const{Engine, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

// create an engine
let engine = Engine.create();
let world = engine.world;
engine.gravity.y = 0;

// create and run runner
let runner = Runner.create();
Runner.run(runner, engine);

// define initial variables
const BALL_RADIUS = 20;
const SHADOW_OFFSET = 5;
let coloursList = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "lightgreen", "lightblue"];
let balls = [];
let walls = [];
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
let stripedPlayerBalls;
let nonStripedPlayerBalls;
let playerHasWon = false;

let poolTableImg;
let ballImg;

let pixelRatio;



function preload(){
  poolTableImg = loadImage("assets/images/pool-tabeel.png");
  ballGridImage = loadImage("assets/images/balls.png");
}



function setup(){
  createCanvas(windowWidth, windowHeight);
  console.log(poolTableImg.width);
  pixelRatio = 1000/poolTableImg.width;

  // calls functions to create barriers and balls
  createGame();
}

function draw(){
  background("#294535");
  imageMode(CENTER);
  smooth();
  tint(10, 50);
  image(poolTableImg, width/2 - 2*SHADOW_OFFSET, height/2 + 2*SHADOW_OFFSET, poolTableImg.width*pixelRatio, poolTableImg.height*pixelRatio);
  noTint();
  noSmooth();
  image(poolTableImg, width/2, height/2, poolTableImg.width*pixelRatio, poolTableImg.height*pixelRatio);

  // if the eight ball has been sunk, displays winning message
  if (playerHasWon){
    showWinningPlayer(stripedPlayerPlaying);
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
      ball.update();
      ball.show();
      if (ball.cueBall){
        ballX = ball.body.position.x;
        ballY = ball.body.position.y;
      }
    }
    

    // checks if the cue should be shown and if the balls just stopped moving last frame
    let showCue = !ballsMoving();
    ballsJustStoppedMoving();

    // shows the cue when balls are not moving, and updates the cue always
    if (showCue){
      cue.show();
    }
    cue.update(ballX, ballY);

    // shows barriers
    for (let wall of walls){
      wall.show();
    }

    // shows current player playing
    fill(0);
    strokeWeight(1);
    textSize(20);
    text("is player striped playing? " + stripedPlayerPlaying, 100, 100);
  }
}

// calls createBalls and createBoundaries
function createGame(){
  createBalls();
  createBoundaries();
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
    if (balls[i].x < width / 8 ||
        balls[i].x > 7 * width / 8 ||
        balls[i].y < height / 8 ||
        balls[i].y > 7 * height / 8){

      // if the ball is the cue call, sets a variable to true and tries to move it back to the middle, as well as switching the player
      // playing if it fell (works because it is always the last ball in the array)
      if (balls[i].cueBall){
        cueBallFallen = true;
        let homeBase = Vector.create(width/4, height/2);
        Body.setPosition(balls[i].body, homeBase);
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
          playerHasWon = true;
        }
        else if (balls[i].striped){
          stripedPlayerBalls --;
        }
        else{
          nonStripedPlayerBalls --;
        }
        balls.splice(i, 1);
      }
    }
  }
  if (!samePlayerAgain){
    stripedPlayerPlaying = !stripedPlayerPlaying;
  }
}

function ballsMoving(){
  for (let ball of balls){
    if (ball.isMoving()){
      return true;
    }
  }
  return false;
}

// function createBalls(){
//   stripedPlayerBalls = 7;
//   nonStripedPlayerBalls = 7;
//   let isStriped = true;
//   let x = 2 * width / 3;
//   let y = height / 2;
//   let counter = [-1];
//   let coloursRemaining = coloursList.length - 1;
//   for (let n = 0; n < 5; n ++){
//     let lastCounter = counter.length - 1;
//     counter.push(counter[lastCounter] + 1);
//     lastCounter ++;
//     if (counter[lastCounter] === 0){
//       counter.splice(0, 1);
//       lastCounter --;
//     }
//     let aBall;
//     for (let number of counter){
//       let yModifier = number - counter[lastCounter] / 2;
//       if (lastCounter === 2 && number === 1){
//         aBall = new Ball(x + lastCounter * 25 * 2**(1/2), y + yModifier * 30 * 2**(1/2), "black", false, true, false);
//       }
//       else{
//         aBall = new Ball(x + lastCounter * 25 * 2**(1/2), y + yModifier * 30 * 2**(1/2), coloursList[coloursRemaining], isStriped, false, false);
//         isStriped = !isStriped;
//       }
//       balls.push(aBall);
//       if (isStriped){
//         coloursRemaining --;
//       }
//     }
//     cue = new Cue(width / 3, height / 2);
//   }
//   aBall = new Ball(width / 3, height / 2, "white", false, false, true);
//   balls.push(aBall);
// }

function createBalls(){
  for(let i = 0; i<15; i++){
    let column = findColumn(i);
    let x = findX(column);
    let y = findY(i,column);
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

function findX(column){
  let startingX = width/2 + 100;
  let horizontalGap = sqrt(3)*BALL_RADIUS;
  return startingX + horizontalGap*column;
}

function findY(n, column){
  let startingY = height/2;
  let firstOfRow = column*(column-1)/2;
  let placement = n-firstOfRow;

  return startingY +(column-1)*BALL_RADIUS - placement*2*BALL_RADIUS;
}

function createBoundaries(){
  walls = [];
  let horizontalDistance = 500;
  let horizontalWidth = 30;
  let verticalDistance = 260;
  let verticalHeight = 35;

  let long = {
    startX: horizontalDistance,
    endX: horizontalDistance - horizontalWidth,
    centreX: horizontalDistance - horizontalWidth/2,
    distanceX: horizontalWidth,
    centreY: height/2,
    distanceY: 2*verticalDistance - 2*horizontalWidth,
  };
  
  let short = {
    startX: horizontalDistance-horizontalWidth,
    endX: horizontalWidth,
    centreX: (horizontalDistance-horizontalWidth + horizontalWidth)/2,
    distanceX: horizontalDistance-horizontalWidth - horizontalWidth,
    startY: verticalDistance,
    endY: verticalDistance-verticalHeight,
    centreY: verticalDistance - verticalHeight/2,
    distanceY: verticalHeight,
  };

  trapezoid = [
    {x: 410, y:220},
    {x: 30, y: 220},
    {x: 30, y: 208},
    {x: 410, y: 208},
  ];

  let leftWall = new Wall(width/2 - long.centreX, long.centreY, long.distanceX,  long.distanceY);
  let rightWall = new Wall(width/2 + long.centreX, long.centreY, long.distanceX, long.distanceY);
  walls.push(leftWall);
  walls.push(rightWall);

  for(let leftRight=-1; leftRight<=1; leftRight+=2){
    for(let upDown = -1; upDown <=1; upDown +=2){
      let someShortWall = new Wall(width/2 + leftRight*short.centreX, height/2 + upDown*short.centreY, short.distanceX, short.distanceY);
      walls.push(someShortWall);
      let someShortTrapezoid = new TrapezoidWall(leftRight, upDown, trapezoid);
      walls.push(someShortTrapezoid);
    }
  }
  
  playerHasWon = false;
}
function mousePressed(){
  let x = Math.abs(width/2-mouseX);
  let y = Math.abs(height/2-mouseY);
  console.log([x, y]);
}

// ---------------------------------------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------------------------------------

class Ball{
  constructor(x, y, id){
    this.x = x;
    this.y = y;
    this.originalX = x;;
    this.originalY = y;
    this.id = id;
    this.imageX = this.id%8*15;
    this.imageY = Math.floor(this.id/8)*15;
    this.imageW = 15;
    this.striped = this.id > 7 && this.id <15;
    this.eightBall = id === 7;
    this.cueBall = id === 15;
    this.options ={
      restitution: 0.8,
      slop: 0.05,
      friction: 0.25,
    };

    this.body = Bodies.circle(this.x, this.y, BALL_RADIUS, this.options);
    Composite.add(world, this.body);

    this.angle = this.body.angle;
  }

  show(){
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noSmooth();
    imageMode(CENTER);
    tint(230);
    image(ballGridImage, 0, 0, BALL_RADIUS*2, BALL_RADIUS*2, this.imageX, this.imageY, this.imageW, this.imageW);
    noTint();
    pop();
  }

  update(){
    if (Math.abs(this.body.velocity.x) < 0.1 && Math.abs(this.body.velocity.y) < 0.1){
      let stationary = Vector.create(0, 0);
      Body.setVelocity(this.body, stationary);
    }

    this.x = this.body.position.x;
    this.y = this.body.position.y;
    this.angle = this.body.angle;
  }

  changeVelocity(distanceX, distanceY){
    this.velocity = Vector.create(distanceX, distanceY);
    Body.setVelocity(this.body, this.velocity);
  }

  drawShadow(){
    smooth();
    tint(10, 50);
    image(ballGridImage, this.x - SHADOW_OFFSET, this.y + SHADOW_OFFSET, BALL_RADIUS*2, BALL_RADIUS*2, this.imageX, this.imageY, this.imageW, this.imageW);
    noTint();
    noSmooth();
  }

  isMoving(){
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0){
      return false;
    }
    return true;
  }
}

class Cue{
  constructor(ballX, ballY){
    this.ballX = ballX;
    this.ballY = ballY;

    this.x = ballX - 100 - BALL_RADIUS;
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

  update(newBallX, newBallY){
    this.ballY = newBallY;
    this.ballX = newBallX;

    this.distance = dist(this.x, this.y, this.ballX, this.ballY);
    this.strikeDistance = dist(this.strikeX, this.strikeY, this.ballX, this.ballY);

    if (this.movingIn){
      this.x -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.y -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      this.strikeX -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.strikeY -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      if (this.distance < 100 + BALL_RADIUS){
        this.movingIn = false;
        for (let ball of balls){
          if (ball.cueBall){
            ball.changeVelocity(- this.distanceX / velocityRatio, - this.distanceY / velocityRatio);
          }
        }
      }
    }
    else if (mouseIsPressed && mouseX < this.x + 25 && mouseX > this.x - 25 && mouseY > this.y - 25 && mouseY < this.y + 25 &&this.distance >= 50){
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
    else if (this.isDrawnBack &&this.distance <= 100 + BALL_RADIUS){
      this.isDrawnBack = false;

      this.x = this.ballX - 100 - BALL_RADIUS;
      this.y = this.ballY;
      this.strikeX = this.ballX;
      this.strikeY = this.ballY;
    }
    else if (this.isDrawnBack && !mouseIsPressed){
      this.dx ++;
      this.dy ++;
      this.movingIn = true;
      this.isDrawnBack = false;

      this.distanceX = this.x - this.ballX;
      this.distanceY = this.y - this.ballY;

      cueSpeedFactor = 2000 / this.strikeDistance;
    }
    else{
      this.x = this.ballX - 100;
      this.y = this.ballY;
      this.strikeX = this.ballX;
      this.strikeY = this.ballY;
    }
  }

  show(){
    stroke("black");
    strokeWeight(4);
    line(this.x, this.y, this.strikeX, this.strikeY);
  }

}

class Wall{
  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.options ={
      isStatic: true,
      restitution: 0.8,
      slop: 0.1,
    };

    this.x1 = x - w / 2;
    this.y1 = y - h / 2;
    this.x2 = x + w / 2;
    this.y2 = y + h / 2;

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, this.options);
    Composite.add(world, this.body);
  }

  show(){
    push();
    noStroke();
    fill(255, 255, 255, 0);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h);
    pop();
  }
}

class TrapezoidWall{
  constructor(xSign, ySign, vertexArray){

    let newVertexArray = [];

    for (let vertexPair of vertexArray){
      let adjustedX = width/2 + xSign*vertexPair.x;
      let adjustedY = height/2 + ySign*vertexPair.y;

      let theObject = {
        x: adjustedX,
        y: adjustedY,
      };

      newVertexArray.push(theObject);
    }

    this.vertices = newVertexArray;
    console.log(this.vertices);

    this.options ={
      isStatic: true,
      restitution: 0.8,
      slop: 0.1,
    };

    this.body = Bodies.fromVertices(this.vertices[0].x, this.vertices[0].y, this.vertices, this.options);
    Composite.add(world, this.body);
  }

  show(){
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