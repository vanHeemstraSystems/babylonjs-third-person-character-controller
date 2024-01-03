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
  'arcRotateCamera',
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

camera.wheelPrecision = 10;

// Model
const loadModel = async () => {
  const model = await SceneLoader.ImportMeshAsync('null', 'https://assets.babylonjs.com/meshes/', 'HVGirl.glb', scene);
  const player = model.meshes[0];
}

loadModel();