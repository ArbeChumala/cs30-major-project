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

let shared = [];

//constants
const PENGUIN_RADIUS = 20;

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);

function preload(){
  partyConnect(
    "wss://demoserver.p5party.org", 
    "our-amazing-knockout-game", 
    "main"
  );
  shared = partyLoadShared("shared");
  partySetShared("shared", []);
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  for(let i = 0; i<8; i++){
    let x = i < 4 ? width/2 - PENGUIN_RADIUS*(i%2 + 1)*5 : width/2 + PENGUIN_RADIUS*(i%2 + 1)*5 ;
    let y = i % 2 === 0 ? height/2 - squareWidth/4 : height/2 + squareWidth/4;
    let colour = i%2 === 0 ? color(80, 150, 200) : color((10, 10, 10)) ;
    let team = i%2 === 0 ? "host" : "guest";
    let somePenguin = new Penguin(x, y, colour, team, i);
    penguins.push(somePenguin);
  }
}

function draw(){
  background(150, 200, 255);
  rectMode(CENTER);
  noStroke();
  square(width/2, height/2, squareWidth);

  for(i = penguins.length - 1; i>=0; i--){
    penguins[i].show();

    if(penguins[i].isDead()){
      penguins.splice(i, 1);
    }
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
    if(Math.round(penguin.body.velocity.x*10)/10 !== 0 || !Math.round(penguin.body.velocity.y*10)/10 ===0){
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
  constructor(x, y, colour, team, id){
    this.x = x;
    this.y = y;
    this.r = PENGUIN_RADIUS;
    this.colour = colour;
    this.team = team;
    this.id = id;
    
    if(partyIsHost() && this.team === "host" || !partyIsHost && this.team === "guest"){
      this.arrow = new Arrow(this.x, this.y, this.id);
      arrows.push(this.arrow);
    }

    let options = {
      restitution: 0.1
    };

    this.body = Bodies.circle(this.x, this.y, this.r, options);
    Composite.add(world, this.body);
  }

  show(){
    this.update();

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

  sendVelocity(){
    if(partyIsHost() && this.team === "host" || !partyIsHost && this.team === "guest"){
      let dx = (this.arrow.x - this.arrow.penguinX)*0.05;
      let dy = (this.arrow.y - this.arrow.penguinY)*0.05;
      let velocity = Vector.create(dx, dy);
  
      shared[this.id] = velocity;
    }
  }

  recieveVelocity(){
    Body.setVelocity(this.body, shared[this.id]);
  }

  isDying(){
    return !(Math.abs(this.x - width/2) < squareWidth/2+this.r && Math.abs(this.y - height/2) < squareWidth/2+this.r);
  }

  isDead(){
    return this.r < 3;
  }
}

class Arrow{
  constructor(penguinX, penguinY){
    this.penguinX = penguinX;
    this.penguinY = penguinY;

    this.x = this.chooseX();
    this.y = this.chooseY();

    this.activity = false;
    this.colour = "black";

    this.stationaryLastFrame = true;
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