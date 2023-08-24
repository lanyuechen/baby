import * as BABYLON from '@babylonjs/core';
import { WaterMaterial } from '@babylonjs/materials/water';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { WaterData } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WaterData) {
    super('osmBuilding', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建水域
  create(data: WaterData) {
    const material = this.createMaterial(data);

    const vec3 = data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
    const poly = BABYLON.MeshBuilder.CreatePolygon(
      `waterArea-${data.id}`,
      { shape: vec3 },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = material;
    poly.position.y = 0.1;
  }

  createMaterial(data: WaterData) {
    const material = new WaterMaterial('waterAreaMaterial', this.scene, new BABYLON.Vector2(256, 256));
    material.bumpTexture = new BABYLON.Texture('textures/surfaces/water_normal.png', this.scene); // Set the bump texture
    // material.windForce = 45; // Represents the wind force applied on the water surface
    // material.waveHeight = 1.3; // Represents the height of the waves
    // material.bumpHeight = 0.3; // According to the bump map, represents the pertubation of reflection and refraction
    // material.windDirection = new BABYLON.Vector2(1.0, 1.0); // The wind direction on the water surface (on width and height)
    // material.waterColor = new BABYLON.Color3(0, 1, 0); // Represents the water color mixed with the reflected and refracted world
    // material.colorBlendFactor = 2.0; // Factor to determine how the water color is blended with the reflected and refracted world
    // material.waveLength = 0.1; // The lenght of waves. With smaller values, more waves are generated

    this.boundary?.setBoundary(material);

    return material;
  }
}
