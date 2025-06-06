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
let squareWidth = 400;

let intervalID;

let hostStatus;

let playersReady = 0;

let shared = [[],[],[],[],[],[],[],[]];

//constants
const PENGUIN_RADIUS = 20;

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);

//-----------------------------------------------------------------------------------------------
//functions that are called by p5 or events
//-----------------------------------------------------------------------------------------------

function preload(){
  partyConnect(
    "wss://demoserver.p5party.org", 
    "our-amazing-knockout-game", 
    "main"
  );
  shared = partyLoadShared("shared");
  partySetShared("shared", [[],[],[],[],[],[],[],[]]);

}

function setup(){
  createCanvas(windowWidth, windowHeight);
  partySubscribe("setupGame", setupGame);
  partySubscribe("playerReady", playerReady);
  setupGame();
}

function draw(){
  background(150, 200, 255);
  rectMode(CENTER);
  noStroke();
  square(width/2, height/2, squareWidth);

  for(i = penguins.length - 1; i>=0; i--){
    penguins[i].show();

    if(penguins[i].isDead()){
      Composite.remove(world, penguins[i].body);
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

function keyPressed(){
  if(key === "p"){
    partyUnsubscribe("playerReady");
    partyEmit("playerReady");
    playerReady();
    partySubscribe("playerReady", playerReady);
  }
  if (key === "r"){
    partyUnsubscribe("setupGame");
    partyEmit("setupGame");
    setupGame();
    partySubscribe("setupGame", setupGame);
  }
}

//-----------------------------------------------------------------------------------------------
//functions called by other functions
//-----------------------------------------------------------------------------------------------

function setupGame(){
  Composite.clear(world);
  penguins = [];
  arrows = [];
  playersReady = 0;

  hostStatus = partyIsHost() ? "host" : "guest";

  for(let i = 0; i<8; i++){
    if(i <4){
      let x = width/2 - squareWidth*0.4 + i*squareWidth*0.27;
      let y = height/2 - squareWidth*0.3;
      let colour = color(80, 150, 200);
      let team = "host";
      let somePenguin = new Penguin(x, y, colour, team, i);
      penguins.push(somePenguin);
    }
    else{
      let x = width/2 - squareWidth*0.4 + (i-4)*squareWidth*0.27;
      let y = height/2 + squareWidth*0.3;
      let colour = color(10, 10, 10);
      let team = "guest";
      let somePenguin = new Penguin(x, y, colour, team, i);
      penguins.push(somePenguin);
    }
  }
}

function playerReady(){
  playersReady ++;
  console.log(playersReady);
  if(playersReady === 2){
    for(let penguin of penguins){
      penguin.sendVelocity();
    }
    intervalID = setInterval(recieveVelocities, 1000);
    playersReady = 0;
  }
}

function recieveVelocities(){
  clearInterval(intervalID);
  for(let penguin of penguins){
    penguin.recieveVelocity();
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
    
    if(this.team === hostStatus){
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

    if(this.team === hostStatus){
      this.arrow.show();
    }

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

    if(this.team === hostStatus){
      this.arrow.update(this.x, this.y);
    }

    if (this.isDying()){
      this.r *= 0.9;
    }

    if(penguinsStationary()){
      let stationary = Vector.create(0,0);
      Body.setVelocity(this.body, stationary);
    }
  }

  sendVelocity(){
    if(this.team === hostStatus){
      let dx = (this.arrow.x - this.arrow.penguinX)*0.05;
      let dy = (this.arrow.y - this.arrow.penguinY)*0.05;
  
      shared[this.id] = [dx, dy];
    }
  }

  recieveVelocity(){
    let velocity = Vector.create(shared[this.id][0],shared[this.id][1]);
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