// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// initialize matter js elements
const {Engine, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

// create an engine
let engine = Engine.create();
let world = engine.world;
engine.gravity.y = 0;

// create and run runner
let runner = Runner.create();
Runner.run(runner, engine);

let radius = 20;
let balls = [];
let walls = [];
let coloursList = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "lightgreen", "lightblue"];
let ballsMovingVar = false;
let isDrawnBack = false;
let cueSpeedFactor = 20;
let velocityRatio = 20;
let stripedPlayerPlaying = true;
let correctBallFallen = false;
let cueBallFallen = false;
let blackBallFallen = false;


function setup() {
  createCanvas(windowWidth, windowHeight);
  createBalls();
  createBoundaries();
}

function draw() {
  background(220);
  let ballX;
  let ballY;
  for (let ball of balls) {
    ball.update();
    ball.show();
    if (ball.cueBall) {
      ballX = ball.body.position.x;
      ballY = ball.body.position.y;
    }
  }
  let showCue = !ballsMoving();
  if (showCue) {
    cue.show();
    ballOut();
  }
  cue.update(ballX, ballY);
  for (let wall of walls) {
    wall.show();
  }
}

function ballOut() {
  // checks if each ball is in the area
  for (let i = balls.length - 1; i >= 0; i --) {
    if (balls[i].x < width / 8 ||
        balls[i].x > 7 * width / 8 ||
        balls[i].y < height / 8 ||
        balls[i].y > 7 * height / 8) {

      // if the ball is the cue call, sets a variable to true and tries to move it back to the middle
      if (balls[i].cueBall) {
        cueBallFallen = true;
        let homeBase = Vector.create(width/4, height/2);
        Body.setPosition(balls[i].body, homeBase);
      }

      // this stuff is irrelevant (hopefully) but it checks if it is striped, which eventually will
      // be relevant for turns, if its the cue ball, and if its the 8 ball
      else {
        if (balls[i].striped === stripedPlayerPlaying) {
        }
        if (balls[i].cueBall) {
          cueBallFallen = true;
        }
        if (balls[i].eightBall) {
          blackBallFallen = true;
        }
        balls.splice(i, 1);
      }
    }
  }
}

function ballsMoving() {
  for (let ball of balls) {
    if (ball.isMoving()) {
      return true;
    }
  }
  return false;
}

function createBalls() {
  let isStriped = true;
  let x = 2 * width / 3;
  let y = height / 2;
  let counter = [-1];
  for (let n = 0; n < 5; n ++) {
    let lastCounter = counter.length - 1;
    counter.push(counter[lastCounter] + 1);
    lastCounter ++;
    if (counter[lastCounter] === 0) {
      counter.splice(0, 1);
      lastCounter --;
    }
    let aBall;
    for (let number of counter) {
      let yModifier = number - counter[lastCounter] / 2;
      if (lastCounter === 2 && number === 1) {
        aBall = new Ball(x + lastCounter * 25 * 2**(1/2), y + yModifier * 30 * 2**(1/2), "black", false, true, false);
      }
      else {
        aBall = new Ball(x + lastCounter * 25 * 2**(1/2), y + yModifier * 30 * 2**(1/2), coloursList[coloursList.length - 1], isStriped, false, false);
        isStriped = !isStriped;
      }
      balls.push(aBall);
      if (isStriped) {
        coloursList.pop();
      }
    }
    cue = new Cue(width / 3, height / 2);
  }
  aBall = new Ball(width / 3, height / 2, "white", false, false, true);
  balls.push(aBall);
}

function createBoundaries() {
  let leftWall = new Wall(width / 8, height / 2, 10,  3 * height / 5);
  let topWall = new Wall(width / 2, height / 8, 3 * width / 4.5, 10);
  let rightWall = new Wall(7 * width / 8, height / 2, 10, 3 * height / 5);
  let bottomWall = new Wall(width / 2, 7 * height / 8, 3 * width / 4.5, 10);
  walls.push(leftWall);
  walls.push(rightWall);
  walls.push(topWall);
  walls.push(bottomWall);
}
// function mousePressed() {
//   let aBall = new Ball(mouseX, mouseY, "red", true);
//   balls.push(aBall);
// }

// ---------------------------------------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------------------------------------

class Ball{
  constructor(x, y, colour, striped, eightBall, cueBall) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.striped = striped;
    this.eightBall = eightBall;
    this.cueBall = cueBall;
    this.options = {
      restitution: 0.8,
      slop: 0.05,
      friction: 0.25,
    };

    this.body = Bodies.circle(this.x, this.y, radius, this.options);
    Composite.add(world, this.body);

    this.angle = this.body.angle;
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(this.colour);
    circle(0, 0, 2 * radius);
    if (this.striped) {
      fill("white");
      circle(0, 0, radius);
    }
    pop();
  }

  update(){
    if (Math.abs(this.body.velocity.x) < 0.1 && Math.abs(this.body.velocity.y) < 0.1) {
      let stationary = Vector.create(0, 0);
      Body.setVelocity(this.body, stationary);
    }

    this.x = this.body.position.x;
    this.y = this.body.position.y;
    this.angle = this.body.angle;
  }

  changeVelocity(distanceX, distanceY) {
    this.velocity = Vector.create(distanceX, distanceY);
    Body.setVelocity(this.body, this.velocity);
  }

  isMoving() {
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
      return false;
    }
    return true;
  }
}

class Cue{
  constructor(ballX, ballY) {
    this.ballX = ballX;
    this.ballY = ballY;

    this.x = ballX - 100 - radius;
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

  update(newBallX, newBallY) {
    this.ballY = newBallY;
    this.ballX = newBallX;

    this.distance = dist(this.x, this.y, this.ballX, this.ballY);
    this.strikeDistance = dist(this.strikeX, this.strikeY, this.ballX, this.ballY);

    if (this.movingIn) {
      this.x -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.y -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      this.strikeX -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.strikeY -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      if (this.distance < 100 + radius) {
        this.movingIn = false;
        for (let ball of balls) {
          if (ball.cueBall) {
            ball.changeVelocity(- this.distanceX / velocityRatio, - this.distanceY / velocityRatio);
          }
        }
      }
    }
    else if (mouseIsPressed && mouseX < this.x + 25 && mouseX > this.x - 25 && mouseY > this.y - 25 && mouseY < this.y + 25 &&this.distance >= 50) {
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
    else if (this.isDrawnBack &&this.distance <= 100 + radius) {
      this.isDrawnBack = false;

      this.x = this.ballX - 100 - radius;
      this.y = this.ballY;
      this.strikeX = this.ballX;
      this.strikeY = this.ballY;
    }
    else if (this.isDrawnBack && !mouseIsPressed) {
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

  show() {
    fill("black");
    stroke(4);
    line(this.x, this.y, this.strikeX, this.strikeY);
  }

}

class Wall{
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.options = {
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

  show() {
    push();
    fill("blue");
    quad(this.x1, this.y1, this.x1, this.y2, this.x2, this.y2, this.x2, this.y1);
    pop();
  }
}

