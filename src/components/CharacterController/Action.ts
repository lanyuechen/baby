import * as BABYLON from '@babylonjs/core';

export default class CharacterController {
  scene: BABYLON.Scene;
  animationGroups: BABYLON.AnimationGroup[];
  currentAnimation: string = 'idle';
  keyMap = new Map();

  constructor(scene: BABYLON.Scene, animationGroups: BABYLON.AnimationGroup[]) {
    this.scene = scene;
    this.animationGroups = this.initAnimationGroups(animationGroups);
  }

  initAnimationGroups(animationGroups: BABYLON.AnimationGroup[]) {
    return animationGroups.map(d => {
      d.play(true);
      d.weight = d.name === 'idle' ? 1 : 0;
      return d;
    });
  }

  run(key: string) {
    if (this.currentAnimation !== key) {
      this.scene.onBeforeAnimationsObservable.removeCallback(this.handleBeforeAnimation);
      this.currentAnimation = key;
      this.scene.onBeforeAnimationsObservable.add(this.handleBeforeAnimation);
    }
  }

  handleBeforeAnimation = () => {
    this.animationGroups.forEach(d => {
      const step = d.name === this.currentAnimation ? 0.1 : -0.1;
      d.weight = BABYLON.Scalar.Clamp(d.weight + step, 0, 1);
      if (d.weight === 1) {
        this.scene.onBeforeAnimationsObservable.removeCallback(this.handleBeforeAnimation);
      }
    });
  }
}
