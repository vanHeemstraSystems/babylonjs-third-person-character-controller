import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";

// import '@babylonjs/loaders/glTF/2.0/index.js';

// const canvas = document.getElementById('renderCanvas');
// const engine = new Engine(canvas, true);
// const scene = new Scene(engine);

// new HemisphericLight('hemiLight', new Vector3(0, 1, 0));

export class ThirdPersonCharacterController implements CreateSceneClass {
  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    // Uncomment to load the inspector (debugging) asynchronously

    // void Promise.all([
    //     import("@babylonjs/core/Debug/debugLayer"),
    //     import("@babylonjs/inspector"),
    // ]).then((_values) => {
    //     console.log(_values);
    //     scene.debugLayer.show({
    //         handleResize: true,
    //         overlay: true,
    //         globalRoot: document.getElementById("#root") || undefined,
    //     });
    // });

    // Camera
    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
      'arcRotateCamera',
      0,
      1,
      10,
      new Vector3(0, 0, 0),
      scene
    );
    // camera.speed = 0.1;

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // // Render
    // engine.runRenderLoop(() => {
    //   scene.render();
    // });

    // // Resize
    // window.addEventListener('resize', () => {
    //   engine.resize();
    // });

    // scene.createDefaultEnvironment({
    //   createGround: false,
    //   createSkybox: false
    // });

    // Our built-in 'ground' shape.
    const ground = CreateGround(
      'ground', 
      { width: 50, height: 50 }, 
      scene
    );

    // camera.wheelPrecision = 10;

    // // Model
    // const loadModel = async () => {
    //   const model = await SceneLoader.ImportMeshAsync('null', 'https://assets.babylonjs.com/meshes/', 'HVGirl.glb', scene);
    //   const player = model.meshes[0];
    // }

    // loadModel();

    return scene;
  };
}

export default new ThirdPersonCharacterController();

// MORE