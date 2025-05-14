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

class Boundary{
  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.options = {
      isStatic: true,
    };

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, this.options);
    Composite.add(world, this.body);
  }

  show(){
    push();
    fill("blue");
    rect(this.x, this.y, this.w, this.h);
    pop();
  }
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
    rectMode(CORNER);
    fill("red");
    rect(0, 0, this.w, this.h);

    pop();
  }
}

// create two boxes and a ground
let boxes = [];
let ground;

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);



function setup(){
  createCanvas(windowWidth, windowHeight);
  ground = new Boundary(width/2, height-500, width, 500);
  let boxanne = new Box(width/2, height/2);
  boxes.push(boxanne);
}

function draw(){
  background(220);
  for(let boxanne of boxes){
    boxanne.show();
  }
}

function mousePressed(){
  let boxanne = new Box(mouseX, mouseY);
  boxes.push(boxanne);
}

