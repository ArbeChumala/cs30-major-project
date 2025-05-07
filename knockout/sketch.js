// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let boxLength;
let windowResizeRatio;
let penguinArray = [];
let boundaries = {};

let globals = {
  x: 0,
  y: 0,
};

function preload(){
  partyConnect("wss://demoserver.p5party.org", "sam_and_arbe");
  globals = partyLoadShared("globals");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupWindow();

  for(let i = 0; i<8; i++){
    let somePenguin;

    if(i % 2=== 0){
      somePenguin = new Penguin("black");
    }
    else{
      somePenguin = new Penguin("blue");
    }

    penguinArray.push(somePenguin);
  }
}

function setupWindow(){
  boxLength = 600;
  boundaries.left = (width-boxLength)/2;
  boundaries.right = (width+boxLength)/2;
  boundaries.top = (height-boxLength)/2;
  boundaries.bottom = (height+boxLength)/2;
}

function draw() {
  noStroke();
  background(200);
  fill(255);
  rect(boundaries.left, boundaries.top, boxLength, boxLength);
  for(let penguin of penguinArray){
    penguin.display();
  }

}

// function mousePressed(){
//   globals.x = mouseX;
//   globals.y = mouseY;
// }

class Penguin{
  constructor(colour){
    this.x = random(boundaries.left, boundaries.right);
    //add a check to make sure of no overlap
    this.y = random(boundaries.top, boundaries.bottom);
    this.colour = colour;
    this.radius = 20;
  }

  display(){
    noStroke();
    fill(this.colour);
    circle(this.x, this.y, this.radius*2);
  }
}

