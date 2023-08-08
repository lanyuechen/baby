import * as BABYLON from 'babylonjs';

import Robot from './Robot';

export default class Player extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  camera: BABYLON.UniversalCamera;
  robot: Robot;
  private keyMap = new Map();

  constructor(scene: BABYLON.Scene) {
    super('player', scene);

    this.scene = scene;
    this.camera = this.createCamera();
    this.rotationQuaternion = null;

    this.robot = new Robot(this.scene);
    this.robot.parent = this;
    this.robot.scaling = new BABYLON.Vector3(20, 20, 20);

    this.camera.parent = this;

    // new BABYLON.PhysicsAggregate(this, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, this.scene);

    this.scene.onKeyboardObservable.add(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.add(this.handleMove);
  }

  createCamera() {
    const camera = new BABYLON.UniversalCamera(
      'playerCamera',
      BABYLON.Vector3.Zero(),
      this.scene,
    );
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
    this.rotationQuaternion = this.rotationQuaternion || BABYLON.Quaternion.Identity();
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
    this.rotationQuaternion = rotation;
    this.camera.rotation.y = 0;

    this.movePOV(r, u, f);
  }

  handleMoveThirdPerson(angle: number) {
    if (this.keyMap.get('w')) { // w
      this.moveThirdPerson(-angle);
    }
    if (this.keyMap.get('s')) { // s
      this.moveThirdPerson(-angle + Math.PI);
    }
    if (this.keyMap.get('d')) { // d
      this.moveThirdPerson(-angle + Math.PI / 2);
    }
    if (this.keyMap.get('a')) { // a
      this.moveThirdPerson(-angle - Math.PI / 2);
    }
  }

  // 缓动旋转到指定方向
  moveThirdPerson(angle: number) {
    const rotation = BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), angle);

    this.movePOV(0, 0, -1);
    this.robot.run();
    BABYLON.Quaternion.SlerpToRef(
      this.rotationQuaternion!,
      rotation,
      0.1,
      this.rotationQuaternion!,
    );
  }

  dispose() {
    this.scene.onKeyboardObservable.removeCallback(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.removeCallback(this.handleMove);
  }
}