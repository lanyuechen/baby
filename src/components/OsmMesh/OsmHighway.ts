import * as BABYLON from '@babylonjs/core';
import Boundary from '@/components/Boundary';
import type { HighwayData } from '@/components/OsmService/typing';

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
    const material = this.createMaterial(data);

    if (data.nodes.length > 2) {
      const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
      const line = BABYLON.MeshBuilder.CreateLines(
        `highway-${data.id}`,
        {
          points: vec3,
        },
        this.scene,
      );
      line.parent = this;
      line.material = material;
      line.position.y = 0.1;
    }
  }

  createMaterial(data: HighwayData) {
    const material = new BABYLON.StandardMaterial('highwayMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.boundary?.setBoundary(material);

    return material;
  }
}
