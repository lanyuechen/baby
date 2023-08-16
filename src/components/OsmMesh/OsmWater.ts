import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { WaterData } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WaterData) {
    super('osmBuilding', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建水域
  create(data: WaterData) {
    const material = this.createMaterial(data);

    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `waterArea-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = material;
    poly.position.y = 0.1;
  }

  createMaterial(data: WaterData) {
    const material = new BABYLON.StandardMaterial('waterAreaMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0, 1, 1);
    this.boundary?.setBoundary(material);

    return material;
  }
}
