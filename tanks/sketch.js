// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//module aliases
const {Engine, Render, Runner, Vector, Body, Bodies, Composite} = Matter;

// create an engine
let engine = Engine.create();
let world = engine.world;

//engine runner
let runner = Runner.create();
Runner.run(runner, engine);

