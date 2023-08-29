import * as BABYLON from '@babylonjs/core';
import line2D from '@/utils/line2D';
import type { Geo } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: Geo.Way) {
    super('osmBuilding', scene);
    this.scene = scene;

    this.create(data);
  }

  // 创建道路
  create(data: Geo.Way) {
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

  createMaterial(data: Geo.Way) {
    const material = new BABYLON.StandardMaterial('highwayMaterial', this.scene);
    material.diffuseColor = BABYLON.Color3.Gray();
    // material.diffuseTexture = new BABYLON.Texture('textures/surfaces/sand_road_diffuse.png', this.scene);
    this.scene.boundary?.setBoundary(material);

    return material;
  }
}
