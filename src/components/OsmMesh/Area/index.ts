import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { WayData } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WayData, color?: BABYLON.Color3) {
    super('osmWay', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data, color);
  }

  // 创建Way
  create(data: WayData, color?: BABYLON.Color3) {
    const material = this.createMaterial(color);

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

  createMaterial(color?: BABYLON.Color3) {
    const material = new BABYLON.StandardMaterial('wayMaterial', this.scene);
    material.diffuseColor = color || BABYLON.Color3.Black();
    
    this.boundary?.setBoundary(material);

    return material;
  }
}
