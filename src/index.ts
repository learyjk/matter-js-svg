import Matter from "matter-js";

// id selectors
const CANVAS_CONTAINER_ID = "#wb-canvas-container";
const SVG_PATH_SELECTOR = "svg > path";

let logo =
  "https://uploads-ssl.webflow.com/63bf27eb2b3aa9f5a1bf8b46/63bf33bb62d9abb9d40b1438_webbae-logo.svg";

function initMatter() {
  // wall and ground thickness value
  const THICKNESS = 60;

  // select elements on DOM
  //const canvas = document.querySelector<HTMLCanvasElement>(CANVAS_ID);
  const canvasContainer =
    document.querySelector<HTMLDivElement>(CANVAS_CONTAINER_ID);
  const paths = document.querySelectorAll(
    SVG_PATH_SELECTOR
  ) as NodeListOf<SVGPathElement>;

  // protects code below
  if (!canvasContainer) return;

  // define container width and height which will be used to set canvas width and height
  let containerWidth = canvasContainer.getBoundingClientRect().width;
  let containerHeight = canvasContainer.getBoundingClientRect().height;

  // module aliases
  let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Svg = Matter.Svg,
    Vertices = Matter.Vertices;

  // create an engine
  let engine = Engine.create();

  let canvas = document.createElement("canvas");
  canvasContainer.append(canvas);

  // create a renderer
  let render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: containerWidth,
      height: containerHeight,
      background: "transparent",
      wireframes: false,
      showAngleIndicator: true,
    },
  });

  const createSVG = () => {
    paths.forEach((path, i) => {
      //console.log(Vertices.fromPath(path, 2));
      console.log(Svg.pathToVertices(path, 0));
      let svgBody = Bodies.fromVertices(
        i * 100 + 100,
        0,
        [Svg.pathToVertices(path, 0)],
        {
          render: {
            fillStyle: "black",
            strokeStyle: "black",
            lineWidth: 1,
          },
        }
      );
      Composite.add(engine.world, svgBody);
    });
  };
  createSVG();

  // function to create an object in the world.
  const createObject = () => {
    let spawnX = containerWidth / 2;
    let spawnY = 0;
    let radius = 80;

    let circle = Bodies.circle(spawnX, spawnY, radius, {
      friction: 0.5,
      frictionAir: 0.00001,
      restitution: 0.8, //restitution = bounce
      render: {
        fillStyle: "#F35e66",
        strokeStyle: "black",
      },
    });
    Composite.add(engine.world, circle);
  };

  createObject();

  // create ground
  // difficult to update width and height once created? => set initial width to large number (* 5)
  let ground = Bodies.rectangle(
    containerWidth / 2,
    containerHeight + THICKNESS / 2,
    containerWidth * 5,
    THICKNESS,
    { isStatic: true }
  );

  // create right wall
  // difficult to update width and height once created? => set initial width to large number (* 5)
  let rightWall = Bodies.rectangle(
    containerWidth + THICKNESS / 2,
    containerHeight / 2,
    THICKNESS,
    containerHeight * 5,
    { isStatic: true }
  );

  // create left wall
  // difficult to update width and height once created? => set initial width to large number (* 5)
  let leftWall = Bodies.rectangle(
    0 - THICKNESS / 2,
    containerHeight / 2,
    THICKNESS,
    containerHeight * 5,
    {
      isStatic: true,
    }
  );

  // add all of the bodies to the world
  Composite.add(engine.world, [ground, rightWall, leftWall]);

  // run the renderer
  Render.run(render);

  // create runner
  let runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);

  // define mouse and constraint
  let mouse = Mouse.create(render.canvas);
  let mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  });

  // add the mouseConstraint to the world
  Composite.add(engine.world, mouseConstraint);

  // we need to be able to handle window resize to:
  // 1. rerender the canvas based on new container dimensions
  // 2. reset positions for ground and rightWall
  function handleResize(canvasContainer: HTMLDivElement) {
    // get new width and height values
    containerWidth = canvasContainer.getBoundingClientRect().width;
    containerHeight = canvasContainer.getBoundingClientRect().height;
    // set canvas size to new values
    render.canvas.width = containerWidth;
    render.canvas.height = containerHeight;

    // reposition ground
    Matter.Body.setPosition(
      ground,
      Matter.Vector.create(containerWidth / 2, containerHeight + THICKNESS / 2)
    );

    // reposition right wall
    Matter.Body.setPosition(
      rightWall,
      Matter.Vector.create(containerWidth + THICKNESS / 2, containerHeight / 2)
    );
  }

  // allow scroll through the canvas
  mouseConstraint.mouse.element.removeEventListener(
    "mousewheel",
    mouseConstraint.mouse.mousewheel
  );
  mouseConstraint.mouse.element.removeEventListener(
    "DOMMouseScroll",
    mouseConstraint.mouse.mousewheel
  );
  let bodies = Composite.allBodies(engine.world);
  console.log({ bodies });

  // recalculate our canvas when user resizes window
  window.addEventListener("resize", () => handleResize(canvasContainer));
}

document.addEventListener("DOMContentLoaded", initMatter);
