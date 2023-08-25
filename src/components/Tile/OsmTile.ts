import * as BABYLON from '@babylonjs/core';
import OsmBuilding from '@/components/OsmMesh/Building';
import OsmWaterArea from '@/components/OsmMesh/WaterArea';
import OsmGround from '@/components/OsmMesh/Ground';
import WaterArea from '@/components/OsmMesh/WaterArea';
import * as OsmMeshes from '@/components/OsmMesh';
import OsmService, { GeoData, BuildingData, WayData } from '@/components/OsmService';
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

    const waterAreas: OsmWaterArea[] = [];
    const buildings: OsmBuilding[] = [];

    data.forEach((d) => {
      if (d.type === 'building') {
        const building =  this.createBuilding(d as BuildingData);
        this.tile.sun?.shadowGenerator.addShadowCaster(building, true);
        buildings.push(building as OsmBuilding);
      } else if (d.type === 'water') {
        const waterArea = this.createMesh(d, 'water');
        waterArea.position.y = -5;
        waterAreas.push(waterArea as WaterArea);
      } else if (d.type === 'way') {
        
      } else if (d.type === 'highway') {
        
      } else {
        this.createMesh(d, d.type as OsmMeshes.OsmType);
      }
    });

    console.log('=====', data.filter(d => d.type === 'way'));
    Object.assign(window, {data: data.filter(d => d.type === 'way')})

    const ground = this.createGround(data.filter(d => d.type === 'water') as WayData[]);

    waterAreas.forEach((waterArea) => {
      waterArea.addToRenderList(
        ...buildings,
        ground,
        this.tile.skybox,
      );
    });

    this.position.x = this.offsetX * this.tile.tileSize;
    this.position.z = this.offsetY * this.tile.tileSize;
  }

  createMesh(data: GeoData, type: OsmMeshes.OsmType) {
    const OsmMesh = OsmMeshes[type] || OsmMeshes['area'];
    const mesh = new OsmMesh(this.scene, this.tile.boundary, data);
    mesh.parent = this;
    return mesh;
  }

  createBuilding(data: BuildingData) {
    // 创建建筑
    const building = new OsmBuilding(this.scene, this.tile.boundary, data);
    building.parent = this;
    return building;
  }

  createGround(warterDatas: WayData[]) {
    const ground = new OsmGround(this.scene, this.tile.boundary, {
      width: this.tile.tileSize,
      height: 100,
      depth: this.tile.tileSize,
      data: warterDatas,
    });
    ground.parent = this;
    ground.position.y = -1;
    return ground;
  }

  next(offsetX: number, offsetY: number) {
    const point = this.coord.toEcef(this.tile.tileSize * offsetX, this.tile.tileSize * offsetY);
    const osmTile = new OsmTile(this.scene, point, this.tile);
    osmTile.offsetX = offsetX;
    osmTile.offsetY = offsetY;
    return osmTile;
  }
}
