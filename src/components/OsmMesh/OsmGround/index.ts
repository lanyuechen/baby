import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { WayData } from '@/components/OsmService';
import Boundary from '@/components/Boundary';

export type OsmGroundOptions = {
  width: number;
  height: number;
  depth: number;
  data: WayData[];
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
    const { data, width, height, depth } = options;

    const box = BABYLON.MeshBuilder.CreateBox(
      'box',
      {
        width,
        height,
        depth,
      },
      this.scene,
    );
    box.position.y = -50;
    const groundCSG = BABYLON.CSG.FromMesh(box);

    data.forEach((WayData) => {
      const mesh = BABYLON.MeshBuilder.ExtrudePolygon(
        'water',
        {
          shape: WayData.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
          depth: 100,
        },
        this.scene,
        earcut,
      );
      mesh.position.x = -width / 2;
      mesh.position.z = -depth / 2;

      const csg = BABYLON.CSG.FromMesh(mesh);
      groundCSG.subtractInPlace(csg);
      mesh.dispose();
    });
    box.dispose();

    const ground = groundCSG.toMesh('ground');
    
    const material = new BABYLON.PBRMaterial('groundMaterial', this.scene);

    material.metallic = 0;
    material.roughness = 1.0;
    material.albedoColor = new BABYLON.Color3(1, 1, 1);
    // material.albedoTexture = new BABYLON.Texture('textures/surfaces/soil_diffuse.png', this.scene);

    this.boundary?.setBoundary(material);

    ground.checkCollisions = true;
    ground.material = material;
    ground.position.x = width / 2;
    ground.position.z = depth / 2;
    ground.parent = this;
    ground.receiveShadows = true;
    return ground;
  }
}
