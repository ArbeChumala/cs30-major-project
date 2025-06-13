// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// module aliases
const {Engine, Events, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

let myRoom;
let myId;
let userInput;
let theColour;

// create an engine
let engine = Engine.create();
let world = engine.world;
engine.gravity.y=0;

// penguin arrays
let penguins = [];
let arrows = [];
let winDisplayer;

let squareWidth = 450;

let hostStatus;
let playerCanJoin = true;
let gameOver = false;

let playersReady = [];

let bluePenguinCount = 0;
let blackPenguinCount = 0;

let poppins;
let blackPenguinImg;
let bluePenguinImg;
let iceImg;
let penguinShadowImg;
let iceShadowImg;
let blackArrowHeadImg;
let blueArrowHeadImg;
let boingSound;
let splashSound;

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

// preloads fonts, images, and sounds
function preload(){
  poppins = loadFont("assets/fonts/bold-poppins.ttf");
  blackPenguinImg = loadImage("assets/images/black-penguin.png");
  bluePenguinImg = loadImage("assets/images/blue-penguin.png");
  iceImg = loadImage("assets/images/ice.png");
  penguinShadowImg = loadImage("assets/images/shadow.png");
  iceShadowImg = loadImage("assets/images/ice-shadow.png");
  blackArrowHeadImg = loadImage("assets/images/black-arrow-head.png");
  blueArrowHeadImg = loadImage("assets/images/blue-arrow-head.png");
  boingSound = loadSound("assets/sounds/boing.mp3");
  splashSound = loadSound("assets/sounds/splash.m4a");
}

// sets initial inputs and initialized collisionStart to call penguinsCollided when a collision occurs
function setup(){
  myId = random();
  theColour = color(120, 157, 176);
  noLoop();
  imageMode(CENTER);
  createCanvas(windowWidth, windowHeight);
  userInput = createInput('main');
  userInput.center();
  background(theColour);
  textSize(100);
  textAlign(CENTER);
  textFont(poppins);
  fill(255);
  text("Join Room", width/2, height/2 - 100);
  Events.on(engine, "collisionStart", penguinsCollided);
}

// if a player is in a p5party room, calls all necessary functions. If they are waiting displays waiting screen and if the room is full
// displays a sorry, room full message
function draw(){
  if(myRoom){
    if(partyLoadGuestShareds().length === 2){
      background(theColour);

      displayIce();
      determineScore();
      displayScore();
      displayPenguins();
      
      if(!gameOver){
        determineWinner();
      }
      else{
        displayWinScreen();
      }
      
    }
    else if(partyLoadGuestShareds().length ===1){
      noStroke();
      background(theColour);
      textSize(100);
      text("Join Room", width/2, height/2 - 100);
      textSize(30);
      text("Waiting for a friend...", width/2, height/2);
    }
  }
  if(!playerCanJoin){
    background("#445f6e");
    textSize(30);
    text("Sorry, only two to a room... You snooze, you lose", width/2, height/2);
  }
}

// sets arrows to an activity based on arrow.isActive when the mouse is pressed
function mousePressed(){
  if(myRoom){
    for(let arrow of arrows){
      arrow.activity = arrow.isActive();
    }
  }
}

// sets all arrow activities to false when mouse is released
function mouseReleased(){
  if(myRoom){
    for(let arrow of arrows){
      arrow.activity = false;
    }
  }
}

// /allows player to reset, play, and enter rooms based on key presses
function keyPressed(){
  if(!myRoom && key === "Enter"){
    startParty();
  }
  else if(myRoom && key === "p"){
    for(let arrow of arrows){
      arrow.invisible = true;
    }
    partyEmit("playerReady", {player: hostStatus});
  }
  else if (myRoom && key === "r"){
    partyEmit("setupGame");
  }
}

//-----------------------------------------------------------------------------------------------
//functions called by other functions
//-----------------------------------------------------------------------------------------------

// plays collision sound when penguins collide
function penguinsCollided(){
  boingSound.play();
}

function displayWinScreen(){
  winDisplayer.update();
  winDisplayer.show();
}

function displayIce(){
  image(iceShadowImg, width/2 - SHADOW_OFFSET*5*0.5, height/2+5*(squareWidth/120) + SHADOW_OFFSET*5, squareWidth, squareWidth*1.1 + 1.1*10*(squareWidth/120));
  imageMode(CORNER);
  image(iceImg, width/2 - squareWidth/2, height/2-squareWidth/2, squareWidth, squareWidth + 10*(squareWidth/120));
  imageMode(CENTER);
}

// shows all penguins, playing a sound and removing them if they fall of the map
function displayPenguins(){
  for(i = penguins.length - 1; i>=0; i--){
    penguins[i].show();

    if(penguins[i].isDead()){
      splashSound.play();
      Composite.remove(world, penguins[i].body);
      
      if(penguins[i].team === hostStatus){
        index = arrows.indexOf(penguins[i].arrow);
        arrows.splice(index, 1);
      }

      penguins.splice(i, 1);
    }
  }
}

// shows a score for each player based on the amount of penguins they have remaining
function determineScore(){
  bluePenguinCount = 0;
  blackPenguinCount = 0;

  for(let penguin of penguins){
    if(penguin.team === "guest"){
      blackPenguinCount ++;
    }
    else if(penguin.team === "host"){
      bluePenguinCount++;
    }
  }
}

function displayScore(){
  noStroke();
  noSmooth();

  //displays the title and objective
  textSize(70);
  text("Knockout", width/2, 100);
  textSize(15);
  text("Drown your opponents!", width/2, 130);

  //displays the score for each player
  textSize(40);
  text(bluePenguinCount, width/2+squareWidth, height/2+75);
  text(blackPenguinCount, width/2-squareWidth, height/2+75);

  //the tile that is opaque will indicate the current player
  if (hostStatus === "host"){
    tint(250, 100);
    image(blackPenguinImg, width/2-squareWidth, height/2-50, bluePenguinImg.width*PIXEL_RATIO*2, bluePenguinImg.width*PIXEL_RATIO*2);
    noTint();
    image(bluePenguinImg, width/2+squareWidth, height/2-50, blackPenguinImg.width*PIXEL_RATIO*2, bluePenguinImg.width*PIXEL_RATIO*2);
  }
  else{
    noTint();
    image(blackPenguinImg, width/2-squareWidth, height/2-50, bluePenguinImg.width*PIXEL_RATIO*2, bluePenguinImg.width*PIXEL_RATIO*2);
    tint(250, 100);
    image(bluePenguinImg, width/2+squareWidth, height/2-50, blackPenguinImg.width*PIXEL_RATIO*2, bluePenguinImg.width*PIXEL_RATIO*2);
    noTint();
  }

  //displays some instructions
  textSize(15);
  if(!gameOver){
    text("Press P when Ready To Launch!", width/2, height-60);
    text("Press R to Reset", width/2, height-40);
  }
}

// if one or both players have lost all their penguins, shows the winner (arbeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee update winScreen here)
function determineWinner(){
  if(penguinsStationary()){
    if(penguins.length > 0 && bluePenguinCount===0){
      removeElements();
      gameOver = true;
      winDisplayer = new WinDisplayer("BLACK");
    }
    else if(penguins.length > 0 && blackPenguinCount===0){
      removeElements();
      gameOver = true;
      winDisplayer = new WinDisplayer("BLUE");
    }
    else if (penguins.length ===0){
      removeElements();
      gameOver = true;
      winDisplayer = new WinDisplayer("TIE");
    }
  }
}

// initializes the p5party for the game
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

// ititializes the game, resetting penguin locations and arrows, disconnecting the room if it is no longer full
function setupGame(){
  Composite.clear(world);
  penguins = [];
  arrows = [];
  playersReady = [];

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

  textFont(poppins);

  if(partyLoadGuestShareds().length <2){
    partyLoadMyShared({name: myId});
  }
  else if(partyLoadGuestShareds()[0].name !== myId && partyLoadGuestShareds()[1].name !== myId){
    playerCanJoin = false;
    myRoom = false;
    partyDisconnect();
  }

  removeElements();

  loop();
}

// arbeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
function playerReady(dataObject){
  if(playersReady.length === 0){
    playersReady.push(dataObject.player);
  }
  else if(playersReady.length === 1){
    if(playersReady[0] !== dataObject.player){
      playersReady.push(dataObject.player);
    }
  }

  if(playersReady.length === 2){
    if(!partyIsHost()){
      partySetShared(shared, {velocities: [0, 0, 0, 0, 0, 0, 0, 0]});
      guestSendVelocities();
    }
    playersReady = [];
  }
}

// shares the penguin velocities with the non-host player
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

// checks if the velocities need to be sent or are still being requested
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

// arbeeeeeeeeeeeeeee
function guestSendVelocities(){
  if(!partyIsHost()){
    for(let penguin of penguins){
      penguin.sendVelocity();
    }
    
    partyEmit("hostSendVelocities");
  }
}

// arbeeeeeeeeeee
function recieveVelocities(){
  for(let penguin of penguins){
    penguin.recieveVelocity();
  }
}

// checks if all penguins are stationary
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
    return !(Math.abs(this.x - width/2) < squareWidth/2+this.r*0.7 && Math.abs(this.y - height/2) < squareWidth/2+this.r*0.7);
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
    this.invisible = false;

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
    if(penguinsStationary() && this.stationaryLastFrame && !this.invisible){
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
      this.invisible = false;
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

class WinDisplayer{
  constructor(winningPlayer){
    this.winningPlayer = winningPlayer;
    this.x = width/2;
    this.y = height;
    this.w = 500;
    this.h = 100;
    this.a = 1;
    this.colour = color(46, 87, 104);
  }
  update(){
    if(this.y > height/2){
      this.y*=0.98;
    }
    if(this.a < 100){
      this.a*=1.3;
    }
  }
  show(){
    noStroke();
    background(10, 10, 10, this.a);
    fill(this.colour);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 10, 10, 10, 10);
    textAlign(CENTER);
    fill(255);
    textSize(50);

    if(this.winningPlayer !== "TIE"){
      text(this.winningPlayer + " WINS!", this.x, this.y-10);
    }
    else{
      text("IT'S A TIE!", this.x, this.y-10);      
    }
  }
}