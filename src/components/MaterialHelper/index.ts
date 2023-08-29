import * as BABYLON from '@babylonjs/core';
import { WaterMaterial } from '@babylonjs/materials/water';

export default class MaterialHelper {
  scene: BABYLON.Scene;

  basicMaterial: BABYLON.Material;
  grassMaterial: BABYLON.Material;
  railwayMaterial: BABYLON.Material;
  waterMaterial: WaterMaterial;

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
    this.railwayMaterial = this.createRailwayMaterial();
  }

  // 基础材质
  createBasicMaterial(color?: BABYLON.Color3) {
    const material = new BABYLON.PBRMaterial('', this.scene);
    material.albedoColor = color || BABYLON.Color3.White();
    material.roughness = 1;
    material.metallic = 0;

    this.scene.boundary?.setBoundary(material);

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

    material.addToRenderList(this.scene.skybox);  // 添加天空盒子渲染

    this.scene.boundary?.setBoundary(material);

    return material;
  }

  // 草地材质
  createGrassMaterial() {
    const material = new BABYLON.PBRMaterial('', this.scene);
    material.roughness = 1;
    material.metallic = 0;
    material.albedoTexture = new BABYLON.Texture('textures/surfaces/grass_diffuse.png', this.scene);
    material.bumpTexture = new BABYLON.Texture('textures/surfaces/grass_normal.png', this.scene);
    
    this.scene.boundary?.setBoundary(material);

    return material;
  }

  // 铁路材质
  createRailwayMaterial() {
    const material = new BABYLON.PBRMaterial('', this.scene);
    material.albedoColor = BABYLON.Color3.Gray();
    material.roughness = 1;
    material.metallic = 0;

    this.scene.boundary?.setBoundary(material);

    return material;
  }
}
