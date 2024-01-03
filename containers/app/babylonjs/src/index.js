import { Engine } from "../node_modules/@babylonjs/core/Engines/engine.js";
import { Scene } from "../node_modules/@babylonjs/core/scene.js";
import { ArcRotateCamera } from "../node_modules/@babylonjs/core/Cameras/arcRotateCamera.js";
import { Vector3 } from "../node_modules/@babylonjs/core/Maths/math.vector.js";
import { HemisphericLight } from "../node_modules/@babylonjs/core/Lights/hemisphericLight.js";
import { SceneLoader } from "../node_modules/@babylonjs/core/Loading/sceneLoader.js";
import { CreateGround } from "../node_modules/@babylonjs/core/Meshes/Builders/groundBuilder.js";
import { ExecuteCodeAction } from "../node_modules/@babylonjs/core/Actions/directActions.js";
import { ActionManager } from "../node_modules/@babylonjs/core/Actions/actionManager.js";

import '../node_modules/@babylonjs/loaders/glTF/2.0/index.js';

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