import * as BABYLON from '@babylonjs/core';

import CharacterController from '@/components/CharacterController';

export default class Player extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene) {
    super('player', scene);

    this.scene = scene;
    this.rotationQuaternion = null;

    this.checkCollisions = true;
    this.ellipsoid = new BABYLON.Vector3(0.5, 1.8, 0.5);
    this.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);
    this.scaling = new BABYLON.Vector3(20, 20, 20);

    this.loadCharacter();
  }

  async loadCharacter() {
    const { meshes, animationGroups } = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      'models/',
      'Xbot.glb',
      this.scene,
    );
    meshes[0].parent = this;
    new CharacterController(this.scene, this, animationGroups);
  }
}