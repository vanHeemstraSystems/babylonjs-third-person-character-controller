import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper";
// import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { BackgroundMaterial } from "@babylonjs/core/Materials/Background";
// import { Mesh } from "@babylonjs/core/Meshes/abstractMesh"; // WHERE is Mesh based?
import { Texture } from "@babylonjs/core/Materials/Textures";
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
import { MeshBuilder, StandardMaterial } from "@babylonjs/core";

export class ThirdPersonCharacterController implements CreateSceneClass {
  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    // Uncomment below to load the inspector (debugging) asynchronously
    void Promise.all([
      import("@babylonjs/core/Debug/debugLayer"),
      import("@babylonjs/inspector"),
    ]).then((_values) => {
      console.log(_values);
      scene.debugLayer.show({
        handleResize: true,
        overlay: true,
        globalRoot: document.getElementById("#root") || undefined,
      });
    });

    // Camera
    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
      'arcRotateCamera',
      0,
      Math.PI / 3,
      10,
      new Vector3(0, 0, 0),
      scene
    );

    // This sets the speed of the camera
    camera.speed = 0.1;

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // Restrict the camera so that it cannot move below ground level.
    camera.upperBetaLimit = Math.PI / 2.2;

    // camera.useFramingBehavior = true; // What does this do?

    // load the environment file
    scene.environmentTexture = new CubeTexture(roomEnvironment, scene);

    // if not setting the envtext of the scene, we have to load the DDS module as well
    // new EnvironmentHelper({
    //  skyboxTexture: roomEnvironment,
    //  createGround: false
    //}, scene)

    new EnvironmentHelper({
      createGround: false
    }, scene)

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener('resize', () => {
      engine.resize();
    });

    // scene.createDefaultEnvironment({
    //   createGround: false,
    //   createSkybox: false
    // });

    // Create a SkyBox as taken from the documentation at https://doc.babylonjs.com/features/featuresDeepDive/environment/skybox

    const skybox = MeshBuilder.CreateBox('skybox', { size: 100.0 }, scene);
    const skyboxMaterial = new StandardMaterial('skybox', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    // Make the skybox follow the camera's position
    skybox.infiniteDistance = true;

    // Remove all light reflections on our box (the sun doesn't reflect on the sky!)
    skyboxMaterial.disableLighting = true;

    // Apply our sky texture, found in the folder 'public' of used locally
    skyboxMaterial.reflectionTexture = new CubeTexture('textures/skybox', scene); // USE LOCAL ASSETS
//    skyboxMaterial.reflectionTexture = new CubeTexture('https://assets.babylonjs.com/textures/skybox', scene); // USE REMOTE ASSETS
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    // We want our skybox to render behind everything else, therefor we set the skybox's renderingGroupId to 0, 
    // and every other renderable object's renderingGroupId greater than zero.
    skybox.renderingGroupId = 0;

    /*
      Introduced in version 6.27.0 you can now "fake" a ground from within your skybox. 
      This can help a lot "grounding" your models without requiring extra meshes or textures. 
      It ensures a smooth transition from the "ground" to the environment.
    */
//    const size = 1000;
//    const skydome = MeshBuilder.CreateBox("sky", { size, sideOrientation: Mesh.Builder.BACKSIDE }, scene);
//    skydome.position.y = size / 2;
//    skydome.receiveShadows = true;

    // You can notice the side orientation is flipped to see the faces from within the box. This prevents the need to alter the backFaceCulling setup.

    // Next, lets create a BackgroundMaterial to support ground projection.
//    const sky = new BackgroundMaterial("skyMaterial", scene);
//    sky.enableGroundProjection = true;
//    sky.projectedGroundRadius = 20;
//    sky.projectedGroundHeight = 3;
//    skydome.material = sky;

    /*
      The projectedGroundRadius and projectedGroundHeight are respectively simulating the radius of the disc representing the ground and how high it should be within the skybox. 
      The size of the box you picked in the first step should at least be equal or bigger to the selected radius.
    */

    // Next, we apply our special sky texture to it. This texture must have been prepared to be a skybox, in a dedicated directory, named “skybox” in our example:
//    sky.reflectionTexture = new CubeTexture("textures/skybox", scene);

    // Our built-in 'ground' shape.
    // NOTE: We do not create a ground but use the Skybox instead
    // const ground = CreateGround(
    //   'ground',
    //   { width: 50, height: 50 },
    //   scene
    // );

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
    player.renderingGroupId = 1; // Most by larger than 0 (which is the Skybox)
    // just scale the player so its fits with the ground
    player.scaling.setAll(0.1);

    // Lock the camera on the player
    // camera.setTarget(player); // Do not set it to player, but leave its target as the scene origin so all skybox walls will be enclosing the canvas.

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

    let speed: number;
    let animSpeed: number;

    let keyStatus: { [key: string]: Boolean } = {
      w: false,
      s: false,
      a: false,
      d: false,
      b: false,
      Shift: false
    };

    // Keyboard events
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnKeyDownTrigger,
        function (evt) {
          let key = evt.sourceEvent.key;
          if (key !== "Shift") {
            key = key.toLowerCase();
          }
          if (key in keyStatus) {
            keyStatus[key] = true;
          }
        }
      )
    );

    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnKeyUpTrigger,
        function (evt) {
          let key = evt.sourceEvent.key;
          if (key !== "Shift") {
            key = key.toLowerCase();
          }
          if (key in keyStatus) {
            keyStatus[key] = false;
          }
        }
      )
    );

    // Start not walking
    let moving: Boolean = false;

    scene.onBeforeRenderObservable.add(() => {
      if (
        keyStatus.w ||
        keyStatus.s ||
        keyStatus.a ||
        keyStatus.d ||
        keyStatus.b
      ) {
        moving = true;
        if (keyStatus.s && !keyStatus.w) {
          // Walk backwards
          speed = -playerSpeedBackwards;
          if (walkBackAnim !== null) {
            walkBackAnim.start(
              true,
              1.0,
              walkBackAnim.from,
              walkBackAnim.to,
              false
            );
          }
        } else if (
          keyStatus.w ||
          keyStatus.a ||
          keyStatus.d
        ) {
          // Run or walk
          speed = keyStatus.Shift
            ? playerRunSpeed
            : playerWalkSpeed;
          animSpeed = keyStatus.Shift
            ? runAnimSpeed
            : walkAnimSpeed;
          if (walkAnim !== null) {
            walkAnim.speedRatio = animSpeed;
            walkAnim.start(
              true,
              animSpeed,
              walkAnim.from,
              walkAnim.to,
              false
            );
          }
        }

        if (keyStatus.a) {
          // Turn left
          player.rotate(Vector3.Up(), -playerRotationSpeed);
        }

        if (keyStatus.d) {
          // Turn right
          player.rotate(Vector3.Up(), playerRotationSpeed);
        }

        if (keyStatus.b) {
          // Dance
          if (sambaAnim !== null) {
            sambaAnim.start(
              true,
              1.0,
              sambaAnim.from,
              sambaAnim.to,
              false
            );
          }
        }

        player.moveWithCollisions(
          player.forward.scaleInPlace(speed)
        );
      } else if (moving) {
        // Stop all animations besides Idle Anim when no key is down
        if (idleAnim !== null) {
          idleAnim.start(
            true,
            1.0,
            idleAnim.from,
            idleAnim.to,
            false
          );
        }
        if (sambaAnim !== null) {
          sambaAnim.stop();
        }
        if (walkAnim !== null) {
          walkAnim.stop();
        }
        if (walkBackAnim !== null) {
          walkBackAnim.stop();
        }
        moving = false;
      }
    });

    // loadModel(); // No longer needed, remove

    return scene;
  };
}

// Throws error on keypress:
// "DefaultCollisionCoordinator needs to be imported before as it contains a side-effect required by your code."
// To Do: find out what causes the error.

export default new ThirdPersonCharacterController();