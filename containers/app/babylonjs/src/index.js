import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  SceneLoader,
  CreateGround,
  ExecuteCodeAction,
  ActionManager
} from '@babylonjs/core';

import '@babylonjs/loaders';

const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

new HemisphericLight('hemiLight', new Vector3(0, 1, 0));

// Camera
const camera = new ArcRotateCamera(
  'arcRotatecamera',
  0,
  1,
  10,
  new Vector3(0, 0, 0),
  scene
);
camera.speed = 0.1;
camera.attachControl(canvas, true);

// Render
engine.runRenderLoop(() => {
  scene.render();
});

// Resize
window.addEventListener('resize', () => {
  engine.resize();
});

scene.createDefaultEnvironment({
  createGround: false,
  createSkybox: false
});
CreateGround('ground', { width: 50, height: 50 });