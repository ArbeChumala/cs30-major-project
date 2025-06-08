// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// module aliases
const {Engine, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

let myRoom;
let userInput;
let theColour;

// create an engine
let engine = Engine.create();
let world = engine.world;
engine.gravity.y=0;

// penguin arrays
let penguins = [];
let arrows = [];
let squareWidth = 450;

let hostStatus;

let playersReady = 0;

let poppins;
let blackPenguinImg;
let bluePenguinImg;
let iceImg;
let penguinShadowImg;
let iceShadowImg;
let blackArrowHeadImg;
let blueArrowHeadImg;

let shared;

//constants
const PENGUIN_RADIUS = 30;
const SHADOW_OFFSET = 5;
const PIXEL_RATIO = 60/19;

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);

//-----------------------------------------------------------------------------------------------
//functions that are called by p5 or events
//-----------------------------------------------------------------------------------------------

function preload(){
  poppins = loadFont("assets/fonts/bold-poppins.ttf");
  blackPenguinImg = loadImage("assets/images/black-penguin.png");
  bluePenguinImg = loadImage("assets/images/blue-penguin.png");
  iceImg = loadImage("assets/images/ice.png");
  penguinShadowImg = loadImage("assets/images/shadow.png");
  iceShadowImg = loadImage("assets/images/ice-shadow.png");
  blackArrowHeadImg = loadImage("assets/images/black-arrow-head.png");
  blueArrowHeadImg = loadImage("assets/images/blue-arrow-head.png");
}

function setup(){
  theColour = color(120, 157, 176);
  noLoop();
  imageMode(CENTER);
  createCanvas(windowWidth, windowHeight);
  userInput = createInput('main');
  userInput.center();
  background(141, 178, 196);
  textSize(100);
  textAlign(CENTER);
  textFont(poppins);
  fill(255);
  text("Join Room", width/2, height/2 - 100);
}

function draw(){
  if(myRoom){
    background(theColour);
    rectMode(CENTER);
    noStroke();
    
    noSmooth();
    
    image(iceShadowImg, width/2 - SHADOW_OFFSET*5*0.5, height/2+5*(squareWidth/120) + SHADOW_OFFSET*5, squareWidth, squareWidth*1.1 + 1.1*10*(squareWidth/120));

    image(iceImg, width/2, height/2+5*(squareWidth/120), squareWidth, squareWidth + 10*(squareWidth/120));
  
    for(i = penguins.length - 1; i>=0; i--){
      penguins[i].show();
  
      if(penguins[i].isDead()){
        Composite.remove(world, penguins[i].body);
        
        if(penguins[i].team === hostStatus){
          index = arrows.indexOf(penguins[i].arrow);
          arrows.splice(index, 1);
        }

        penguins.splice(i, 1);
      }
    }
  }
}

function mousePressed(){
  if(myRoom){
    for(let arrow of arrows){
      arrow.activity = arrow.isActive();
    }
  }
}

function mouseReleased(){
  if(myRoom){
    for(let arrow of arrows){
      arrow.activity = false;
    }
  }
}

function keyPressed(){
  if(!myRoom && key === "Enter"){
    startParty();
  }
  else if(myRoom && key === "p"){
    partyEmit("playerReady");
  }
  else if (myRoom && key === "r"){
    partyEmit("setupGame");
  }
}

//-----------------------------------------------------------------------------------------------
//functions called by other functions
//-----------------------------------------------------------------------------------------------
function startParty(){
  myRoom = userInput.value();
  partyConnect(
    "wss://demoserver.p5party.org", 
    "our-amazing-knockout-game", 
    myRoom,
  );
  
  partySubscribe("setupGame", setupGame);
  partySubscribe("playerReady", playerReady);
  partySubscribe("recieveVelocities", recieveVelocities);
  partySubscribe("hostSendVelocities", hostSendVelocities);
  partySubscribe("checkIfReady", checkIfReady);

  shared = partyLoadShared("shared",
    {
      velocities: [0, 0, 0, 0, 0, 0, 0, 0],
    }, 
    setupGame);
}

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
      let team = "host";
      let somePenguin = new Penguin(x, y, team, i);
      penguins.push(somePenguin);
    }
    else{
      let x = width/2 - squareWidth*0.4 + (i-4)*squareWidth*0.27;
      let y = height/2 + squareWidth*0.3;
      let team = "guest";
      let somePenguin = new Penguin(x, y, team, i);
      penguins.push(somePenguin);
    }
  }

  removeElements();
  loop();
}

