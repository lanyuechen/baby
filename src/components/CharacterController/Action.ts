import * as BABYLON from '@babylonjs/core';

export type AgMap = {
  [key: string]: string;
}

export default class CharacterController {
  scene: BABYLON.Scene;
  animationGroups: BABYLON.AnimationGroup[];
  currentAnimation: string = 'idle';
  keyMap = new Map();

  constructor(scene: BABYLON.Scene, animationGroups: BABYLON.AnimationGroup[], agMap: AgMap) {
    this.scene = scene;
    this.animationGroups = this.initAnimationGroups(animationGroups, agMap);
  }

  initAnimationGroups(animationGroups: BABYLON.AnimationGroup[], agMap: AgMap) {
    return animationGroups.map(d => {
      d.play(true);
      d.weight = d.name === 'idle' ? 1 : 0;
      d.name = agMap[d.name] || d.name;
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
