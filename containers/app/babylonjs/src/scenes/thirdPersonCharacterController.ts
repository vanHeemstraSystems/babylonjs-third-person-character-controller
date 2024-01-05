import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";

// required imports
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/loaders/glTF';
// import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/core/Animations/animatable"

// digital assets
import hvGirl from "../../assets/glb/HVGirl.glb";
import roomEnvironment from "../../assets/environment/room.env"

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

    // This sets the speed of the camera
    camera.speed = 0.1;

    // This targets the camera to scene origin
    // camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // camera.useFramingBehavior = true; // What does this do?

    // load the environment file
    scene.environmentTexture = new CubeTexture(roomEnvironment, scene);

    // if not setting the envtext of the scene, we have to load the DDS module as well
    new EnvironmentHelper({
      skyboxTexture: roomEnvironment,
      createGround: false
    }, scene)

    // Render
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Resize
    window.addEventListener('resize', () => {
      engine.resize();
    });

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

    const light = new HemisphericLight(
      "hemiLight",
      new Vector3(0, -1, 1),
      scene
    );

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    camera.wheelPrecision = 10;

    // Model
    // const loadModel = async () => {
    //   const model = await SceneLoader.ImportMeshAsync('null', 'https://assets.babylonjs.com/meshes/', 'HVGirl.glb', scene);
    //   const player = model.meshes[0];
    // }

    const importResult = await SceneLoader.ImportMeshAsync(
      "",
      "",
      hvGirl,
      scene,
      undefined,
      ".glb"
    );

    // just scale it so we can see it better
    // importResult.meshes[0].scaling.scaleInPlace(0.33);

    const player = importResult.meshes[0];
    // just scale the player so its fits with the ground
    player.scaling.setAll(0.1);

    // Lock the camera on the player
    camera.setTarget(player);

    // Player character animations
    const walkAnim = scene.getAnimationGroupByName("Walking");
    const walkBackAnim = scene.getAnimationGroupByName("WalkingBack");
    const idleAnim = scene.getAnimationGroupByName("Idle");
    const sambaAnim = scene.getAnimationGroupByName("Samba");

    // Player character variables
    const playerWalkSpeed = 0.03;
    const playerRunSpeed = 0.1;
    const playerSpeedBackwards = 0.01;
    const playerRotationSpeed = 0.01;
    const runAnimSpeed = 3;
    const walkAnimSpeed = 1;

    let speed;
    let animSpeed;

    let keyStatus = {
      w: false,
      s: false,
      a: false,
      d: false,
      b: false,
      Shift: false
    };
    
    // loadModel();

    return scene;
  };
}

export default new ThirdPersonCharacterController();

// MORE