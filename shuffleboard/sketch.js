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

class Shuffleboard {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.diameter = 50;
    this.team = team;
    this.options = {
      density: 0,
    };

    this.body = Bodies.circle(this.x, this.y, this.diameter, this.options);
    Composite.add(world, this.body);
  }

  show() {

  }
}



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
  }
  aBall = new Ball(width / 3, height / 2, "white", false, false, true);
  balls.push(aBall);
}

function draw() {
  background(220);
  for (let ball of balls) {
    ball.show();
  }
}

function mousePressed() {
  let aBall = new Ball(mouseX, mouseY, "red", true);
  balls.push(aBall);
}


// Classes
// ---------------------------------------------------------------------------------------------------------

class Ball {
  constructor(x, y, colour, striped, eightBall) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.striped = striped;
    this.eightBall = eightBall;

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
}

class Cue {
  constructor(ballX, ballY) {
    this.strikeX = ballX;
    this.strikeX = ballY;

    this.x = ballX - 100;
    this.y = ballY;
  };

  update() {
    if (mouseIsPressed && mouseX < this.x + 25 && mouseX > this.x - 25 && mouseY > this.y - 25 && mouseY < this.y + 25) {
      this.x = mouseX;
      this.y = mouseY;
    }
  }

}

