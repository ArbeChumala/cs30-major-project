// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

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
  noStroke();
  fill(100, 100, 255);
}

function draw() {
  background(220);
  circle(globals.x, globals.y, 50);
}

function mousePressed(){
  globals.x = mouseX;
  globals.y = mouseY;
}

