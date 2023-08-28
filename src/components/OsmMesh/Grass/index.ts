import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import MaterialHelper from '@/components/MaterialHelper';
import type { WayData } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WayData) {
    super('osmGrass', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建草地
  create(data: WayData) {
    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `grass-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = MaterialHelper.getInstance(this.scene).grassMaterial;
    poly.checkCollisions = true;
  }
}
