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
let coloursList = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "lightgreen", "lightblue"];
let ballsMoving = false;
let isDrawnBack = false;
let cueSpeedFactor = 20;



function setup() {
  createCanvas(windowWidth, windowHeight);
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
    console.log(counter);
    let aBall;
    for (let number of counter) {
      console.log(number);
      let yModifier = number - counter[lastCounter] / 2;
      console.log(yModifier);
      console.log(counter);
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

function draw() {
  background(220);
  for (let ball of balls) {
    ball.show();
  }
  cue.update();
  cue.show();
}

// function mousePressed() {
//   let aBall = new Ball(mouseX, mouseY, "red", true);
//   balls.push(aBall);
// }


// Classes
// ---------------------------------------------------------------------------------------------------------

class Ball {
  constructor(x, y, colour, striped, eightBall, cueBall) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.striped = striped;
    this.eightBall = eightBall;
    this.cueBall = cueBall;

    let options = {
      restitution: 0.1,
    };

    this.body = Bodies.circle(this.x, this.y, radius, {options});
    Composite.add(world, this.body);
  }

  show() {
    push();
    let pos = this.body.position;
    let angle = this.body.angle;
    translate(pos.x, pos.y);
    rotate(angle);
    
    fill(this.colour);
    circle(0, 0, 2 * radius);
    if (this.striped) {
      fill("white");
      circle(0, 0, radius);
    }
    pop();
  }

  update() {
    
  }

  strikeCueBall(dx, dy) {
    for (let ball of balls) {
      if (this.cueBall) {
        this.body.velocity(dx, dy);
      }
    }
  }
}

class Cue {
  constructor(ballX, ballY) {
    this.ballX = ballX;
    this.ballY = ballY;

    this.x = ballX - 100 - radius;
    this.y = ballY;
    this.dx = 0;
    this.dy = 0;

    this.strikeX = ballX;
    this.strikeY = ballY;

    this.distanceX = 100;
    this.distanceY = 0;

    this.ratio;
    this.distance;
    this.strikeDistance;
    this.strikeRatio;

    this.isDrawnBack = false;
  };

  update() {
    this.distance = dist(this.x, this.y, this.ballX, this.ballY);
    this.strikeDistance = dist(this.strikeX, this.strikeY, this.ballX, this.ballY);
    
    if (this.movingIn) {
      this.x -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.y -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      this.strikeX -= this.strikeRatio * this.distanceX / cueSpeedFactor;
      this.strikeY -= this.strikeRatio * this.distanceY / cueSpeedFactor;

      if (this.distance < 100 + radius) {
        console.log("baddabing");
        this.movingIn = false;
      }
    }
    else if (mouseIsPressed && mouseX < this.x + 25 && mouseX > this.x - 25 && mouseY > this.y - 25 && mouseY < this.y + 25 &&this.distance >= 100) {
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
      console.log("hi");
      this.movingIn = true;
      this.isDrawnBack = false;

      this.distanceX = this.x - this.ballX;
      this.distanceY = this.y - this.ballY;

      cueSpeedFactor = 2000 / this.strikeDistance;
    }
  }

  show() {
    fill("black");
    stroke(4);
    line(this.x, this.y, this.strikeX, this.strikeY);
  }

}

