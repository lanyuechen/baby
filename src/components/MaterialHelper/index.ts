import * as BABYLON from '@babylonjs/core';
import { WaterMaterial } from '@babylonjs/materials/water';

export default class MaterialHelper {
  scene: BABYLON.Scene;

  basicMaterial: BABYLON.Material;
  waterMaterial: WaterMaterial;
  grassMaterial: BABYLON.Material;

  static instance: MaterialHelper;
  static getInstance(scene: BABYLON.Scene) {
    if (!MaterialHelper.instance) {
      MaterialHelper.instance = new MaterialHelper(scene);
    }
    return MaterialHelper.instance;
  }

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;

    this.basicMaterial = this.createBasicMaterial();
    this.waterMaterial = this.createWaterMaterial();
    this.grassMaterial = this.createGrassMaterial();
  }

  // 基础材质
  createBasicMaterial(color?: BABYLON.Color3) {
    const material = new BABYLON.PBRMaterial('', this.scene);
    material.albedoColor = color || BABYLON.Color3.White();
    material.roughness = 1;
    material.metallic = 0;

    // this.boundary?.setBoundary(material);

    return material;
  }

  // 水面材质
  createWaterMaterial() {
    const material = new WaterMaterial('', this.scene, new BABYLON.Vector2(256, 256));
    material.bumpTexture = new BABYLON.Texture('textures/surfaces/water_normal.png', this.scene); // Set the bump texture
    material.windForce = -10;
    material.waveHeight = 0.2;
    material.windDirection = new BABYLON.Vector2(1, 1);
    material.waterColor = new BABYLON.Color3(0.3, 0.5, 0.8);
    material.colorBlendFactor = 0.3;
    material.bumpHeight = 0.1;
    material.waveLength = 0.1;

    // this.boundary?.setBoundary(material);

    return material;
  }

  // 草地材质
  createGrassMaterial() {
    const material = new BABYLON.PBRMaterial('', this.scene);
    material.roughness = 1;
    material.metallic = 0;
    material.albedoTexture = new BABYLON.Texture('textures/surfaces/grass_diffuse.png', this.scene);
    material.bumpTexture = new BABYLON.Texture('textures/surfaces/grass_normal.png', this.scene);
    
    // this.boundary?.setBoundary(material);

    return material;
  }
}
