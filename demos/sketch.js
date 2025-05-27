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

    this.x1 = x - w / 2;
    this.y1 = y - h / 2;
    this.x2 = x + w / 2;
    this.y2 = y - h / 2;


    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, this.options);
    Composite.add(world, this.body);
  }

  show(){
    push();
    fill("blue");
    quad(this.x1, this.y1, this.x2, this.y1, this.x2, this.y2, this.x1, this.y2);
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
    rectMode(CENTER);
    fill("red");
    rect(0, 0, this.w, this.h);

    pop();
  }
}

// create two boxes and a ground
let boxes = [];
let themBoxes = [];
let ground; 
// = new Boundary(0, 500, width, height);

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);



function setup(){
  createCanvas(windowWidth, windowHeight);
  ground = new Boundary(0, 500, width, height);
  let boxanne = new Box(width/2, height/2);
  boxes.push(boxanne);
}

function draw(){
  background(220);
  for(let boxanne of boxes){
    boxanne.show();
  }
  for(let boxanne of themBoxes){
    rect(boxanne.x, boxanne.y, boxanne.w, boxanne.h);
  }
}

function mousePressed(){
  let boxanne = new Box(mouseX, mouseY);
  boxes.push(boxanne);
  themBoxes.push({x: mouseX, y: mouseY, w: 20, h: 20});
}

