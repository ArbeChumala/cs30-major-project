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
engine.gravity.y=0;

// penguin arrays
let penguins = [];
let squareWidth = 600;

//constants
const PENGUIN_RADIUS = 40;

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);

function setup(){
  createCanvas(windowWidth, windowHeight);
  for(let i = 0; i<8; i++){
    let x = random((width - squareWidth)/2,(width + squareWidth)/2 );
    let y = random((height - squareWidth)/2, (height + squareWidth)/2);
    let colour = i%2 === 0 ? color(80, 150, 200) : color((10, 10, 10)) ;
    let somePenguin = new Penguin(x, y, colour);
    penguins.push(somePenguin);
  }
}

function draw(){
  background(150, 200, 255);
  rectMode(CENTER);
  noStroke();
  square(width/2, height/2, squareWidth);

  for(let penguin of penguins){
    penguin.show();
  }
}

//-----------------------------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------------------------
class Penguin{
  constructor(x, y, colour){
    this.x = x;
    this.y = y;
    this.r = PENGUIN_RADIUS;
    this.colour = colour;

    this.body = Bodies.circle(this.x, this.y, this.r);
    Composite.add(world, this.body);
  }

  show(){
    push();

    let pos = this.body.position;
    let angle = this.body.angle;

    translate(pos.x, pos.y);
    rotate(angle);

    fill(this.colour);
    circle(0, 0, this.r);

    pop();
  }
}
