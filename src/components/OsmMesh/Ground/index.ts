import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { Geo } from '@/components/OsmService';
import MaterialHelper from '@/components/MaterialHelper';

export type OsmGroundOptions = {
  width: number;
  height: number;
  holes: Geo.Way[];
}

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, options: OsmGroundOptions) {
    super('osmTile', scene);

    this.scene = scene;

    this.create(options);
  }

  create(options: OsmGroundOptions) {
    const { holes, width, height } = options;

    const plane = BABYLON.MeshBuilder.CreatePolygon(
      '',
      {
        shape: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(width, 0, 0),
          new BABYLON.Vector3(width, 0, height),
          new BABYLON.Vector3(0, 0, height),
        ],
        depth: 1,
      },
      this.scene,
      earcut,
    );
    const groundCSG = BABYLON.CSG.FromMesh(plane);

    holes.forEach((WayData) => {
      const mesh = BABYLON.MeshBuilder.CreatePolygon(
        '',
        {
          shape: WayData.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
          depth: 1,
        },
        this.scene,
        earcut,
      );

      const csg = BABYLON.CSG.FromMesh(mesh);
      groundCSG.subtractInPlace(csg);
      mesh.dispose();
    });

    const ground = groundCSG.toMesh('ground');
    plane.dispose();

    ground.checkCollisions = true;
    ground.material = MaterialHelper.getInstance(this.scene).basicMaterial;
    ground.parent = this;
    ground.receiveShadows = true;
    return ground;
  }
}
