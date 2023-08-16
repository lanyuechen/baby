import * as BABYLON from '@babylonjs/core';
import Boundary from '@/components/Boundary';
import Sun from '@/components/Sun';
import OsmBuilding from '@/components/OsmMesh/OsmBuilding';
import OsmHighway from '@/components/OsmMesh/OsmHighway';
import OsmWater from '@/components/OsmMesh/OsmWater';
import OsmService, { GeoData, BuildingData, HighwayData, WaterData } from '@/components/OsmService';
import Coord, { PointLla } from '@/components/Coord';

type OsmTileOptions = {
  center: PointLla;
  tileSize: number;
  boundary?: Boundary;
  sun?: Sun;
}

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  center: PointLla;
  radius: number;
  tileSize: number;
  boundary?: Boundary;
  sun?: Sun;
  coord: Coord;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(scene: BABYLON.Scene, { center, tileSize, boundary, sun }: OsmTileOptions) {
    super('osmTile', scene);

    this.scene = scene;
    this.center = center;
    this.boundary = boundary;
    this.sun = sun;
    this.tileSize = tileSize;
    this.radius = tileSize / Math.sqrt(2);
    this.coord = new Coord(center);
  }

  async init() {
    const data = await OsmService.fetchData(this.center, this.radius);

    console.log('geodata', data);

    data.forEach((d) => {
      if (d.type === 'highway') {
        this.createHighway(d);
      } else if (d.type === 'building') {
        this.createBuilding(d);
      } else if (d.type === 'water') {
        this.createWaterArea(d);
      }
    });

    this.createGround();
    
    this.position.x = this.offsetX * this.tileSize;
    this.position.z = this.offsetY * this.tileSize;
  }

  createBuilding(data: BuildingData) {
    // 创建建筑
    const building = new OsmBuilding(this.scene, this.boundary, data);
    building.parent = this;
    building.receiveShadows = true;
    this.sun?.shadowGenerator.addShadowCaster(building, true);
  }

  createHighway(data: HighwayData) {
    // 创建道路
    const highway = new OsmHighway(this.scene, this.boundary, data);
    highway.parent = this;
  }

  createWaterArea(data: WaterData) {
    // 创建水域
    const waterArea = new OsmWater(this.scene, this.boundary, data);
    waterArea.parent = this;
  }

  createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: this.tileSize, height: this.tileSize }, this.scene);
    
    const material = new BABYLON.PBRMaterial('groundMaterial', this.scene);

    material.albedoColor = new BABYLON.Color3(1, 1, 1);
    material.metallic = 0;
    material.roughness = 1.0;
    
    // const material = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    // material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    // // material.diffuseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // // material.specularColor = new BABYLON.Color3(0, 0, 0);
    this.boundary?.setBoundary(material);

    ground.checkCollisions = true;
    ground.material = material;
    ground.position.x = this.tileSize / 2;
    ground.position.z = this.tileSize / 2;
    ground.parent = this;
    ground.receiveShadows = true;
  }

  next(offsetX: number, offsetY: number) {
    const point = this.coord.toEcef(this.tileSize * offsetX, this.tileSize * offsetY);
    const osmTile = new OsmTile(this.scene, {
      center: point,
      tileSize: this.tileSize,
      boundary: this.boundary,
      sun: this.sun,
    });
    osmTile.offsetX = offsetX;
    osmTile.offsetY = offsetY;
    return osmTile;
  }
}
