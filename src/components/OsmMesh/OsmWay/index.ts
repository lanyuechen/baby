import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { WayData } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WayData) {
    super('osmWay', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建Way
  create(data: WayData) {
    const material = this.createMaterial(data);

    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `way-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = material;
    poly.checkCollisions = true;
  }

  createMaterial(data: WayData) {
    const material = new BABYLON.StandardMaterial('wayMaterial', this.scene);
    material.diffuseColor = BABYLON.Color3.Black();
    
    this.boundary?.setBoundary(material);

    return material;
  }
}
