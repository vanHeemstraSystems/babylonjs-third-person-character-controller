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
const camera = new ArchRotatecamera(
  'arcRotatecamera',
  0,
  1,
  10,
  new Vector3(0, 0, 0),
  scene
);
