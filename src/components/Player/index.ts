import * as BABYLON from 'babylonjs';

import Robot from './Robot';

export default class Player {
  scene: BABYLON.Scene;
  position = new BABYLON.Vector3(500, 100, 500);
  camera: BABYLON.UniversalCamera;
  onUpdate: (player: Player) => void;
  rootNode: BABYLON.AbstractMesh;
  private keyMap = new Map();
  robot: Robot;

  constructor(scene: BABYLON.Scene, options: any = {}) {
    this.scene = scene;
    this.camera = this.createCamera();
    this.onUpdate = options.onUpdate;
    this.rootNode = new BABYLON.AbstractMesh('playerRootNode', this.scene);
    this.rootNode.parent = options.rootNode;
    this.rootNode.position = this.position.clone();
    this.rootNode.rotationQuaternion = null;

    const robot = new Robot(this.scene);
    robot.load().then(() => {
      robot.body.parent = this.rootNode;
  
      robot.body.scaling = new BABYLON.Vector3(20, 20, 20);
      robot.body.ellipsoid = new BABYLON.Vector3(20, 20, 20);
      robot.body.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);
      robot.body.checkCollisions = true; // 开启碰撞检测
    });
    this.robot = robot;

    // const robot = new Robot(this.scene, this.position.clone(), {
    //   rootNode: options.rootNode,
    //   onUpdate: (position: BABYLON.Vector3) => {
    //     this.position = position;
    //     options.onUpdate?.(this);
    //   },
    // });

    this.camera.parent = options.rootNode;
    // this.body.parent = options.rootNode;

    // this.observer = this.scene.onBeforeRenderObservable.add(() => {
    //   const { x, y, z } = this.camera.position;
    //   this.position = this.camera.position.clone();
    //   this.onUpdate?.(this);
    // })

    this.scene.onKeyboardObservable.add(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.add(this.handleMove);
  }

  handleKeyEvent = (info: BABYLON.KeyboardInfo) => {
    this.keyMap.set(info.event.key, info.type === BABYLON.KeyboardEventTypes.KEYDOWN);
    if (info.type === BABYLON.KeyboardEventTypes.KEYUP) {
      this.robot.stand();
    }
  }

  handleMove = () => {
    let rot;

    this.rootNode.rotationQuaternion = this.rootNode.rotationQuaternion || BABYLON.Quaternion.Identity();
    const angle = BABYLON.Vector3.GetAngleBetweenVectorsOnPlane(
      this.scene.activeCamera!.getForwardRay().direction,
      BABYLON.Vector3.Forward(),
      BABYLON.Vector3.Up(),
    );
    // const angle = (this.scene.activeCamera as BABYLON.ArcRotateCamera).alpha;

    if (this.keyMap.get('w')) { // w
      rot = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), -angle + Math.PI);
      this.moveRotation(rot);
    }
    if (this.keyMap.get('s')) { // s
      rot = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), -angle);
      this.moveRotation(rot);
    }
    if (this.keyMap.get('d')) { // d
      rot = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), -angle - Math.PI / 2);
      this.moveRotation(rot);
    }
    if (this.keyMap.get('a')) { // a
      rot = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), -angle + Math.PI / 2);
      this.moveRotation(rot);
    }
  }

  // 缓动旋转到指定方向
  moveRotation(rotation: BABYLON.Quaternion) {
    this.rootNode.movePOV(0, 0, 1);
    this.robot.run();
    this.position = this.rootNode.position.clone();
    this.onUpdate(this);
    BABYLON.Quaternion.SlerpToRef(
      this.rootNode.rotationQuaternion!,
      rotation,
      0.1,
      this.rootNode.rotationQuaternion!,
    );
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
    this.scene.onKeyboardObservable.removeCallback(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.removeCallback(this.handleMove);
  }
}