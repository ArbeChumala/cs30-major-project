// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// module aliases
const {Engine, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

// create an engine
let engine = Engine.create();
let world = engine.world;
engine.gravity.y=0;

// penguin arrays
let penguins = [];
let arrows = [];
let squareWidth = 600;

//constants
const PENGUIN_RADIUS = 20;

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

function mousePressed(){
  for(let arrow of arrows){
    arrow.activity = arrow.isActive();
  }
}

function mouseReleased(){
  for(let arrow of arrows){
    arrow.activity = false;
  }
}

function penguinsStationary(){
  let movingPenguinFound = false;
  for(let penguin of penguins){
    if(Math.round(penguin.body.velocity.x) !== 0 || !Math.round(penguin.body.velocity.y) ===0){
      movingPenguinFound = true;
    }
  }
  return !movingPenguinFound;
}


function keyPressed(){
  if(key === "p"){
    for(let penguin of penguins){
      penguin.resetVelocity();
    }
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
    
    this.arrow = new Arrow(this.x, this.y);
    arrows.push(this.arrow);

    let options = {
      restitution: 0.7
    };

    this.body = Bodies.circle(this.x, this.y, this.r, options);
    Composite.add(world, this.body);
  }

  show(){
    let pos = this.body.position;
    let angle = this.body.angle;

    this.x = pos.x;
    this.y = pos.y;
    
    this.arrow.show(this.x, this.y);


    push();
    
    translate(pos.x, pos.y);


    rotate(angle);

    fill(this.colour);
    noStroke();

    circle(0, 0, this.r * 2);

    pop();

  }

  resetVelocity(){
    let dx = (this.arrow.x - this.arrow.penguinX)*0.1;
    let dy = (this.arrow.y - this.arrow.penguinY)*0.1;
    let velocity = Vector.create(dx, dy);

    Body.setVelocity(this.body, velocity);
  }
}

class Arrow{
  constructor(penguinX, penguinY){
    if(random(100) > 50){
      this.x = penguinX + random(20, 50);
    }
    else{
      this.x = penguinX - random(20, 50);
    }
    if(random(100) > 50){
      this.y = penguinY + random(20, 50);
    }
    else{
      this.y = penguinY - random(20, 50);
    }
    this.penguinX = penguinX;
    this.penguinY = penguinY;
    this.activity = false;
    this.colour = "black";
  }

  show(x, y){
    this.update(x, y);

    stroke(this.colour);
    strokeCap(ROUND);
    strokeWeight(5);

    line(this.x, this.y, this.penguinX, this.penguinY);
  }

  update(x, y){
    this.penguinX = x;
    this.penguinY = y;

    if (this.activity){
      if(Math.abs(this.x - this.penguinX) < 100){
        this.x = mouseX;
      }
      if (Math.abs(this.y - this.penguinY) < 100){
        this.y = mouseY;
      }
    }
  }

  isActive(){
    return mouseX < this.x + 5 && mouseX >this.x - 5 && mouseY < this.y + 5 && mouseY > this.y - 5 ;
  }
}