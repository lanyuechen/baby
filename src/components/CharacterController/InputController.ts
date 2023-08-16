import * as BABYLON from '@babylonjs/core';

export default class CharacterController {
  scene: BABYLON.Scene;
  inputMap: { [key: string]: boolean } = {};

  mobileUp: boolean = false;
  mobileDown: boolean = false;
  mobileLeft: boolean = false;
  mobileRight: boolean = false;
  mobileDash: boolean = false;
  mobileJump: boolean = false;

  verticalAxis: number = 0;
  vertical: number = 0;
  horizontalAxis: number = 0;
  horizontal: number = 0;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;

    this.scene.onKeyboardObservable.add(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.add(this.updateFromKeyboard);
  }

  isForward() {
    return this.inputMap['w'] || this.mobileUp;
  }

  isBackward() {
    return this.inputMap['s'] || this.mobileDown;
  }

  isLeft() {
    return this.inputMap['a'] || this.mobileLeft;
  }

  isRight() {
    return this.inputMap['d'] || this.mobileLeft;
  }

  isDash() {
    return this.inputMap['shift'] || this.mobileDash;
  }

  isJump() {
    return this.inputMap[' '] || this.mobileJump;
  }

  handleKeyEvent = (info: BABYLON.KeyboardInfo) => {
    this.inputMap[info.event.key.toLowerCase()] = info.type === BABYLON.KeyboardEventTypes.KEYDOWN;
  };

  updateFromKeyboard = () => {
    // 前-后
    if (this.isForward()) {
      this.verticalAxis = 1;
      this.vertical = BABYLON.Scalar.Lerp(this.vertical, 1, 0.2);
    } else if (this.isBackward()) {
      this.vertical = BABYLON.Scalar.Lerp(this.vertical, -1, 0.2);
      this.verticalAxis = -1;
    } else {
      this.vertical = 0;
      this.verticalAxis = 0;
    }

    // 左-右
    if (this.isLeft()) {
      this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, -1, 0.2);
      this.horizontalAxis = -1;
    } else if (this.isRight()) {
      this.horizontal = BABYLON.Scalar.Lerp(this.horizontal, 1, 0.2);
      this.horizontalAxis = 1;
    } else {
      this.horizontal = 0;
      this.horizontalAxis = 0;
    }
  }

  dispose() {
    this.scene.onKeyboardObservable.removeCallback(this.handleKeyEvent);
    this.scene.onBeforeRenderObservable.removeCallback(this.updateFromKeyboard);
  }
}
