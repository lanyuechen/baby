import * as BABYLON from '@babylonjs/core';
import Boundary from '@/components/Boundary';
import type { HighwayData } from '@/components/OsmService/typing';
import line2D from './line2D';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: HighwayData) {
    super('osmBuilding', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建道路
  create(data: HighwayData) {
    if (data.nodes.length < 2) {
      return;
    }

    const material = this.createMaterial(data);

    const highway = line2D(
      `highway-${data.id}`,
      {
        width: 10,
        path: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
      },
      this.scene,
    );
    highway.parent = this;
    highway.material = material;
  }

  createMaterial(data: HighwayData) {
    const material = new BABYLON.StandardMaterial('highwayMaterial', this.scene);
    material.diffuseColor = BABYLON.Color3.Gray();
    this.boundary?.setBoundary(material);

    return material;
  }
}
