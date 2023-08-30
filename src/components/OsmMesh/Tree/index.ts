import * as BABYLON from '@babylonjs/core';
import MeshHelper from '@/components/MeshHelper';
import type { Geo } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: Geo.Node) {
    super('osmTree', scene);
    this.scene = scene;

    this.create(data);
  }

  // 创建树
  create(data: Geo.Node) {
    const mesh = MeshHelper.getInstance(this.scene).tree.createInstance(`tree-${data.id}`);
    mesh.position.x = data.x;
    mesh.position.z = data.y; 
    const rand = Math.random() * 0.2 + 0.9;
    mesh.scaling = new BABYLON.Vector3(rand, rand, rand); // 随机缩放0.9~1.1
    mesh.rotation.y = Math.random() * Math.PI * 2;  // 随机旋转
    mesh.checkCollisions = true;
    mesh.parent = this;
  }
}
