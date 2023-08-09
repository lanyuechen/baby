import * as BABYLON from 'babylonjs';

import Action from './Action';

export default class CharacterController {
  scene: BABYLON.Scene;
  character: BABYLON.AbstractMesh;
  camera: BABYLON.UniversalCamera;
  action: Action;
  keyMap = new Map();

  constructor(scene: BABYLON.Scene, character: BABYLON.AbstractMesh, animationGroups: BABYLON.AnimationGroup[]) {
    this.scene = scene;
    this.character = character;
    this.action = new Action(scene, animationGroups);
    this.camera = this.createCamera();

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
      this.action.run('idle');
    }
  }

  handleMove = () => {
    if (this.keyMap.size === 0) {
      return;
    }
    this.character.rotationQuaternion = this.character.rotationQuaternion || BABYLON.Quaternion.Identity();
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
    this.character.rotationQuaternion = rotation;
    this.camera.rotation.y = 0;

    this.character.movePOV(r, u, f);
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

    this.character.movePOV(0, 0, -1);
    this.action.run('run');
    BABYLON.Quaternion.SlerpToRef(
      this.character.rotationQuaternion!,
      rotation,
      0.1,
      this.character.rotationQuaternion!,
    );
  }

  dispose() {
    this.scene.onKeyboardObservable.removeCallback(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.removeCallback(this.handleMove);
  }
}
