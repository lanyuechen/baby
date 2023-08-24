import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import OsmBuilding from '@/components/OsmMesh/OsmBuilding';
import OsmHighway from '@/components/OsmMesh/OsmHighway';
import OsmWaterArea from '@/components/OsmMesh/OsmWaterArea';
import OsmGrass from '@/components/OsmMesh/OsmGrass';
import OsmGround from '@/components/OsmMesh/OsmGround';
import OsmWay from '@/components/OsmMesh/OsmWay';
import OsmService, { BuildingData, HighwayData, WaterData, GrassData, WayData } from '@/components/OsmService';
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
        buildings.push(this.createBuilding(d));
      } else if (d.type === 'highway') {
        // this.createHighway(d);
      } else if (d.type === 'water') {
        waterAreas.push(this.createWaterArea(d));
      } else if (d.type === 'grass') {
        this.createGrass(d);
      } else if (d.type === 'way') {
        // this.createWay(d);
      }
    });

    console.log('=====', data.filter(d => d.type === 'way'));
    // window.data = data.filter(d => d.type === 'way');

    const ground = this.createGround(data.filter(d => d.type === 'water') as WaterData[]);

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

  createBuilding(data: BuildingData) {
    // 创建建筑
    const building = new OsmBuilding(this.scene, this.tile.boundary, data);
    building.parent = this;
    this.tile.sun?.shadowGenerator.addShadowCaster(building, true);
    return building;
  }

  createHighway(data: HighwayData) {
    // 创建道路
    const highway = new OsmHighway(this.scene, this.tile.boundary, data);
    highway.parent = this;
    return highway;
  }

  createWaterArea(data: WaterData) {
    // 创建水域
    const waterArea = new OsmWaterArea(this.scene, this.tile.boundary, data);
    waterArea.parent = this;
    waterArea.position.y = -5;
    return waterArea;
  }

  createGrass(data: GrassData) {
    // 创建草地
    const grass = new OsmGrass(this.scene, this.tile.boundary, data);
    grass.parent = this;
    return grass;
  }

  createWay(data: WayData) {
    // 创建其他区域
    const waterArea = new OsmWay(this.scene, this.tile.boundary, data);
    waterArea.parent = this;
    return waterArea;
  }

  createGround(warterDatas: WaterData[]) {
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
