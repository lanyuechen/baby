import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

type SceneLoaderSuccessParams = {
  newMeshes: BABYLON.AbstractMesh[];
  particleSystems: BABYLON.IParticleSystem[];
  skeletons: BABYLON.Skeleton[];
  animationGroups: BABYLON.AnimationGroup[];
}

export default class Robot extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  private currentParam?: any;
  private idleParam?: any;
  private runParam?: any;
  private walkParam?: any;

  constructor(scene: BABYLON.Scene) {
    super('robot', scene);
    this.scene = scene;

    this.load();
  }

  async load() {
    const { meshes, animationGroups } = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      'models/',
      'Xbot.glb',
      this.scene,
    );
    meshes[0].parent = this;

    const { idleParam, walkParam, runParam } = this.createAnimationParams(animationGroups);

    this.walkParam = walkParam;
    this.runParam = runParam;
    this.idleParam = idleParam;
    this.currentParam = idleParam;
  }

  createAnimationParams(animationGroups: BABYLON.AnimationGroup[]) {
    const idleAnim = animationGroups.find((a) => a.name === 'idle');
    const idleParam = { name: 'Idle', anim: idleAnim, weight: 1 };
    idleAnim?.play(true);
    idleAnim?.setWeightForAllAnimatables(1);

    const walkAnim = animationGroups.find((a) => a.name === 'walk');
    const walkParam = { name: 'Walk', anim: walkAnim, weight: 0 };
    walkAnim?.play(true);
    walkAnim?.setWeightForAllAnimatables(0);

    const runAnim = animationGroups.find((a) => a.name === 'run');
    const runParam = { name: 'Run', anim: runAnim, weight: 0 };
    runAnim?.play(true);
    runAnim?.setWeightForAllAnimatables(0);

    return { idleParam, walkParam, runParam };
  }

  runAnimation(aniParam: any) {
    if (this.currentParam !== aniParam) {
      this.scene.onBeforeAnimationsObservable.removeCallback(this.handleBeforeAnimation);
      this.currentParam = aniParam;
      this.scene.onBeforeAnimationsObservable.add(this.handleBeforeAnimation);
    }
  }

  stand() {
    this.runAnimation(this.idleParam);
  }

  run() {
    this.runAnimation(this.runParam);
  }

  walk() {
    this.runAnimation(this.walkParam);
  }

  handleBeforeAnimation = () => {
    if (this.currentParam) {
      this.currentParam.weight = BABYLON.Scalar.Clamp(this.currentParam.weight + 0.1, 0, 1);
      this.currentParam.anim?.setWeightForAllAnimatables(this.currentParam.weight);
    }

    if (this.currentParam !== this.idleParam) {
      this.idleParam.weight = BABYLON.Scalar.Clamp(this.idleParam.weight - 0.1, 0, 1);
      this.idleParam.anim?.setWeightForAllAnimatables(this.idleParam.weight);
    }

    if (this.currentParam !== this.walkParam) {
      this.walkParam.weight = BABYLON.Scalar.Clamp(this.walkParam.weight - 0.1, 0, 1);
      this.walkParam.anim?.setWeightForAllAnimatables(this.walkParam.weight);
    }

    if (this.currentParam !== this.runParam) {
      this.runParam.weight = BABYLON.Scalar.Clamp(this.runParam.weight - 0.1, 0, 1);
      this.runParam.anim?.setWeightForAllAnimatables(this.runParam.weight);
    }

    if (
      (this.currentParam && this.currentParam.weight === 1) ||
      (this.idleParam.weight === 0 && this.walkParam.weight === 0 && this.runParam.weight === 0)
    ) {
      this.scene.onBeforeAnimationsObservable.removeCallback(this.handleBeforeAnimation);
    }
  }
}