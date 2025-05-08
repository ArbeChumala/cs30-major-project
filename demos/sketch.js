// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// module aliases
let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;
  
// create an engine
let engine = Engine.create();
let world = engine.world;


// create two boxes and a ground
let boxA = Bodies.rectangle(400, 200, 80, 80);
let boxB = Bodies.rectangle(450, 50, 80, 80);
let ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
Composite.add(engine.world, ground);

let runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function setup(){
  createCanvas(windowWidth, windowHeight);
}

function draw(){
  background(220);
  
}

class Box{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 20;

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h);
    Composite.add(world, this.body);
  }

  show(){
    let pos = this.body.position;
    let angle = this.body.angle;

    push();

    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);

    pop();
  }
}