function playerReady(){
  playersReady ++;

  if(playersReady === 2){
    if(!partyIsHost()){
      partySetShared(shared, {velocities: [0, 0, 0, 0, 0, 0, 0, 0]});
      guestSendVelocities();
    }
    playersReady = 0;
  }
}

function hostSendVelocities(){
  if(partyIsHost()){
    for(let penguin of penguins){
      if(shared.velocities[penguin.id].length !== 2){
        penguin.sendVelocity();
      }
    }
    partyEmit("checkIfReady");
  }
}

function checkIfReady(){
  if(!partyIsHost()){
    let isReady = true;

    for(let penguin of penguins){
      if (shared.velocities[penguin.id].length !== 2){
        isReady = false;
      }
    }

    if(isReady){
      partyEmit("recieveVelocities");
    }
    else{
      partyEmit("hostSendVelocities");
    }
  }
}

function guestSendVelocities(){
  if(!partyIsHost()){
    for(let penguin of penguins){
      penguin.sendVelocity();
    }
    
    partyEmit("hostSendVelocities");
  }
}

function recieveVelocities(){
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
  constructor(x, y, team, id){
    this.x = x;
    this.y = y;
    this.r = PENGUIN_RADIUS;
    this.team = team;
    this.id = id;
    
    if(this.team === hostStatus){
      this.arrow = new Arrow(this.x, this.y, this.id);
      arrows.push(this.arrow);
    }

    if(this.team === "host"){
      this.image = bluePenguinImg;
    }
    else{
      this.image = blackPenguinImg;
    }

    let options = {
      restitution: 0.1
    };

    this.body = Bodies.circle(this.x, this.y, this.r, options);
    Composite.add(world, this.body);
  }

  show(){
    this.update();
    if(this.arrow){
      this.arrow.show();
    }

    image(penguinShadowImg, this.x - SHADOW_OFFSET*0.5, this.y + SHADOW_OFFSET, this.r * 2 * 1.5, this.r * 2 * 1.5);

    push();
    
    translate(this.x, this.y);
    rotate(this.angle);

    noSmooth();
    image(this.image, 0, 0, this.r*2, this.r*2);

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

      shared.velocities[this.id] = [dx, dy];
    }
  }

  recieveVelocity(){
    let velocity = Vector.create(shared.velocities[this.id][0],shared.velocities[this.id][1]);
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

    if(!partyIsHost()){
      this.colour = color(48, 49, 59);
      this.arrowImg = blackArrowHeadImg;
    }
    else{
      this.colour = color(40, 101, 116);
      this.arrowImg = blueArrowHeadImg;
    }

    this.stationaryLastFrame = true;
  }

  show(){
    //the penguins have been stationary
    if(penguinsStationary() && this.stationaryLastFrame){
      //draw the line
      stroke(this.colour);
      strokeCap(SQUARE);
      strokeWeight(8);
  
      line(this.x, this.y, this.penguinX, this.penguinY);

      push();

      translate(this.x, this.y);
      rotate(-this.angle);
      image(this.arrowImg, 0, 0, this.arrowImg.width*PIXEL_RATIO, this.arrowImg.height*PIXEL_RATIO);

      pop();
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
    
    let dy = -(this.y - this.penguinY);
    let dx = this.x - this.penguinX;

    let startingAngle = atan(dy/dx);

    if(dx > 0){
      this.angle = startingAngle - PI/2;
    }
    else{
      this.angle = startingAngle + PI/2;
    }

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