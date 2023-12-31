import * as BABYLON from '@babylonjs/core';
import line2D from '@/utils/line2D';
import MaterialHelper from '@/components/MaterialHelper';
import type { Geo } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: Geo.Way) {
    super('osmRailway', scene);
    this.scene = scene;

    this.create(data);
  }

  // 创建道路
  create(data: Geo.Way) {
    if (data.nodes.length < 2) {
      return;
    }

    const highway = line2D(
      `highway-${data.id}`,
      {
        width: 10,
        path: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
      },
      this.scene,
    );
    highway.parent = this;
    highway.position.y = data.minHeight;
    highway.material = MaterialHelper.getInstance(this.scene).railwayMaterial;
  }
}
