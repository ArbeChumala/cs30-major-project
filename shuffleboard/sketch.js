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
let coloursList = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "black"];

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
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let isStriped = true;
  let x = 2 * width / 3;
  let y = height / 2;
  for (let i = 14; 1 >= 0; i --) {
    let aBall = new Ball(x, y, coloursList[Math.floor(i / 2)], isStriped);
    balls.push(aBall);
  }
}

function draw() {
  background(220);
  for (let aBall of balls) {
    aBall.show();
  }
}

function mousePressed() {
  let aBall = new Ball(mouseX, mouseY, "red", true);
  balls.push(aBall);
}



