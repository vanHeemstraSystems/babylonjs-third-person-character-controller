import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";

// Change this import to check other scenes
import { DefaultSceneWithTexture } from "./scenes/defaultWithTexture"; // Locally
import { ThirdPersonCharacterController } from "./scenes/thirdPersonCharacterController"; // Locally
// import { ThirdPersonCharacterController } from "https://github.com/vanHeemstraSystems/babylonjs-scene-third-person-character-controller/raw/main/scene.ts"; // Remotelly, currently not working due to error: "The target environment doesn't support dynamic import() syntax so it's not possible to use external type 'module' within a script"

export interface CreateSceneClass {
    createScene: (engine: Engine, canvas: HTMLCanvasElement) => Promise<Scene>;
    preTasks?: Promise<unknown>[];
}

export interface CreateSceneModule {
    default: CreateSceneClass;
}

export const getSceneModule = (): CreateSceneClass => {
    // return new DefaultSceneWithTexture();
    return new ThirdPersonCharacterController();
}
