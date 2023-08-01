import * as BABYLON from 'babylonjs';

export default class {
  constructor(scene: BABYLON.Scene, size: number) {
    scene.clipPlane = new BABYLON.Plane(1, 0, 0, -size);    // 右
    scene.clipPlane2 = new BABYLON.Plane(-1, 0, 0, -size);  // 左
    scene.clipPlane3 = new BABYLON.Plane(0, 0, 1, -size);   // 上
    scene.clipPlane4 = new BABYLON.Plane(0, 0, -1, -size);  // 下
  }
}