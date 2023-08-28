import * as BABYLON from '@babylonjs/core';
import { WaterMaterial } from '@babylonjs/materials/water';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { WayData } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;
  waterMaterial?: WaterMaterial;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WayData) {
    super('osmWaterarea', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  create(data: WayData) {
    this.createWaterArea(data);
    this.createBank(data);
  }

  // 创建水域
  createWaterArea(data: WayData) {
    this.waterMaterial = this.createMaterial();

    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `waterArea-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.position.y = -2;
    poly.material = this.waterMaterial;
    poly.checkCollisions = true;
  }

  createMaterial() {
    const material = new WaterMaterial('waterAreaMaterial', this.scene, new BABYLON.Vector2(256, 256));
    material.bumpTexture = new BABYLON.Texture('textures/surfaces/water_normal.png', this.scene); // Set the bump texture
    material.windForce = -10;
    material.waveHeight = 0.2;
    material.windDirection = new BABYLON.Vector2(1, 1);
    material.waterColor = new BABYLON.Color3(0.3, 0.5, 0.8);
    material.colorBlendFactor = 0.3;
    material.bumpHeight = 0.1;
    material.waveLength = 0.1;

    this.boundary?.setBoundary(material);

    return material;
  }

  createBank(data: WayData) {
    const mesh = BABYLON.MeshBuilder.ExtrudeShape(
      `waterarea-bank-${data.id}`,
      {
        shape: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(0, -10, 0),
        ],
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        path: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
      }
    );
    mesh.parent = this;

    const material = new BABYLON.PBRMaterial('bank-material', this.scene);
    material.albedoColor = BABYLON.Color3.White();
    material.roughness = 1;
    material.metallic = 0;
    mesh.material = material;
  }

  addToRenderList(...nodes: any[]) {
    nodes.forEach(node => {
      this.waterMaterial?.addToRenderList(node);
    });
  }
}
