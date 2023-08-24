import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import OsmBuilding from '@/components/OsmMesh/OsmBuilding';
import OsmHighway from '@/components/OsmMesh/OsmHighway';
import OsmWaterArea from '@/components/OsmMesh/OsmWaterArea';
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

    const waterAreas: OsmWaterArea[] = [];
    const buildings: OsmBuilding[] = [];

    data.forEach((d) => {
      if (d.type === 'building') {
        buildings.push(this.createBuilding(d));
      } else if (d.type === 'highway') {
        // this.createHighway(d);
      } else if (d.type === 'water') {
        waterAreas.push(this.createWaterArea(d));
      }
    });

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
    highway.position.y = 1;
    return highway;
  }

  createWaterArea(data: WaterData) {
    // 创建水域
    const waterArea = new OsmWaterArea(this.scene, this.tile.boundary, data);
    waterArea.parent = this;
    waterArea.position.y = -5;
    return waterArea;
  }

  createGround(warterDatas: WaterData[]) {
    const box = BABYLON.MeshBuilder.CreateBox(
      'box',
      {
        width: this.tile.tileSize,
        height: 100,
        depth: this.tile.tileSize,
      },
      this.scene,
    );
    box.position.y = -50;
    const groundCSG = BABYLON.CSG.FromMesh(box);

    warterDatas.forEach((waterData) => {
      const mesh = BABYLON.MeshBuilder.ExtrudePolygon(
        'water',
        {
          shape: waterData.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
          depth: 100,
        },
        this.scene,
        earcut,
      );
      mesh.position.x = -this.tile.tileSize / 2;
      mesh.position.z = -this.tile.tileSize / 2;

      const csg = BABYLON.CSG.FromMesh(mesh);
      groundCSG.subtractInPlace(csg);
      mesh.dispose();
    });
    box.dispose();

    const ground = groundCSG.toMesh('ground');
    
    const material = new BABYLON.PBRMaterial('groundMaterial', this.scene);

    material.metallic = 0;
    material.roughness = 1.0;
    material.albedoColor = new BABYLON.Color3(1, 1, 1);
    // material.albedoTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);

    this.tile.boundary?.setBoundary(material);

    ground.checkCollisions = true;
    ground.material = material;
    ground.position.x = this.tile.tileSize / 2;
    ground.position.z = this.tile.tileSize / 2;
    ground.parent = this;
    ground.receiveShadows = true;
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
