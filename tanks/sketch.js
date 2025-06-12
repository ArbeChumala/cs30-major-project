// Tanks
// Samuel Wardell & Arbe Chumala
// June 13, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const PADWIDTH = 1200;
const TOWERHEIGHT = 600;
const TANKWIDTH = 150;
const TANKHEIGHT = 50;
const TILE_SIZE = 60;
const PIXEL_RATIO = 60/19;

let flyingBullet;
let bulletExists = false;
let windSpeed;
let walls = [];
let playerOnePlaying = true;

let theArrow;
let theBullet;
let powerScale;
let bulletStopped = false;
let collisionHasHappened = false;

let playerOneSideHeightFactor;
let playerTwoSideHeightFactor;
let currentSideHeightFactor;

let playerOneTank;
let playerTwoTank;

let redHeartImg;
let blueHeartImg;
let bulletImg;
let redTankImg;
let blueTankImg;
let tileSet;
let poppins;
let castleImg;
let redArrowImg;
let blueArrowImg;
let shotFiredSound;
let explosionSound;

let tanks = [];
let scoreDisplayers = [];
let launchButton; 
let currentTank = {};
let tower;

let power;

const {Detector, Engine, Render, Runner, Vector, Body, Bodies, Composite, Events} = Matter;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();
Runner.run(runner, engine);

class CollisionZone {
  constructor(x, y, w, h, id) {
    this.anchorX = x;
    this.anchorY = y;
    this.x = x + w / 2;
    this.y = y + h / 2;
    this.w = w;
    this.h = h;
    this.id = id;

    let options = {
      isStatic: true,
      friction: 0.8,
    };

    let tilesArray = [];

    let totalTiles = Math.ceil(this.w/TILE_SIZE);

    for(let i = 0; i<totalTiles; i++){
      if(i === 0 && this.id === "playerTwo"){
        tilesArray.push(0);
      }
      else if(i=== 1 && this.id === "playerTwo"){
        tilesArray.push(1);
      }
      else if(i === totalTiles-2 && this.id === "playerOne"){
        tilesArray.push(3);
      }
      else if(i === totalTiles-1 && this.id === "playerOne"){
        tilesArray.push(4);
      }
      else if(this.id !== "tower"){
        tilesArray.push(2);
      }
    }

    this.tiles = tilesArray;

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);

    Composite.add(world, this.body);
  }

  show() {
    if(this.id === "playerOne" || this.id === "playerTwo"){
      fill("#261729");
      rectMode(CENTER);
      rect(this.x, this.y + 19*TILE_SIZE/16 - 1, this.w, this.h);

      for(let i = 0; i<this.tiles.length; i++){
        imageMode(CORNER);
        tint(150, 180, 200);
        image(tileSet, this.anchorX + TILE_SIZE*i, this.anchorY, TILE_SIZE, 19*TILE_SIZE/16, this.tiles[i]*16, 0, 16, 19);
      }
      noTint();
    }
    else{
      imageMode(CORNER);
      image(castleImg, this.anchorX, this.anchorY, this.w, castleImg.height*this.w/castleImg.width);
    }
  }
}

function preload() {
  redHeartImg = loadImage("assets/images/red-heart.png");
  blueHeartImg = loadImage("assets/images/blue-heart.png");
  bulletImg = loadImage("assets/images/bullet.png");
  poppins = loadFont("assets/fonts/bold-poppins.ttf");
  castleImg = loadImage("assets/images/castle.png");
  tileSet = loadImage("assets/images/ground-tiles.png");
  redTankImg = loadImage("assets/images/tank-red.png");
  blueTankImg = loadImage("assets/images/tank-blue.png");
  redArrowImg = loadImage("assets/images/red-arrow-head.png");
  blueArrowImg = loadImage("assets/images/blue-arrow-head.png");
  shotFiredSound = loadSound("assets/sounds/sound-shot-fired.wav");
  explosionSound = loadSound("assets/sounds/sound-explosion.wav");
}

