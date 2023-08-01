import * as BABYLON from 'babylonjs';

export default class {
  constructor(scene: BABYLON.Scene) {
    scene.clipPlane = new BABYLON.Plane(1, 0, 0, -0.5);    // 右
    scene.clipPlane2 = new BABYLON.Plane(-1, 0, 0, -0.5);  // 左
    scene.clipPlane3 = new BABYLON.Plane(0, 0, 1, -0.5);   // 上
    scene.clipPlane4 = new BABYLON.Plane(0, 0, -1, -0.5);  // 下
  }
}