import * as BABYLON from '@babylonjs/core';

import CharacterController from '@/components/CharacterController';

const PLAYER_HEIGHT = 1.8;

export default class Player extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  mesh!: BABYLON.AbstractMesh;

  constructor(scene: BABYLON.Scene) {
    super('player', scene);

    this.scene = scene;
    this.rotationQuaternion = null;

    this.checkCollisions = true;
    this.ellipsoid = new BABYLON.Vector3(0.5, PLAYER_HEIGHT, 0.5);
    this.ellipsoidOffset.y = PLAYER_HEIGHT;
    // this.scaling = new BABYLON.Vector3(20, 20, 20);

    this.loadCharacter();
  }

  async loadCharacter() {
    const { meshes, animationGroups } = await BABYLON.SceneLoader.ImportMeshAsync(
      '',
      'models/',
      'Xbot.glb',
      this.scene,
    );

    this.mesh = new BABYLON.AbstractMesh('meshContainer', this.scene);
    this.mesh.parent = this;
    // this.mesh.scaling = new BABYLON.Vector3(20, 20, 20);
    meshes[0].parent = this.mesh;
    
    const cc = new CharacterController(this.scene, this, animationGroups);
    cc.start();
    cc.activeCamera();
  }
}