function setup() {
  textFont(poppins);
  rectMode(CENTER);
  createCanvas(windowWidth, windowHeight);

  windSpeed = 0;

  Events.on(engine, 'collisionStart', turnsRed);

  playerOneSideHeightFactor = random(50, 150);
  playerTwoSideHeightFactor = random(50, 150);
  // temporary
  currentSideHeightFactor = playerOneSideHeightFactor;

  let playerOneGround = new CollisionZone(width / 2 - PADWIDTH, height / 2 + playerOneSideHeightFactor, PADWIDTH, height / 2 - playerOneSideHeightFactor, "playerOne");
  let playerTwoGround = new CollisionZone(width / 2, height / 2 + playerTwoSideHeightFactor, PADWIDTH, height / 2 - playerTwoSideHeightFactor, "playerTwo");
  tower = new CollisionZone(width / 2 - PADWIDTH / 8, height - TOWERHEIGHT, PADWIDTH / 8, TOWERHEIGHT, "tower");

  walls.push(tower);
  walls.push(playerOneGround);
  walls.push(playerTwoGround);
  
  playerOneTank = new Tanks(width / 2 - PADWIDTH / 4, height / 2 + playerOneSideHeightFactor - TANKHEIGHT / 2, TANKWIDTH, TANKHEIGHT, "red");

  playerTwoTank = new Tanks(width / 2 + PADWIDTH / 4, height / 2 + playerTwoSideHeightFactor - TANKHEIGHT / 2, TANKWIDTH, TANKHEIGHT, "blue");

  tanks.push(playerOneTank);
  tanks.push(playerTwoTank);

  theArrow = new Arrow(playerOneTank.x, playerOneTank.y, "red");
  powerScale = new PowerScale(playerOneTank.x, playerOneTank.y + (height - playerOneTank.y) / 2, playerOneTank.colour);

  launchButton = createButton("Launch");
  launchButton.position(width - 150, 50);
  launchButton.mousePressed(launchBullet);

  scoreDisplayers = [new ScoreDisplayer("red"), new ScoreDisplayer("blue")];
}

function draw() {
  rectMode(CENTER);
  background("#171f29");
  for (let body of walls) {
    body.show();
  }
  for (let tank of tanks) {
    tank.show();
  }
  if (theArrow !== null) {
    theArrow.show();
    powerScale.show();
  }
  if (bulletExists) {
    theBullet.update();
    theBullet.show();
  }
  if (bulletStopped) {
    nextPlayersTurn();
  }
  for (let tank of tanks) {
    tank.show();
  }
  for(let displayer of scoreDisplayers){
    displayer.update();
    displayer.show();
  }
  playerWins();
}

// function launchButtonShow() {
//   fill("green");
//   rect(width - 25, 25, 50, 50);
// }

function mouseDragged() {
  if (theArrow !== null) {
    powerScale.update(height / 2 + currentSideHeightFactor, mouseX, mouseY);
    power = powerScale.returnPower();
    theArrow.update(power);
  }
}

// function mousePressed() {
//   if (theArrow !== null && mouseX < width && mouseX > width - 50 && mouseY > 0 && mouseY < 50) {
//     launchBullet();
//   }
// }

function turnsRed(event) {
  if (bulletExists) {
    collisionHasHappened = true;
    let notTheBall;
    let ballCollision = false;
    let pairsArray = structuredClone(event.pairs);
    console.log(theBullet.body.id);
    console.log(pairsArray);
    console.log(pairsArray[0].bodyA.id);
    if (pairsArray[0].bodyA.id === theBullet.body.id) {
      notTheBall = pairsArray.bodyB.id;
      ballCollision = true;
    }
    else if (pairsArray[0].bodyB.id === theBullet.body.id) {
      notTheBall = pairsArray[0].bodyA.id;
      ballCollision = true;
    }
    if (ballCollision) {
      // this is where an explosion thingy would make sense
      if (notTheBall === playerOneTank.body.id) {
        playerOneTank.livesRemaining --;
        nextPlayersTurn();
        explosionSound.play();
      }
      else if (notTheBall === playerTwoTank.body.id) {
        playerTwoTank.livesRemaining --;
        nextPlayersTurn();
        explosionSound.play();
      }
    }
  }
}

