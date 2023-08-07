import * as BABYLON from 'babylonjs';

import Robot from './Robot';

export default class Player {
  scene: BABYLON.Scene;
  speed: number;
  position = new BABYLON.Vector3(500, 100, 500);
  // observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>>
  // body: BABYLON.Mesh;
  camera: BABYLON.UniversalCamera;
  onUpdate: (player: Player) => void;

  constructor(scene: BABYLON.Scene, options: any = {}) {
    this.scene = scene;
    this.speed = options.speed || 10;
    this.camera = this.createCamera();
    this.onUpdate = options.onUpdate;

    const robot = new Robot(this.scene, this.position.clone(), {
      rootNode: options.rootNode,
      onUpdate: () => {
        this.position = robot.position.clone();
        options.onUpdate?.(this);
      },
    });

    this.camera.parent = options.rootNode;
    // this.body.parent = options.rootNode;

    // this.observer = this.scene.onBeforeRenderObservable.add(() => {
    //   const { x, y, z } = this.camera.position;
    //   this.position = this.camera.position.clone();
    //   this.onUpdate?.(this);
    // })
  }

  createCamera() {
    const camera = new BABYLON.UniversalCamera(
      'playerCamera',
      this.position,
      this.scene,
    );
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.5, 1.7, 0.5);
    camera.checkCollisions = true;
    return camera;
  }

  dispose() {
    // this.scene.onBeforeRenderObservable.remove(this.observer);
  }
}