// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// initialize matter js elements
let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;


// create an engine
let engine = Engine.create();
let world = engine.world;

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

}

function draw() {
  background(220);
}
