import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { WayData } from '@/components/OsmService';
import Boundary from '@/components/Boundary';

export type OsmGroundOptions = {
  width: number;
  height: number;
  holes: WayData[];
}

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, options: OsmGroundOptions) {
    super('osmTile', scene);

    this.scene = scene;
    this.boundary = boundary;

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
    
    const material = new BABYLON.PBRMaterial('groundMaterial', this.scene);

    material.metallic = 0;
    material.roughness = 1.0;
    material.albedoColor = new BABYLON.Color3(1, 1, 1);

    this.boundary?.setBoundary(material);

    ground.checkCollisions = true;
    ground.material = material;
    ground.parent = this;
    ground.receiveShadows = true;
    return ground;
  }
}
