import * as BABYLON from '@babylonjs/core';

import Action, { AgMap } from './Action';
import InputController from './InputController';

const PLAYER_SPEED = 5;
const JUMP_SPEED = 2;
const DASH_FACTOR = 2;
const GRAVITY = -9.81;

interface Character extends BABYLON.AbstractMesh {
  mesh: BABYLON.AbstractMesh;
}

export default class CharacterController {
  scene: BABYLON.Scene;
  character: Character;
  cameraBox!: BABYLON.TransformNode;  // 补偿camera随camRoot旋转的角度
  action: Action;
  inputController: InputController;
  deltaTime: number = 1 / 60;
  grounded: boolean = false;
  jumpCount: number = 0;
  velocity: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);

  constructor(
    scene: BABYLON.Scene,
    character: Character,
    animationGroups: BABYLON.AnimationGroup[],
    agMap: AgMap,
  ) {
    this.scene = scene;
    this.character = character;
    this.character.mesh.rotationQuaternion = this.character.mesh.rotationQuaternion || BABYLON.Quaternion.Identity();

    this.action = new Action(scene, animationGroups, agMap);

    this.cameraBox = new BABYLON.TransformNode('cameraBox', this.scene);
    this.cameraBox.parent = this.character;
   
    this.inputController = new InputController(scene);

  }

  start() {
    this.scene.registerBeforeRender(this.beforeRenderUpdate);
  }

  stop() {
    this.scene.unregisterBeforeRender(this.beforeRenderUpdate);
  }

  activeCamera() {
    this.scene.activeCamera!.parent = this.cameraBox;
  }

  //--GAME UPDATES--
  beforeRenderUpdate = () => {
    this.updateFromControls();
    this.updateGroundDetection();
    this._animatePlayer();
  }

  updateFromControls() {
    this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

    const h = this.inputController.horizontal;  // 向右, x
    const v = this.inputController.vertical;    // 向前, z

    let dashFactor = 1;
    // 加速
    if (this.inputController.isDash()) {
      dashFactor = DASH_FACTOR;
    }

    this.character.rotation.y = -BABYLON.Vector3.GetAngleBetweenVectorsOnPlane(
      this.scene.activeCamera!.getForwardRay().direction,
      BABYLON.Vector3.Forward(),
      BABYLON.Vector3.Up(),
    );

    this.cameraBox.rotation.y = -this.character.rotation.y;

    //--MOVEMENTS BASED ON CAMERA (as it rotates)--
    const forward = this.character.forward;
    const right = this.character.right;
    const correctedVertical = forward.scaleInPlace(v);
    const correctedHorizontal = right.scaleInPlace(h);

    // 移动方向
    const move = correctedHorizontal.addInPlace(correctedVertical);

    // clear y so that the character doesnt fly up, normalize for next step, taking into account whether we've DASHED or not
    const { x, z } = move.normalize();

    // 限制最大速度
    const inputAmt = BABYLON.Scalar.Clamp(Math.sqrt(h ** 2 + v ** 2), 0, 1);

    // 更新速度
    this.velocity.x = x * dashFactor * inputAmt * PLAYER_SPEED * this.deltaTime;
    this.velocity.z = z * dashFactor * inputAmt * PLAYER_SPEED * this.deltaTime;

    // 检查是否需要旋转
    let input = new BABYLON.Vector3(this.inputController.horizontalAxis, 0, this.inputController.verticalAxis);
    if (input.length() == 0) {
      //if there's no input detected, prevent rotation and keep player in same rotation
      return;
    }

    //rotation based on input & the camera angle
    let angle = Math.atan2(this.inputController.horizontalAxis, this.inputController.verticalAxis);
    // angle += this.character.rotation.y;

    const target = BABYLON.Quaternion.FromEulerAngles(0, angle, 0);
    this.character.mesh.rotationQuaternion = BABYLON.Quaternion.Slerp(
      this.character.mesh.rotationQuaternion!,
      target,
      10 * this.deltaTime,
    );
  }

  updateGroundDetection() {
    this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

    // 未掉到地上
    if (!this.isGrounded()) {
      this.grounded = false;

      // 施加重力，更新竖直方向速度
      this.velocity.addInPlace(
        BABYLON.Vector3.Up().scale(GRAVITY * this.deltaTime),
      );
    } else {
      this.grounded = true;
      this.jumpCount = 1;
      this.velocity.y = 0;
    }

    //Jump detection
    if (this.inputController.isJump() && this.jumpCount > 0) {
      this.velocity.y = JUMP_SPEED;
      this.jumpCount--;

      //jumping and falling animation flags
      // this._jumped = true;
      // this._isFalling = false;
      // this._jumpingSfx.play();
    }

    // 更新角色位置
    this.character.moveWithCollisions(this.velocity);
  }

  private _animatePlayer(): void {
    if (
      this.inputController.isForward() ||
      this.inputController.isBackward() ||
      this.inputController.isLeft() ||
      this.inputController.isRight()
    ) {
      if (this.inputController.isDash()) {
        this.action.run('run');
      } else {
        this.action.run('walk');
      }
    } else {
      this.action.run('idle');
    }
  }

  //--GROUND DETECTION--
  // 向地面发射射线，检查是否与地面接触
  private isGrounded(): boolean | undefined {
    // 射线起点
    const raycastFloorPos = new BABYLON.Vector3(0, this.character.position.y, 0); // 用户永远处于中心位置
    const ray = new BABYLON.Ray(raycastFloorPos, BABYLON.Vector3.Down(), 0.1);
    const pick = this.scene.pickWithRay(ray, (mesh) => mesh.isPickable && mesh.isEnabled());

    return pick?.hit;
  }
}
