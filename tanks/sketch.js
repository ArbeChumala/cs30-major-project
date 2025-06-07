// Tanks
// Samuel Wardell & Arbe Chumala
// June 13, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let flyingBullet;
let bulletExists = false;
let windSpeed;
let walls = [];

let theArrow;
let theBullet;
let powerScale;

let playerOneSideHeightFactor;
let playerTwoSideHeightFactor;

let playerOneTank = {};
let playerTwoTank = {};
let tanks = [];

const {Detector, Engine, Render, Runner, Vector, Body, Bodies, Composite, Events} = Matter;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();
Runner.run(runner, engine);

class CollisionZone {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    let options = {
      isStatic: true,
    };

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);

    Composite.add(world, this.body);
  }

  show() {
    fill(0);
    rect(this.x, this.y, this.w, this.h);
  }
}

function setup() {
  rectMode(CENTER);
  createCanvas(windowWidth, windowHeight);

  windSpeed = 0;

  Events.on(engine, "collisionStarted", turnsRed);

  playerOneSideHeightFactor = random(2 / 3, 7 / 8);
  playerTwoSideHeightFactor = random(2 / 3, 7 / 8);

  let playerOneGround = new CollisionZone(width / 4, height * playerOneSideHeightFactor + height * playerOneSideHeightFactor / 2, width / 2, height * playerOneSideHeightFactor);
  let playerTwoGround = new CollisionZone(3 * width / 4, height * playerTwoSideHeightFactor + height * playerTwoSideHeightFactor / 2, width / 2, height * playerTwoSideHeightFactor);
  let tower = new CollisionZone(width / 2, 2 * height / 3, width / 8, 2 * height / 3);

  walls.push(playerOneGround);
  walls.push(playerTwoGround);
  walls.push(tower);
  
  playerOneTank = {
    x: width / 4,
    y: height * playerOneSideHeightFactor,
    colour: "red",
    livesRemaining: 3,
  };

  playerTwoTank = {
    x: 3 * width / 4,
    y: height * playerTwoSideHeightFactor,
    colour: "blue",
    livesRemaining: 3,
  };

  tanks.push(playerOneTank);
  tanks.push(playerTwoTank);

  theArrow = new Arrow(playerOneTank.x, playerOneTank.y);
  powerScale = new PowerScale(playerOneTank.x, playerOneTank.y + (height - playerOneTank.y) / 2, playerOneTank.colour);
}

function draw() {
  background(220);
  for (let body of walls) {
    body.show();
  }
  for (let tank of tanks) {
    fill(tank.colour);
    rect(tank.x, tank.y, width / 16, height / 16);
  }
  if (theArrow !== null) {
    theArrow.show();
    powerScale.show();
  }
}

function mouseDragged() {
  if (theArrow !== null) {
    powerScale.update(playerOneSideHeightFactor * height, mouseX, mouseY);
    let power = powerScale.returnPower();
    theArrow.update(power);
  }
}

function mousePressed() {
  if (theArrow !== null) {
    powerScale.update(playerOneSideHeightFactor * height, mouseX, mouseY);
    let power = powerScale.returnPower();
    theArrow.update(power);
  }
}

function turnsRed(event) {
  pair = event.pairs;
  pair.bodyA.render.fillStyle = 'red';
  pair.bodyB.render.fillStyle = 'red';
  objectMoving = false;
  nextPlayersTurn();

}

// ----------------------------------------------------------------------------------------------
// Called by another function
// ----------------------------------------------------------------------------------------------

function nextPlayersTurn() {
  playerOnePlaying = !playerOnePlaying;
  if (playerOnePlaying) {
    theArrow = new Arrow(playerOneTank.x, playerOneTank.y);
  }
  else {
    theArrow = new Arrow(playerTwoTank.x, playerTwoTank.y);
  }
}

//-----------------------------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------------------------
class Bullet {
  constructor(x, y, angle, power) {
    this.x = x;
    this.y = y;
    this.r = 5;
    this.colour = "red";

    this.inclinationAngle = angle;
    this.power = power;

    this.body = Bodies.circle(this.x, this.y, this.r);
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
    this.x = this.body.position.x;
    this.y = this.body.position.y;
    this.rotationAngle = this.body.angle;
    Body.applyForce(this.body, {x: width/2, y: height/2}, {x: windSpeed, y:0});
  }

  launch() {
    let velocity = Vector.create(this.power*cos(this.inclinationAngle), - this.power*sin(this.inclinationAngle));
    Body.setVelocity(this.body, velocity);
  }
}



class Arrow {
  constructor(tankX, tankY){
    this.tankX = tankX;
    this.tankY = tankY;

    this.x = this.tankX + 100;
    this.y = this.tankY + 100;
    this.colour = "black";

    this.stationaryLastFrame = true;
  }

  show() {
    //draw the line
    stroke(this.colour);
    strokeCap(ROUND);
    strokeWeight(5);
  
    line(this.x, this.y, this.tankX, this.tankY);
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

  returnPower() {
    return (this.barX - this.x + this.w / 2) * 75 / this.w + 25;
  }

  show() {
    fill(this.colour);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    rect(this.barX, this.y, this.w / 8, this.h);
  }
}