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
import { Texture } from "@babylonjs/core/Materials/Textures";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { CreateSceneClass } from "../createScene";
import * as GUI from "@babylonjs/gui/2D";

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
// import roomEnvironment from "../../assets/environment/room.env" // Not Used
import { GamepadManager, GenericPad, Mesh, MeshBuilder, StandardMaterial, Xbox360Button, Xbox360Pad } from "@babylonjs/core";
// import { PoseEnabledController } from "@babylonjs/core/Gamepads/gamepadManager"; // Not Found

export class ThirdPersonCharacterController implements CreateSceneClass {
  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    // Uncomment below to load the inspector (debugging) asynchronously
    /*
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
    */

    // Camera
    // This creates and positions a free camera (non-mesh)
    // so we can spin it around the mesh
    let alpha = 0, // The camera starts off by facing directly west (-X), but
                   // we can rotate it so that we're looking towards southwest (-X, -Z)
    beta = Math.PI / 3, // The camera starts off by facing directly downwards (-Y), but
                        // we can rotate it so that we're looking down at a 45 degree angle
    radius = 10, // Our distance from the target position
    targetPoint = Vector3.Zero(); // The target point - we will rotate around (0, 0, 0), always looking directly at it
    const camera = new ArcRotateCamera(
      'arcRotateCamera',
      alpha,
      beta,
      radius,
      targetPoint,
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
    // scene.environmentTexture = new CubeTexture(roomEnvironment, scene); // Skip environment for now

    // if not setting the envtext of the scene, we have to load the DDS module as well
    // new EnvironmentHelper({
    //  skyboxTexture: roomEnvironment,
    //  createGround: false
    //}, scene)

    new EnvironmentHelper({
      createSkybox: false, // Skip Skybox here, we'll create one further on
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
    const size = 1000;
    const skydome = MeshBuilder.CreateBox("sky", { size, sideOrientation: Mesh.BACKSIDE }, scene);
    skydome.position.y = size / 2;
    skydome.receiveShadows = true;

    // You can notice the side orientation is flipped to see the faces from within the box. This prevents the need to alter the backFaceCulling setup.

    // Next, lets create a BackgroundMaterial to support ground projection.
    const sky = new BackgroundMaterial("skyMaterial", scene);
    //    sky.enableGroundProjection = true; // method is missing
    //    sky.projectedGroundRadius = 20; // method is missing
    //    sky.projectedGroundHeight = 3; // method is missing
    skydome.material = sky;

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

    let speed: number;
    let animSpeed: number;

    let keyStatus: { [key: string]: Boolean } = {
      w: false, // player walk forward
      s: false, // player walk backward
      a: false, // player walk turning left
      d: false, // player walk turining right
      b: false, // player dance
      i: false, // camera tilt down, similar to mouse left button drag up
      j: false, // camera pan left, similar to mouse left button drag right
      k: false, // camera tilt up, similar to mouse left button drag down
      l: false, // camera pan right, similar to mouse left button drag left
      Shift: false // fast
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
        keyStatus.b ||
        keyStatus.i ||
        keyStatus.k
      ) {
        moving = true;
        if (keyStatus.s && !keyStatus.w) {
          // Player walk backwards
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
          // Player run or walk
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
          // Player turn left
          player.rotate(Vector3.Up(), -playerRotationSpeed);
        }

        if (keyStatus.d) {
          // Player turn right
          player.rotate(Vector3.Up(), playerRotationSpeed);
        }

        if (keyStatus.b) {
          // Player dance
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

        if (keyStatus.i) {
          // Camera tilt down
          beta = beta / (beta + 10); // Down ... Is 10 the right amount??
          camera.setPosition(new Vector3(alpha, beta, radius)); // ERROR: The alpha value is reset also, not using the current alpha value
        }

        if (keyStatus.k) {
          // Camera tilt up
          beta = beta / (beta - 10); // Up ... Is 10 the right amount??
          camera.setPosition(new Vector3(alpha, beta, radius)); // ERROR: The alpha value is reset also, not using the current alpha value
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

    // Gamepad manager logic
    // Based on https://doc.babylonjs.com/features/featuresDeepDive/input/gamepads
    // Based on https://www.basedash.com/blog/how-to-simulate-a-keypress-in-javascript
    // See also How To Make GUI For Your Babylon.js Apps - 2 Methods Tutorial at https://www.youtube.com/watch?v=PazvoTKoigA
    var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var stackPanel = new GUI.StackPanel();
    stackPanel.isVertical = true;
    stackPanel.color = "white";
    advancedTexture.addControl(stackPanel);

    let connectionText = new GUI.TextBlock("connection", "");
    connectionText.height = "30px";
    stackPanel.addControl(connectionText);
    let buttonsText = new GUI.TextBlock("buttons", "");
    buttonsText.height = "30px";
    stackPanel.addControl(buttonsText);
    let triggerText = new GUI.TextBlock("trigger", "");
    triggerText.height = "30px";
    stackPanel.addControl(triggerText);
    let stickText = new GUI.TextBlock("stick", "");
    stickText.height = "30px";
    stackPanel.addControl(stickText);

    /*
     * Controlling the player
     */

    const gamepadManager = new GamepadManager();
    gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
      connectionText.text = "Connected: " + gamepad.id;
      console.log("Connected: " + gamepad.id)

      enum STICK_ENUM {
        LEFT = "Left",
        RIGHT = "Right"
      };

      enum BUTTON_ENUM {
        A = "A",
        B = "B",
        X = "X",
        Y = "Y"
      };

      // Handle gamepad types
      if (gamepad instanceof Xbox360Pad) {
        // Xbox button down/up events
        gamepad.onButtonDownObservable.add((button, state) => {
          buttonsText.text = Xbox360Button[button] + " pressed";
          switch (Xbox360Button[button]) {
            case "A":
              console.log("Button A pressed")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.A, true);
              break;
            case "B":
              console.log("Button B pressed")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.B, true);
              break;
            case "X":
              console.log("Button X pressed")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.X, true);
              break;
            case "Y":
              console.log("Button Y pressed")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.Y, true);
              break;
            default:
              console.log("Unknown Button pressed: ", Xbox360Button[button])
          }
        })
        gamepad.onButtonUpObservable.add((button, state) => {
          buttonsText.text = Xbox360Button[button] + " released";
          switch (Xbox360Button[button]) {
            case "A":
              console.log("Button A released")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.A, false);
              break;
            case "B":
              console.log("Button B released")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.B, false);
              break;
            case "X":
              console.log("Button X released")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.X, false);
              break;
            case "Y":
              console.log("Button Y released")
              simulateKeyBoardPressesByButton(BUTTON_ENUM.Y, false);
              break;
            default:
              console.log("Unknown Button released: ", Xbox360Button[button])
          }
        })

