import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { GrassData } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: GrassData) {
    super('osmGrass', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建草地
  create(data: GrassData) {
    const material = this.createMaterial();

    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `grass-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = material;
    poly.checkCollisions = true;
  }

  createMaterial() {
    const material = new BABYLON.PBRMaterial('grassMaterial', this.scene);
    material.roughness = 1;
    material.metallic = 0;
    material.albedoTexture = new BABYLON.Texture('textures/surfaces/grass_diffuse.png', this.scene);
    material.bumpTexture = new BABYLON.Texture('textures/surfaces/grass_normal.png', this.scene);
    
    this.boundary?.setBoundary(material);

    return material;
  }
}
