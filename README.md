babylonjs-third-person-character-controller
# BabylonJS - Third Person Character Controller

Based on "Babylon Journey 5: Third Person Character Controller" at https://www.youtube.com/watch?v=07Bgr2i4sgI

Based on "BabylonJS - Animating Characters" at https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter

Sandbox "Babylon Journey 5 - Start" at https://codesandbox.io/p/sandbox/babylonjourney5-start-7s6tl5?file=%2F.prettierrc%3A1%2C1-12%2C2

Sandbox "Babylon Journey 5 - Final" at https://codesandbox.io/p/sandbox/babylonjourney5-final-zq8zn9

Take into account "Optimizing a Large-Scale Babylon.js Scene" at https://joepavitt.medium.com/optimizing-a-large-scale-babylon-js-scene-9466bb715e15 and "Optimizing Your Scene" at https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene

*TIP*: For ```Failed to resolve module specifier. Relative references must start with either```, see https://bobbyhadz.com/blog/failed-to-resolve-module-specifier-javascript

For a live animation of a character see https://cdn.babylonjs.com/ 

Open the inspector using Ctrl+Shift+U (or Command+Shift+U on Mac)

We are following this initial creation of our BabylonJS app; [Babylon.js ES6 support with Tree Shaking](https://doc.babylonjs.com/setup/frameworkPackages/es6Support) and hosted at https://github.com/RaananW/babylonjs-webpack-es6

*TIP*: Read if you encounter this error [What is this “Invalid Host Header” error?](https://medium.com/@AvinashBlaze/what-is-this-invalid-host-header-error-9cd760ae6d16)

## Usage

After installation (```npm install```) and starting (```npm start```) the babylonjs service (at containers/app/babylonjs/), a browser window will show the BabylonJS environment and imported meshes (e.g. character). The character can be controlled by keypress as follows:

Keypress:

- 'w' for walking straight forward
- 'a' for turning left whilst walking
- 'd' for turning right whilst walking
- 's' for walking backwards

*NOTE*: When holding Shift, the walking will be faster (except for the walking backwards).