        // Stick events
        gamepad.onleftstickchanged((values) => {
          stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
          simulateKeyBoardPressesByStick(STICK_ENUM.LEFT, values);
        });
        gamepad.onrightstickchanged((values) => {
          stickText.text = "x:" + values.x.toFixed(3) + " y:" + values.y.toFixed(3);
          simulateKeyBoardPressesByStick(STICK_ENUM.RIGHT, values);
        });

      } else if (gamepad instanceof GenericPad) {

        // More ...

      }
      /* TEMP DISABLED 
        else if (gamepad instanceof PoseEnabledController) {

      }
      */

      /*
       * Controlling the camera
       * See https://doc.babylonjs.com/features/featuresDeepDive/cameras/customizingCameraInputs
       */

      // More ...

      // Simulate Keyboard presses by Button
      function simulateKeyBoardPressesByButton(button: BUTTON_ENUM, status: Boolean) {
        // Player dance
        switch (button) {
          case BUTTON_ENUM.A:
            break;
          case BUTTON_ENUM.B:
            // Player dance
            keyStatus.b = status;
            if (status) { console.log("Start dancing ..."); } else { console.log("Stop dancing ..."); }
            break;
          case BUTTON_ENUM.X:
            break;
          case BUTTON_ENUM.Y:
            break;
          default:
            console.log("Unknown button: ", button);
        }
      };

      // Simulate Keyboard presses by Stick
      /*
       * For understanding Arc Rotate Camera movements, 
       * see https://doc.babylonjs.com/features/featuresDeepDive/cameras/camera_introduction#arc-rotate-camera
       */
      function simulateKeyBoardPressesByStick(stick: STICK_ENUM, values: any) {
        // Player walk forward / camera tilt down
        if (parseFloat(values.y.toFixed(3)) < 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Walk forward
              keyStatus.w = true;
              console.log("Start walking forward ...");
              break;
            case STICK_ENUM.RIGHT:
              // Camera tilt down
              keyStatus.i = true;
              console.log("Start camera tilting down ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        } else if (parseFloat(values.y.toFixed(3)) == 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Stop walking forward
              keyStatus.w = false;
              console.log("Stop walking forward ...");
              break;
            case STICK_ENUM.RIGHT:
              // Stop camera tilt down
              keyStatus.i = false;
              console.log("Stop camera tilting down ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        }
        // Player turn left / camera pan left
        if (parseFloat(values.x.toFixed(3)) < 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Walk turning left
              keyStatus.a = true;
              console.log("Start walking turning left ...");
              break;
            case STICK_ENUM.RIGHT:
              // Camera pan left
              keyStatus.j = true;
              // To Do
              console.log("Start camera panning left ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        } else if (parseFloat(values.x.toFixed(3)) == 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Stop walking turning left
              keyStatus.a = false;
              console.log("Stop walking turning left ...");
            case STICK_ENUM.RIGHT:
              // Stop camera panning left
              keyStatus.j = false;
              // To Do
              console.log("Stop camera panning left ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        }
        // Player turn right / camera pan right
        if (parseFloat(values.x.toFixed(3)) > 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Walk turning right
              keyStatus.d = true;
              console.log("Start walking turning right ...");
              break;
            case STICK_ENUM.RIGHT:
              // Camera pan right
              keyStatus.l = true;
              // To Do
              console.log("Start camera panning right ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        } else if (parseFloat(values.x.toFixed(3)) == 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Stop walking turning right
              keyStatus.d = false;
              console.log("Stop walking turning right ...");
              break;
            case STICK_ENUM.RIGHT:
              // Stop camera panning right
              keyStatus.l = false;
              // To Do
              console.log("Stop camera panning right ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        }
        // Player walk back / camera tilt up
        if (parseFloat(values.y.toFixed(3)) > 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Walk backward
              keyStatus.s = true;
              console.log("Start walking backward ...");
              break;
            case STICK_ENUM.RIGHT:
              // Camera tilt up
              keyStatus.k = true;
              // To Do
              console.log("Start camera tilting up ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        } else if (parseFloat(values.y.toFixed(3)) == 0.000) {
          switch (stick) {
            case STICK_ENUM.LEFT:
              // Stop walking backward
              keyStatus.s = false;
              console.log("Stop walking backward ...");
              break
            case STICK_ENUM.RIGHT:
              // Stop camera tilt up
              keyStatus.k = false;
              // To Do
              console.log("Stop camera tilting up ...");
              break;
            default:
              console.log("Unknown stick: ", stick);
          }
        }
      };
    });

    gamepadManager.onGamepadDisconnectedObservable.add((gamepad, state) => {
      connectionText.text = "Disconnected: " + gamepad.id;
      console.log("Disconnected: " + gamepad.id)
    });

    // At any time, a gamepad's current state can be checked with the gamepads properties:
    /*
    scene.registerBeforeRender(function () {
      if (gamepad instanceof Xbox360Pad) {
        if (gamepad.buttonA) {
          // sphere.position.y+=0.05
          console.log("Button A pressed")
        }
        // sphere.position.x+=gamepad.leftStick.x*0.05
      }
    }
    */

    // loadModel(); // No longer needed, remove

    return scene;
  };
}

export default new ThirdPersonCharacterController();