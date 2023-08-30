import * as BABYLON from '@babylonjs/core';
import QuickTreeGenerator from './QuickTreeGenerator';

export default class MeshHelper {
  scene: BABYLON.Scene;

  tree: BABYLON.Mesh;

  static instance: MeshHelper;
  static getInstance(scene: BABYLON.Scene) {
    if (!MeshHelper.instance) {
      MeshHelper.instance = new MeshHelper(scene);
    }
    return MeshHelper.instance;
  }

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;

    this.tree = this.createTree();
  }

  // 树
  createTree() {
    const tree = QuickTreeGenerator(this.scene);
    tree.isVisible = false;
    return tree;
  }
}
