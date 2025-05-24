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

let shared = {
  penguinBodies: [],
  penguinArrows: [],
};

// penguin arrays
let penguins = [];
let arrows = [];
let squareWidth = 600;

let indexToArrayMap = new Map();

//constants
const PENGUIN_RADIUS = 20;

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);

function preload(){
  partyConnect("wss://demoserver.p5party.org", "sarbechurdell-knockout", "main");
  partyLoadShared("shared", shared);
}

function setup(){
  createCanvas(windowWidth, windowHeight);

  if(partyIsHost()){
    for(let i = 0; i<8; i++){
      let x = random((width - squareWidth)/2,(width + squareWidth)/2 );
      let y = random((height - squareWidth)/2, (height + squareWidth)/2);
      let colour = i%2 === 0 ? color(80, 150, 200) : color((10, 10, 10)) ;
      let somePenguin = new Penguin(x, y, colour, i);
      penguins.push(somePenguin);
    }
  }
}

function draw(){
  background(150, 200, 255);
  rectMode(CENTER);
  noStroke();
  square(width/2, height/2, squareWidth);

  if(partyIsHost()){
    shared.penguinBodies = [];
    shared.penguinArrows = [];

    for(i = penguins.length - 1; i>=0; i--){
      penguins[i].updateShared();
      penguins[i].update();
      penguins[i].show();
  
      if(penguins[i].isDead()){
        penguins.splice(i, 1);
        updateIndexToArrayMap();
      }
    }
  }
  else{
    for(let penguin of shared.penguinBodies){
      fill(penguin.colour);
      circle(penguin.x, penguin.y, penguin.r * 2);
    }
  }
}

function mousePressed(){
  if(partyIsHost()){
    for(let arrow of arrows){
      arrow.activity = arrow.isActive();
    }
  }
}

function mouseReleased(){
  if(partyIsHost()){
    for(let arrow of arrows){
      arrow.activity = false;
    }
  }
}

function penguinsStationary(){
  let movingPenguinFound = false;
  for(let penguin of penguins){
    if(Math.round(penguin.body.velocity.x*10)/10 !== 0 || !Math.round(penguin.body.velocity.y*10)/10 ===0){
      movingPenguinFound = true;
    }
  }
  return !movingPenguinFound;
}

function keyPressed(){
  if(partyIsHost()){
    if(key === "p"){
      for(let penguin of penguins){
        penguin.resetVelocity();
      }
    }
  }
}

function updateIndexToArrayMap(){
  indexToArrayMap.clear();
  for(let i = 0; i<penguins.length; i++){
    let penguinID = penguins[i].dummy.id;
    indexToArrayMap.set(penguinID, i);
  }
}

//-----------------------------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------------------------
class Penguin{
  constructor(x, y, colour, id){
    this.x = x;
    this.y = y;
    this.r = PENGUIN_RADIUS;
    this.colour = colour;
    this.id = id;
    
    this.arrow = new Arrow(this.x, this.y, this.id);
    arrows.push(this.arrow);

    let options = {
      restitution: 0.1
    };

    this.body = Bodies.circle(this.x, this.y, this.r, options);

    this.dummy = {
      x: this.x,
      y: this.y,
      r: this.r,
      angle: this.body.angle,
      colour: this.colour,
      id: this.id,
    };

    shared.penguinBodies.push(this.dummy);
    
    Composite.add(world, this.body);
  }

  show(){
    this.arrow.show();

    push();
    
    translate(this.x, this.y);
    rotate(this.angle);

    fill(this.colour);
    noStroke();

    circle(0, 0, this.r * 2);

    pop();
  }

  update(){
    this.x = this.body.position.x;
    this.y = this.body.position.y;
    this.angle = this.body.angle;
    this.arrow.update(this.x, this.y);

    if (this.isDying()){
      this.r *= 0.9;
    }

    if(penguinsStationary()){
      let stationary = Vector.create(0,0);
      Body.setVelocity(this.body, stationary);
    }
  }

  updateShared(){
    let index = indexToArrayMap.get(this.id);

    this.dummy = {
      x: this.x,
      y: this.y,
      r: this.r,
      angle: this.body.angle,
      colour: this.colour,
      id: this.id,
    };

    shared.penguinBodies[index] = this.dummy;

    this.arrow.updateShared();
  }

  resetVelocity(){
    let dx = (this.arrow.x - this.arrow.penguinX)*0.05;
    let dy = (this.arrow.y - this.arrow.penguinY)*0.05;
    let velocity = Vector.create(dx, dy);

    Body.setVelocity(this.body, velocity);
  }

  isDying(){
    return !(Math.abs(this.x - width/2) < squareWidth/2+this.r && Math.abs(this.y - height/2) < squareWidth/2+this.r);
  }

  isDead(){
    return this.r < 3;
  }
}

class Arrow{
  constructor(penguinX, penguinY, id){
    this.penguinX = penguinX;
    this.penguinY = penguinY;

    this.id = id;

    this.x = this.chooseX();
    this.y = this.chooseY();

    this.activity = false;
    this.colour = "black";

    this.stationaryLastFrame = true;

    this.dummy = {
      penguinX: this.penguinX,
      penguinY: this.penguinY,
      x: this.x,
      y: this.y,
      colour: this.colour,
      id: this.id,
    };

    shared.penguinArrows.push(this.dummy);
  }

  show(){
    //the penguins have been stationary
    if(penguinsStationary() && this.stationaryLastFrame){
      //draw the line
      stroke(this.colour);
      strokeCap(ROUND);
      strokeWeight(5);
  
      line(this.x, this.y, this.penguinX, this.penguinY);
    }

    //the penguins are just stopping
    else if (penguinsStationary() && !this.stationaryLastFrame){
      this.stationaryLastFrame = true;
      
      this.x = this.chooseX();
      this.y = this.chooseY();
    }

    //the penguins are moving
    else if(!penguinsStationary()){
      this.stationaryLastFrame = false;
    }
  }

  update(x, y){
    this.penguinX = x;
    this.penguinY = y;

    this.moveWithMouse();
  }

  updateShared(){
    let index = indexToArrayMap.get(this.id);

    this.dummy = {
      penguinX: this.penguinX,
      penguinY: this.penguinY,
      x: this.x,
      y: this.y,
      colour: this.colour,
      id: this.id,
    };

    shared.penguinArrows[index] = this.dummy;
  }

  moveWithMouse(){
    if (this.activity){
      //calculate the angle
      let dx = mouseX - this.penguinX;
      let dy = mouseY - this.penguinY;

      //calculate the distance
      let distance = dist(mouseX, mouseY, this.penguinX, this.penguinY);

      if(distance > 100){
        let ratio =  100/distance;
        this.x = ratio*dx + this.penguinX;
        this.y = ratio*dy + this.penguinY;
      }
      else{
        this.x = mouseX;
        this.y = mouseY;
      }
    }
  }

  isActive(){
    return Math.abs(mouseX - this.x) <= 5 && Math.abs(mouseY - this.y) <= 5 ;
  }

  chooseNewCoordinate(reference){
    let variable;

    if(random(100) > 50){
      variable = reference + random(20, 50);
    }
    else{
      variable = reference - random(20, 50);
    }
    return variable;
  }

  chooseX(){
    return this.chooseNewCoordinate(this.penguinX);
  }

  chooseY(){
    return this.chooseNewCoordinate(this.penguinY);
  }
}