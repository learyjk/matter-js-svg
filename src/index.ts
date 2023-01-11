import Matter from "matter-js";

function initMatter() {
  const THICKNESS = 60;

  const canvas = document.querySelector<HTMLCanvasElement>("#canvas-target");
  const canvasContainer =
    document.querySelector<HTMLDivElement>("#canvas-container");
  const addButton = document.querySelector("#add-button");

  if (!canvas || !canvasContainer) return;
  if (!addButton) return;

  let containerWidth = canvasContainer.getBoundingClientRect().width;
  let containerHeight = canvasContainer.getBoundingClientRect().height;

  function handleResize(canvasContainer: HTMLDivElement) {
    containerWidth = canvasContainer.getBoundingClientRect().width;
    containerHeight = canvasContainer.getBoundingClientRect().height;
    render.canvas.width = containerWidth;
    render.canvas.height = containerHeight;

    Matter.Body.setPosition(
      ground,
      Matter.Vector.create(containerWidth / 2, containerHeight + THICKNESS / 2)
    );

    Matter.Body.setPosition(
      rightWall,
      Matter.Vector.create(containerWidth + THICKNESS / 2, containerHeight / 2)
    );
  }

  // module aliases
  let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

  // create an engine
  let engine = Engine.create();

  // create a renderer
  let render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      background: "transparent",
      wireframes: false,
      width: containerWidth,
      height: containerHeight,
    },
  });

  const createObject = () => {
    let circle = Bodies.circle(containerWidth / 2, 0, 40, {
      render: {
        sprite: {
          texture:
            "https://uploads-ssl.webflow.com/63656d0283acfd86971a5912/636579a93cdbb0c0a1106e5c_pepper-80.png",
        },
      },
    });
    Composite.add(engine.world, circle);
  };

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

  addButton.addEventListener("click", createObject);

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

  Composite.add(engine.world, mouseConstraint);

  window.addEventListener("resize", () => handleResize(canvasContainer));
}

window.addEventListener("load", initMatter);
