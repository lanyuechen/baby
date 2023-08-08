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

    this.camera.parent = this.rootNode;

    this.scene.onKeyboardObservable.add(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.add(this.handleMove);
  }

  createCamera() {
    const camera = new BABYLON.UniversalCamera(
      'playerCamera',
      BABYLON.Vector3.Zero(),
      this.scene,
    );
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.5, 1.7, 0.5);
    camera.checkCollisions = true;
    return camera;
  }

  handleKeyEvent = (info: BABYLON.KeyboardInfo) => {
    this.keyMap.set(info.event.key, info.type === BABYLON.KeyboardEventTypes.KEYDOWN);
    if (info.type === BABYLON.KeyboardEventTypes.KEYUP) {
      this.robot.stand();
    }
  }

  handleMove = () => {
    if (this.keyMap.size === 0) {
      return;
    }
    this.rootNode.rotationQuaternion = this.rootNode.rotationQuaternion || BABYLON.Quaternion.Identity();
    const angle = BABYLON.Vector3.GetAngleBetweenVectorsOnPlane(
      this.scene.activeCamera!.getForwardRay().direction,
      BABYLON.Vector3.Forward(),
      BABYLON.Vector3.Up(),
    );

    if (this.scene.activeCamera instanceof BABYLON.ArcRotateCamera) {
      this.handleMoveThirdPerson(angle);
    } else {
      this.handleMoveFirstPerson(angle);
    }
  }

  handleMoveFirstPerson(angle: number) {
    if (this.keyMap.get('w')) { // w
      this.moveFirstPerson(-angle, [0, 0, -1]);
    }
    if (this.keyMap.get('s')) { // s
      this.moveFirstPerson(-angle, [0, 0, 1]);
    }
    if (this.keyMap.get('d')) { // d
      this.moveFirstPerson(-angle, [-1, 0, 0]);
    }
    if (this.keyMap.get('a')) { // a
      this.moveFirstPerson(-angle, [1, 0, 0]);
    }
  }

  moveFirstPerson(angle: number, [r, u, f]: [number, number, number]) {
    const rotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), angle);
    this.rootNode.rotationQuaternion = rotation;
    this.camera.rotation.y = 0;

    this.rootNode.movePOV(r, u, f);

    this.position = this.rootNode.position.clone();
    this.onUpdate(this);
  }

  handleMoveThirdPerson(angle: number) {
    if (this.keyMap.get('w')) { // w
      this.moveThirdPerson(-angle + Math.PI);
    }
    if (this.keyMap.get('s')) { // s
      this.moveThirdPerson(-angle);
    }
    if (this.keyMap.get('d')) { // d
      this.moveThirdPerson(-angle - Math.PI / 2);
    }
    if (this.keyMap.get('a')) { // a
      this.moveThirdPerson(-angle + Math.PI / 2);
    }
  }

  // 缓动旋转到指定方向
  moveThirdPerson(angle: number) {
    const rotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), angle);

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

  dispose() {
    this.scene.onKeyboardObservable.removeCallback(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.removeCallback(this.handleMove);
  }
}