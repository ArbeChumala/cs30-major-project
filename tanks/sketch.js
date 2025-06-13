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
let walls = [];
let playerOnePlaying = true;
let gifPlayable = false;

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
let explosionGif;

let tanks = [];
let scoreDisplayers = [];
let launchButton; 
let currentTank = {};
let tower;

let power;

// sets matter js elements as part of matter and creates, engine, world, and runner
const {Detector, Engine, Render, Runner, Vector, Body, Bodies, Composite, Events} = Matter;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();
Runner.run(runner, engine);


// prelaods images and sounds
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
  explosionGif = loadImage("assets/images/explosion.gif");
}

function setup() {
  textFont(poppins);
  rectMode(CENTER);
  createCanvas(windowWidth, windowHeight);

  // creates an event which will be called into collisionStarted funtion when a collision begins
  Events.on(engine, 'collisionStart', collisionStarted);

  // sets random height factors then creates and pushes collisions zones for the ground and tower
  playerOneSideHeightFactor = random(50, 150);
  playerTwoSideHeightFactor = random(50, 150);
  currentSideHeightFactor = playerOneSideHeightFactor;

  let playerOneGround = new CollisionZone(width / 2 - PADWIDTH, height / 2 + playerOneSideHeightFactor, PADWIDTH, height / 2 - playerOneSideHeightFactor, "playerOne");
  let playerTwoGround = new CollisionZone(width / 2, height / 2 + playerTwoSideHeightFactor, PADWIDTH, height / 2 - playerTwoSideHeightFactor, "playerTwo");
  tower = new CollisionZone(width / 2 - PADWIDTH / 8, height - TOWERHEIGHT, PADWIDTH / 8, TOWERHEIGHT, "tower");

  walls.push(tower);
  walls.push(playerOneGround);
  walls.push(playerTwoGround);
  
  // creates and pushes tanks, creates arrow and powerScale
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

// updates and shows different objects depending on whether a bullet is being fired and calls next players turn when necessary
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
  if(gifPlayable){
    playTheGif(theBullet.x, theBullet.y - 75);
  }
  playerWins();
}

// updates the powerScale and arrow when the mouse is dragged
function mouseDragged() {
  if (theArrow !== null) {
    powerScale.update(height / 2 + currentSideHeightFactor, mouseX, mouseY);
    power = powerScale.returnPower();
    theArrow.update(power);
  }
}

// when a collision occurs, checks what is colliding and plays sounds and lowers players lives if a ball strikes a tank
function collisionStarted(event) {
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
      if(!gifPlayable){
        explosionGif.setFrame(0);
      }
      gifPlayable = true;
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

// arbeeeeeeeeeeeeeeeeeee this is the win screen thingggggggggggggggggggggggggggggggggggggggggg
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

function playTheGif(x, y){
  if(explosionGif.getCurrentFrame() !== explosionGif.numFrames() -1){
    image(explosionGif, x, y, 200, 240);
  }
  else{
    gifPlayable = false;
  }
}

// removes the bullet from the world and swithces the players turn by moving the arrow and powerScale to the other tank
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

// fires the bullet from the tank of the player playing based on the arrow angle and powerScale
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
class CollisionZone {

  // creates a static physics body based on x, y, w, and h, and creates the tiles for the ground under each player
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

  // draws either the tower or ground, depending on whether the collisionZone is attributed to one of the players
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

class Bullet {

  // creates the bullet based on inputted x, y, angle, and power, with a set radius
  constructor(x, y, angle, power) {
    this.x = x;
    this.y = y - TANKHEIGHT / 2;
    this.r = 15;

    this.inclinationAngle = angle;
    this.power = power / 5;

    let options = {
      friction: 0.8,
    };

    this.body = Bodies.circle(this.x, this.y, this.r, options);
    Composite.add(world, this.body);

    this.rotationAngle = this.body.angle;
  }

  // shows the bullet as bulletImg
  show() {
    this.update();

    if(!gifPlayable){
      push();
  
      translate(this.x, this.y);
      rotate(this.rotationAngle);
      tint(255);
      noStroke();
  
      image(bulletImg, 0, 0, this.r*2, this.r*2);
      noTint();
      pop();
    }
    
  }

  // stops the bullet if its velocity is low, otherwise updates the x, y, and rotationAngle to match the physics body
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
    }
  }

  // applies force to the bullet based on the power and angle passed in from constructor
  launch() {
    collisionHasHappened = false;
    console.log("this is working");
    let velocity = Vector.create(this.power*cos(this.inclinationAngle), - this.power*sin(this.inclinationAngle));
    Body.setVelocity(this.body, velocity);
    shotFiredSound.play();
  }
}



class Arrow {
  
  // creates an arrow based on the tankX, tankY, and colour of the tank it emerges from
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

  // shows the arrow emerging from the tank at the angle set by the player
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

  // finds the angle of the arrow
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

  // updates the length of the arrow based on an inputted power variable
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

  // returns the current angle of the arrow to allow the bullet to be launched correctly
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

  // creates a bar based on x, y, and colour
  constructor(x, y, colour) {
    this.x = x;
    this.y = y;
    this.barX = x;
    this.w = width / 6;
    this.h = height / 16;

    this.colour = colour;
  }

  // calls the power bar to follow the mouse cursor if the cursor is bellow the ground level of the current player
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

  // moves the bar to be below the opposite tank based on inputed x, y, and colour
  updateLocation(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.barX = x;
  }

  // returns the power based on the position of barX
  returnPower() {
    return (this.barX - this.x + this.w / 2) * 150 / this.w + 25;
  }

  // shows the powerScale, including the bar which indicates the current power level
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

  // creates a tank based on x, y, w, h, and colour, setting an image to the tank based on the inputted colour
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

  // shows the tank
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

  // sets colour, x, and y based on which playerColour is inputted
  constructor(playerColour){
    this.colour = playerColour;
    this.x = playerColour === "red" ? 50: width-50;
    this.y = height - 50;
    this.image = playerColour === "red" ? redHeartImg: blueHeartImg;
    this.width = 50;
  }

  // sets the livesRemaining based on which tank this scoreDisplayer represents
  update(){
    if (this.colour === "red"){
      this.livesRemaining = playerOneTank.livesRemaining;
    }
    else{
      this.livesRemaining = playerTwoTank.livesRemaining;
    }
  }

  // shows an amount of hearts equal to the livesRemaining of the player
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