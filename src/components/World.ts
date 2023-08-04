import * as BABYLON from 'babylonjs';

export default class {
  scene: BABYLON.Scene;
  size: number;

  constructor(scene: BABYLON.Scene, size: number) {
    this.scene = scene;
    this.size = size;
  }

  getBoundary() {
    const clipPlane = new BABYLON.Plane(1, 0, 0, -this.size / 2);    // 东
    const clipPlane2 = new BABYLON.Plane(-1, 0, 0, -this.size / 2);  // 西
    const clipPlane3 = new BABYLON.Plane(0, 0, 1, -this.size / 2);   // 北
    const clipPlane4 = new BABYLON.Plane(0, 0, -1, -this.size / 2);  // 南

    return [clipPlane, clipPlane2, clipPlane3, clipPlane4];
  }

  setBoundary(material: BABYLON.Material) {
    const [clipPlane, clipPlane2, clipPlane3, clipPlane4] = this.getBoundary();
    material.clipPlane = clipPlane;
    material.clipPlane2 = clipPlane2;
    material.clipPlane3 = clipPlane3;
    material.clipPlane4 = clipPlane4;

    // this.scene.clipPlane = new BABYLON.Plane(1, 0, 0, -this.size / 2);    // 东
    // this.scene.clipPlane2 = new BABYLON.Plane(-1, 0, 0, -this.size / 2);  // 西
    // this.scene.clipPlane3 = new BABYLON.Plane(0, 0, 1, -this.size / 2);   // 北
    // this.scene.clipPlane4 = new BABYLON.Plane(0, 0, -1, -this.size / 2);  // 南
  }

  removeBoundary() {
    // this.scene.clipPlane = null;    // 东
    // this.scene.clipPlane2 = null;   // 西
    // this.scene.clipPlane3 = null;   // 北
    // this.scene.clipPlane4 = null;   // 南
  }
}