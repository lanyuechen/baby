import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import MaterialHelper from '@/components/MaterialHelper';
import type { Geo } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: Geo.Way) {
    super('osmArea', scene);
    this.scene = scene;

    this.create(data);
  }

  // 创建Way
  create(data: Geo.Way) {
    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `way-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = MaterialHelper.getInstance(this.scene).createBasicMaterial(BABYLON.Color3.Black());
    poly.checkCollisions = true;
  }
}
