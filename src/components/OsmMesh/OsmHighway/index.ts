import * as BABYLON from '@babylonjs/core';
import Boundary from '@/components/Boundary';
import type { WayData } from '@/components/OsmService/typing';
import line2D from './line2D';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WayData) {
    super('osmBuilding', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建道路
  create(data: WayData) {
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

  createMaterial(data: WayData) {
    const material = new BABYLON.StandardMaterial('highwayMaterial', this.scene);
    material.diffuseColor = BABYLON.Color3.Gray();
    // material.diffuseTexture = new BABYLON.Texture('textures/surfaces/sand_road_diffuse.png', this.scene);
    this.boundary?.setBoundary(material);

    return material;
  }
}
