import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

type SceneLoaderSuccessParams = {
  newMeshes: BABYLON.AbstractMesh[];
  particleSystems: BABYLON.IParticleSystem[];
  skeletons: BABYLON.Skeleton[];
  animationGroups: BABYLON.AnimationGroup[];
}

export default class Robot {
  scene: BABYLON.Scene;
  currentParam?: any;
  idleParam?: any;
  runParam?: any;
  walkParam?: any;
  body!: BABYLON.AbstractMesh;
  keyMap = new Map();
  position = new BABYLON.Vector3(0, 0, 0);
  onUpdate: (position: BABYLON.Vector3) => void;

  constructor(scene: BABYLON.Scene, position: BABYLON.Vector3, options: any = {}) {
    this.scene = scene;
    this.position = position;
    this.onUpdate = options.onUpdate;

    this.createRobot(options.rootNode).then(() => {
      this.scene.onBeforeRenderObservable.add(this.handleMove);
    });

    this.scene.onKeyboardObservable.add((info) => {
      this.keyMap.set(info.event.key, info.type === BABYLON.KeyboardEventTypes.KEYDOWN);
      if (info.type === BABYLON.KeyboardEventTypes.KEYUP) {
        this.toIdle();
      }
    });
  }

  async createRobot(rootNode: BABYLON.TransformNode) {
    const { newMeshes, animationGroups } = await this.fetchModel();

    newMeshes[0].parent = rootNode;
    newMeshes[0].rotationQuaternion = null;
    newMeshes[0].rotation.y = Math.PI;
    newMeshes[0].position = this.position;
    newMeshes[0].scaling = new BABYLON.Vector3(50, 50, 50);
    this.body = newMeshes[0];

    const { idleParam, walkParam, runParam } = this.createAnimationParams(animationGroups);

    this.walkParam = walkParam;
    this.runParam = runParam;
    this.idleParam = idleParam;
    this.currentParam = idleParam;
  }

  fetchModel() {
    return new Promise<SceneLoaderSuccessParams>((resolve) => {
      BABYLON.SceneLoader.ImportMesh(
        '',
        'models/',
        'Xbot.glb',
        this.scene,
        (newMeshes, particleSystems, skeletons, animationGroups) => {
          resolve({ newMeshes, particleSystems, skeletons, animationGroups });
          // this.engine.hideLoadingUI();
        },
      );
    });
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

  toIdle() {
    if (this.currentParam === this.idleParam) {
      return;
    }
    if (this.currentParam) {
      this.idleParam.anim?.syncAllAnimationsWith(null);
      this.currentParam.anim?.syncAllAnimationsWith(this.idleParam.anim!.animatables[0]);
    }
    this.scene.onBeforeAnimationsObservable.removeCallback(this.handleBeforeAnimation);
    this.currentParam = this.idleParam;
    this.scene.onBeforeAnimationsObservable.add(this.handleBeforeAnimation);
  }

  toRun() {
    this.body.movePOV(0, 0, -1);
    this.onUpdate?.(this.body.position);
    if (this.currentParam === this.runParam) {
      return;
    }

    if (this.currentParam) {
      this.runParam.anim?.syncAllAnimationsWith(null);
      this.currentParam.anim?.syncAllAnimationsWith(this.runParam.anim!.animatables[0]);
    }
    this.scene.onBeforeAnimationsObservable.removeCallback(this.handleBeforeAnimation);
    this.currentParam = this.runParam;
    this.scene.onBeforeAnimationsObservable.add(this.handleBeforeAnimation);
  }

  handleMove = () => {
    if (!this.body) {
      return;
    }
    let rot;

    this.body.rotationQuaternion = this.body.rotationQuaternion || BABYLON.Quaternion.Identity();
    const angle = BABYLON.Vector3.GetAngleBetweenVectorsOnPlane(
      this.scene.activeCamera!.getForwardRay().direction,
      BABYLON.Vector3.Backward(),
      BABYLON.Vector3.Up(),
    );

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

  moveRotation(rotation: BABYLON.Quaternion) {
    this.toRun();
    BABYLON.Quaternion.SlerpToRef(
      this.body.rotationQuaternion!,
      rotation,
      0.1,
      this.body.rotationQuaternion!,
    );
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