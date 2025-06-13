// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// module aliases

const {Engine, Render, Runner, Bodies, Composite} = Matter;
const FAR_TRAPEZOID_X = 460;
const MIDDLE_TRAPEZOID_X = 410;
const CLOSE_TRAPEZOID_X = 30;
const FAR_TRAPEZOID_Y = 260;
const CLOSE_TRAPEZOID_Y = 205;


// create an engine
let engine = Engine.create();
let world = engine.world;
engine.gravity.y = 0;

// create and run runner
let runner = Runner.create();

let render = Render.create({
  element: document.body,
  engine: engine,
});

let width = 1425;
let height = 825;

Render.setSize(render, width, height);
Render.run(render);
Runner.run(runner, engine);

class TrapezoidWall{
  constructor(xSign, ySign){
    this.x = trapezoidMeasurements.centre.x;
    this.y = trapezoidMeasurements.centre.y;

    let newVertexArray = [];

    for (let vertexPair of trapezoidMeasurements.vertices){
      let adjustedX = width/2 + xSign*vertexPair.x;
      let adjustedY = height/2 + ySign*vertexPair.y;

      let theObject = {
        x: adjustedX,
        y: adjustedY,
      };
      newVertexArray.push(theObject);
    }

    this.vertices = newVertexArray;
    
    this.options ={
      isStatic: true,
    };

    this.body = Bodies.fromVertices(this.x, this.y, this.vertices, this.options);
    Composite.add(world, this.body);
  }

  show(){
    push();
    noStroke();
    fill(255, 255, 255, 50);
    quad(
      this.vertices[0].x, this.vertices[0].y, 
      this.vertices[1].x, this.vertices[1].y,
      this.vertices[2].x, this.vertices[2].y,
      this.vertices[3].x, this.vertices[3].y,
    );
    pop();
  }
}

let walls = [];

let trapezoidMeasurements = {
  vertices: [
    {x: FAR_TRAPEZOID_X, y:FAR_TRAPEZOID_Y},
    {x: CLOSE_TRAPEZOID_X, y: FAR_TRAPEZOID_Y},
    {x: CLOSE_TRAPEZOID_X, y: CLOSE_TRAPEZOID_Y},
    {x: MIDDLE_TRAPEZOID_X, y: CLOSE_TRAPEZOID_Y},
  ],
  centre: {
    x: (FAR_TRAPEZOID_X + CLOSE_TRAPEZOID_X)/2,
    y: (FAR_TRAPEZOID_Y + CLOSE_TRAPEZOID_Y)/2,
  }
};

let directions = [-1, 1];
for(let upDown of directions){
  for(let leftRight of directions){
    let someShortTrapezoid = new TrapezoidWall(leftRight, upDown);
    walls.push(someShortTrapezoid);
  }
}