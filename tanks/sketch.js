// Tanks
// Samuel Wardell & Arbe Chumala
// June 13, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let flyingBullet;
let bulletExists = false;
let windSpeed;

let collidingBodies = [];

const {Engine, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();
Runner.run(runner, engine);

function setup(){
  createCanvas(windowWidth, windowHeight);
  windSpeed = 0;
}

function draw(){
  background(220);
  if(bulletExists){
    flyingBullet.show();
  }
}

function mousePressed(){
  flyingBullet = new Bullet(mouseX, mouseY, "arbe", PI/3, 20);
  flyingBullet.launch();
  bulletExists = true;
}

//-----------------------------------------------------------------------------------------------
//classes
//-----------------------------------------------------------------------------------------------
class Bullet{
  constructor(x, y, player, angle, power){
    this.x = x;
    this.y = y;
    this.r = 5;

    this.player = player;
    this.colour = "red";

    this.inclinationAngle = angle;
    this.power = power;

    this.body = Bodies.circle(this.x, this.y, this.r);
    Composite.add(world, this.body);
    collidingBodies.push(this.body);

    this.rotationAngle = this.body.angle;
  }

  show(){
    this.update();

    push();

    translate(this.x, this.y);
    rotate(this.rotationAngle);

    fill(this.colour);
    noStroke();

    circle(0, 0, this.r * 2);

    pop();
  }

  update(){
    this.x = this.body.position.x;
    this.y = this.body.position.y;
    this.rotationAngle = this.body.angle;
    Body.applyForce(this.body, {x: width/2, y: height/2}, {x: windSpeed, y:0});
  }

  launch(){
    let velocity = Vector.create(this.power*cos(this.inclinationAngle), -this.power*sin(this.inclinationAngle));
    Body.setVelocity(this.body, velocity);
  }
}

class CollisionZone{
  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    let options = {
      isStatic: true,
    };

    this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options);

    Composite.add(world, this.body);
    collidingBodies.push(this.body);
  }
}