function playerWins() {
  if (playerOneTank.livesRemaining === 0) {
    console.log("player two wins");
  }
  if (playerTwoTank.livesRemaining === 0) {
    console.log("player one wins");
  }
}

// ----------------------------------------------------------------------------------------------
// Called by another function
// ----------------------------------------------------------------------------------------------

function nextPlayersTurn() {
  bulletStopped = false;
  Composite.remove(world, theBullet.body);
  bulletExists = false;
  playerOnePlaying = !playerOnePlaying;
  if (playerOnePlaying) {
    theArrow = new Arrow(playerOneTank.x, playerOneTank.y, "red");
    currentSideHeightFactor = playerOneSideHeightFactor;
    powerScale.updateLocation(playerOneTank.x, playerOneTank.y + (height - playerOneTank.y) / 2, playerOneTank.colour);
  }
  else {
    theArrow = new Arrow(playerTwoTank.x, playerTwoTank.y, "blue");
    currentSideHeightFactor = playerTwoSideHeightFactor;
    powerScale.updateLocation(playerTwoTank.x, playerTwoTank.y + (height - playerTwoTank.y) / 2, playerTwoTank.colour);
  }
}

function launchBullet() {
  if(theArrow !== null){
    if (playerOnePlaying) {
      theBullet = new Bullet(playerOneTank.x, playerOneTank.y - TANKHEIGHT / 2 - 6, theArrow.returnAngle(), power);
    }
    else {
      theBullet = new Bullet(playerTwoTank.x, playerTwoTank.y - TANKHEIGHT / 2 - 6, theArrow.returnAngle(), power);
    }
    bulletExists = true;
    theBullet.launch();
  }
}

//-----------------------------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------------------------
class Bullet {
  constructor(x, y, angle, power) {
    this.x = x;
    this.y = y - TANKHEIGHT / 2;
    this.r = 10;
    this.colour = "red";

    this.inclinationAngle = angle;
    this.power = power / 5;

    let options = {
      friction: 0.8,
    };

    this.body = Bodies.circle(this.x, this.y, this.r, options);
    Composite.add(world, this.body);

    this.rotationAngle = this.body.angle;
  }

  show() {
    this.update();

    push();

    translate(this.x, this.y);
    rotate(this.rotationAngle);
    tint(255);
    fill(this.colour);
    noStroke();

    image(bulletImg, 0, 0, this.r*2, this.r*2);
    noTint();
    pop();
  }

  update() {
    if (Math.abs(this.body.velocity.x) < 0.1 && Math.abs(this.body.velocity.y) < 0.1 && collisionHasHappened) {
      let stationary = Vector.create(0, 0);
      Body.setVelocity(this.body, stationary);
      bulletStopped = true;
    }
    else {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.rotationAngle = this.body.angle;
      Body.applyForce(this.body, {x: width/2, y: height/2}, {x: windSpeed, y:0});
    }
  }

  launch() {
    collisionHasHappened = false;
    console.log("this is working");
    let velocity = Vector.create(this.power*cos(this.inclinationAngle), - this.power*sin(this.inclinationAngle));
    Body.setVelocity(this.body, velocity);
    shotFiredSound.play();
  }
}



class Arrow {
  constructor(tankX, tankY, colour){
    this.tankX = tankX;
    this.tankY = tankY;

    this.x = this.tankX;
    this.y = this.tankY - 100;
    this.colour = colour;

    if(this.colour === "red"){
      this.arrowImg = redArrowImg;
    }
    else{
      this.arrowImg = blueArrowImg;
    }

    this.colour = this.colour ==="red" ? "#a5371e": "#278c90";

    this.stationaryLastFrame = true;
  }

  show() {
    let angle = this.findAngle();

    //draw the line
    stroke(this.colour);
    strokeCap(SQUARE);
    strokeWeight(8);

    line(this.x, this.y, this.tankX, this.tankY);

    push();

    translate(this.x, this.y);
    rotate(-angle);
    image(this.arrowImg, 0, 0, this.arrowImg.width*PIXEL_RATIO, this.arrowImg.height*PIXEL_RATIO);

    pop();

    noStroke();
  }

