import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import MaterialHelper from '@/components/MaterialHelper';
import type { WayData } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: WayData, color?: BABYLON.Color3) {
    super('osmWay', scene);
    this.scene = scene;

    this.create(data, color);
  }

  // 创建Way
  create(data: WayData, color?: BABYLON.Color3) {
    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `way-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = MaterialHelper.getInstance(this.scene).createBasicMaterial(color);
    poly.checkCollisions = true;
  }
}
