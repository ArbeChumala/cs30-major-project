// Tanks
// Samuel Wardell & Arbe Chumala
// June 13, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const PADWIDTH = 600;
const TOWERHEIGHT = 500;
const TANKWIDTH = 150;
const TANKHEIGHT = 50;

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

let redTankImg;
let blueTankImg;

let tanks = [];
let currentTank = {};
let tower;

let power;

const {Detector, Engine, Render, Runner, Vector, Body, Bodies, Composite, Events} = Matter;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();
Runner.run(runner, engine);

class CollisionZone {
  constructor(x, y, w, h, colour) {
    this.x = x + w / 2;
    this.y = y + h / 2;
    this.w = w;
    this.h = h;
    this.colour = colour;

    let options = {
      isStatic: true,
      friction: 0.8,
    };

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);

    Composite.add(world, this.body);
  }

  show() {
    fill(this.colour);
    rect(this.x, this.y, this.w, this.h);
  }
}

function preload() {
  redTankImg = loadImage("assets/images/tank-red.png");
  blueTankImg = loadImage("assets/images/tank-blue.png");
  redArrowImg = loadImage("assets/images/red-arrow-head.png");
  blueArrowImg = loadImage("assets/images/blue-arrow-head.png");
  shotFiredSound = loadSound("assets/sounds/sound-shot-fired.wav");
  explosionSound = loadSound("assets/sounds/sound-explosion.wav");
}

function setup() {
  rectMode(CENTER);
  createCanvas(windowWidth, windowHeight);

  windSpeed = 0;

  Events.on(engine, 'collisionStart', turnsRed);

  playerOneSideHeightFactor = random(50, 150);
  playerTwoSideHeightFactor = random(50, 150);
  // temporary
  currentSideHeightFactor = playerOneSideHeightFactor;

  let playerOneGround = new CollisionZone(width / 2 - PADWIDTH, height / 2 + playerOneSideHeightFactor, PADWIDTH, height / 2 - playerOneSideHeightFactor, "black");
  let playerTwoGround = new CollisionZone(width / 2, height / 2 + playerTwoSideHeightFactor, PADWIDTH, height / 2 - playerTwoSideHeightFactor, "black");
  tower = new CollisionZone(width / 2 - PADWIDTH / 4, height - TOWERHEIGHT, PADWIDTH / 4, TOWERHEIGHT, 255);

  walls.push(playerOneGround);
  walls.push(playerTwoGround);
  walls.push(tower);
  
  playerOneTank = new Tanks(width / 2 - PADWIDTH / 2, height / 2 + playerOneSideHeightFactor - TANKHEIGHT / 2, TANKWIDTH, TANKHEIGHT, "red");

  playerTwoTank = new Tanks(width / 2 + PADWIDTH / 2, height / 2 + playerTwoSideHeightFactor - TANKHEIGHT / 2, TANKWIDTH, TANKHEIGHT, "blue");

  tanks.push(playerOneTank);
  tanks.push(playerTwoTank);

  theArrow = new Arrow(playerOneTank.x, playerOneTank.y, "red");
  powerScale = new PowerScale(playerOneTank.x, playerOneTank.y + (height - playerOneTank.y) / 2, playerOneTank.colour);
}

function draw() {
  rectMode(CENTER);
  background(220);
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
  playerWins();
}

function mouseDragged() {
  if (theArrow !== null) {
    powerScale.update(height / 2 + currentSideHeightFactor, mouseX, mouseY);
    power = powerScale.returnPower();
    theArrow.update(power);
  }
}

function mousePressed() {
  if (theArrow !== null && Math.abs(mouseX - 7 * width / 8) < width / 8 && Math.abs(mouseY - height / 4) < height / 8) {
    launchBullet();
  }
}

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
  if (playerOnePlaying) {
    theBullet = new Bullet(playerOneTank.x, playerOneTank.y - TANKHEIGHT / 2 - 6, theArrow.returnAngle(), power);
  }
  else {
    theBullet = new Bullet(playerTwoTank.x, playerTwoTank.y - TANKHEIGHT / 2 - 6, theArrow.returnAngle(), power);
  }
  bulletExists = true;
  theBullet.launch();
}

//-----------------------------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------------------------
class Bullet {
  constructor(x, y, angle, power) {
    this.x = x;
    this.y = y - TANKHEIGHT / 2;
    this.r = 5;
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

    fill(this.colour);
    noStroke();

    circle(0, 0, this.r * 2);

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
    shotFiredSound.play(500);
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
    image(this.arrowImg, 0, 0, this.arrowImg.width, this.arrowImg.height);

    pop();

    noStroke();
  }

  findAngle(){
    let dy = -(this.y - this.tankY);
    let dx = this.x - this.tankX;

    let startingAngle = atan(dy/dx);

    if(dx > 0){
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
    return (this.barX - this.x + this.w / 2) * 100 / this.w + 25;
  }

  show() {
    fill(this.colour);
    rect(this.x, this.y, this.w, this.h);
    fill("green");
    rect(this.barX, this.y, this.w / 8, this.h);
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

    this.imageW = this.w;
    this.imageH = this.w/this.image.width*this.image.height;


    this.livesRemaining = 3;

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h);
    Composite.add(world, this.body);
  }

  show() {
    imageMode(CENTER);
    noSmooth();
    image(this.image, this.x, this.y, this.imageW, this.imageH);
    strokeWeight(0);
  }
}