  findAngle(){
    let dy = -(this.y - this.tankY);
    let dx = this.x - this.tankX;

    let startingAngle = atan(dy/dx);

    if(dx >= 0){
      this.angle = startingAngle - PI/2;
    }
    else{
      this.angle = startingAngle + PI/2;
    }
    return this.angle;
  }

  update(power) {
    let dx;
    let dy;
    let placeholderX;
    let placeholderY;
    if (mouseY < this.tankY) {
      //calculate the angle
      dx = mouseX - this.tankX;
      dy = mouseY - this.tankY;
      placeholderX = mouseX;
      placeholderY = mouseY;
    }
    else {
      dx = this.x - this.tankX;
      dy = this.y - this.tankY;
      placeholderX = this.x;
      placeholderY = this.y;
    }

    //calculate the distance
    let distance = dist(placeholderX, placeholderY, this.tankX, this.tankY);
    

    let ratio =  power/distance;
    this.x = ratio*dx + this.tankX;
    this.y = ratio*dy + this.tankY;
    
    // else{
    //   this.x = placeholderX;
    //   this.y = placeholderY;
    // }
  }

  returnAngle() {
    let z = (this.x - this.tankX) ** 2 + (this.y - this.tankY) ** 2;
    z = z ** (1/2);
    let angle = asin((this.tankY - this.y) / z);
    if (this.x < this.tankX) {
      angle = 2 * 1.5708 - angle;
    }
    return angle;
  }
}

class PowerScale {
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.barX = x;
    this.w = width / 6;
    this.h = height / 16;

    this.colour = colour;
  }

  update(currentPlayerY, x, y) {
    if (y > currentPlayerY) {
      if (x < this.x - this.w / 2) {
        this.barX = this.x - this.w / 2;
      }
      else if (x > this.x + this.w / 2) {
        this.barX = this.x + this.w / 2;
      }
      else {
        this.barX = x;
      }
    }
  }

  updateLocation(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.barX = x;
  }

  returnPower() {
    return (this.barX - this.x + this.w / 2) * 150 / this.w + 25;
  }

  show() {
    fill(0, 70);
    rect(this.x, this.y, this.w, this.h/3, 3, 3, 3, 3);
    fill(100);
    rect(this.barX, this.y, this.w / 8, this.h, 3, 3, 3, 3);
    textAlign(CENTER);
    fill(255);
    textSize(15);
    text("Power: " + Math.round(this.returnPower()), this.x, this.y + 50);
  }
}

class Tanks {
  constructor(x, y, w, h, colour) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colour = colour;

    if(this.colour === "red"){
      this.image = redTankImg;
    }
    else{
      this.image = blueTankImg;
    }

    this.colour = "red" ? "#c14d35": "#3ba2a5";

    this.imageW = this.w;
    this.imageH = this.w/this.image.width*this.image.height;


    this.livesRemaining = 3;

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h);
    Composite.add(world, this.body);
  }

  show() {
    imageMode(CENTER);
    noSmooth();
    tint(200);
    image(this.image, this.x, this.y, this.imageW, this.imageH);
    noTint();
    strokeWeight(0);
  }
}

class ScoreDisplayer{
  constructor(playerColour){
    this.colour = playerColour;
    this.x = playerColour === "red" ? 50: width-50;
    this.y = height - 50;
    this.image = playerColour === "red" ? redHeartImg: blueHeartImg;
    this.width = 50;
  }
  update(){
    if (this.colour === "red"){
      this.livesRemaining = playerOneTank.livesRemaining;
    }
    else{
      this.livesRemaining = playerTwoTank.livesRemaining;
    }
  }
  show(){
    fill(255, 100);
    textSize(100);
    textFont(poppins);
    text("Tanks", width/2, 150);
    for(let i = 0; i<this.livesRemaining; i++){
      tint(200);
      if(this.colour === "red"){
        image(this.image, this.x + this.width*1.1*i, this.y, this.width, this.width);
      }
      else{
        image(this.image, this.x - this.width*1.1*i, this.y, this.width, this.width);
      }
      noTint();
    }
  }
}