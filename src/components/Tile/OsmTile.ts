import * as BABYLON from '@babylonjs/core';
import OsmBuilding from '@/components/OsmMesh/OsmBuilding';
import OsmHighway from '@/components/OsmMesh/OsmHighway';
import OsmWater from '@/components/OsmMesh/OsmWater';
import OsmService, { BuildingData, HighwayData, WaterData } from '@/components/OsmService';
import Coord, { PointLla } from '@/components/Coord';
import type Tile from './index';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  center: PointLla;
  tile: Tile;
  coord: Coord;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(scene: BABYLON.Scene, center: PointLla, tile: Tile) {
    super('osmTile', scene);

    this.scene = scene;
    this.center = center;
    this.tile = tile;
    this.coord = new Coord(center);
  }

  async init() {
    const data = await OsmService.fetchData(this.center, this.tile.tileSize / Math.sqrt(2));

    console.log('geodata', data);

    data.forEach((d) => {
      if (d.type === 'building') {
        // this.createBuilding(d);
      } else if (d.type === 'highway') {
        // this.createHighway(d);
      } else if (d.type === 'water') {
        this.createWaterArea(d);
      }
    });

    this.createGround();
    
    this.position.x = this.offsetX * this.tile.tileSize;
    this.position.z = this.offsetY * this.tile.tileSize;
  }

  createBuilding(data: BuildingData) {
    // 创建建筑
    const building = new OsmBuilding(this.scene, this.tile.boundary, data);
    building.parent = this;
    this.tile.sun?.shadowGenerator.addShadowCaster(building, true);
  }

  createHighway(data: HighwayData) {
    // 创建道路
    const highway = new OsmHighway(this.scene, this.tile.boundary, data);
    highway.parent = this;
  }

  createWaterArea(data: WaterData) {
    // 创建水域
    const waterArea = new OsmWater(this.scene, this.tile.boundary, data);
    waterArea.parent = this;
    waterArea.addToRenderList(this.tile.skybox)
  }

  createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: this.tile.tileSize, height: this.tile.tileSize }, this.scene);
    
    const material = new BABYLON.PBRMaterial('groundMaterial', this.scene);

    material.albedoColor = new BABYLON.Color3(1, 1, 1);
    material.metallic = 0;
    material.roughness = 1.0;
    
    // const material = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    // material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    // // material.diffuseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // // material.specularColor = new BABYLON.Color3(0, 0, 0);
    this.tile.boundary?.setBoundary(material);

    ground.checkCollisions = true;
    ground.material = material;
    ground.position.x = this.tile.tileSize / 2;
    ground.position.z = this.tile.tileSize / 2;
    ground.parent = this;
    ground.receiveShadows = true;
  }

  next(offsetX: number, offsetY: number) {
    const point = this.coord.toEcef(this.tile.tileSize * offsetX, this.tile.tileSize * offsetY);
    const osmTile = new OsmTile(this.scene, point, this.tile);
    osmTile.offsetX = offsetX;
    osmTile.offsetY = offsetY;
    return osmTile;
  }
}
