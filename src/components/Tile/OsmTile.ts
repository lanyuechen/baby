import * as BABYLON from '@babylonjs/core';
import OsmGround from '@/components/OsmMesh/Ground';
import OsmTree from '@/components/OsmMesh/Tree';
import * as OsmMeshes from '@/components/OsmMesh';
import OsmService, { Geo } from '@/components/OsmService';
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
    Object.assign(window, { data });

    data.forEach((d) => {
      if (d.type === 'building') {      // 建筑
        const building = this.createMesh(d as Geo.Way)
        this.scene.sun?.shadowGenerator.addShadowCaster(building, true);
      } else if (d.type === 'water') {  // 水域
        this.createMesh(d as Geo.Way);
      } else if (d.type === 'grass') {  // 草地
        this.createMesh(d as Geo.Way);
      } else if (d.type === 'fence') {  // 篱笆
        this.createMesh(d as Geo.Way);
      } else if (d.type === 'railway') {  // 铁路
        this.createMesh(d as Geo.Way);
      } else if (d.type === 'highway') {  // 公路
        this.createMesh(d as Geo.Way);
      } else if (d.type === 'area') {     // 其他区域
        this.createMesh(d as Geo.Way);
      } else if (d.type === 'tree') {     // 树
        this.createTree(d as Geo.Node);
      } else if (d.type === 'unknown') {  // 未知
        
      }
    });

    // navigator.clipboard.writeText(JSON.stringify(data));

    const ground = this.createGround(
      data.filter(d => ['water', 'grass'].includes(d.type)) as Geo.Way[]
    );
    ground.position.y = -0.1;

    this.position.x = this.offsetX * this.tile.tileSize;
    this.position.z = this.offsetY * this.tile.tileSize;
  }

  createMesh(data: Geo.Way) {
    const OsmMesh = OsmMeshes[data.type as OsmMeshes.OsmType] || OsmMeshes['area'];
    const mesh = new OsmMesh(this.scene, data);
    mesh.parent = this;
    return mesh;
  }

  createTree(data: Geo.Node) {
    const mesh = new OsmTree(this.scene, data);
    mesh.parent = this;
    return mesh;
  }

  createGround(holes: Geo.Way[]) {
    const ground = new OsmGround(this.scene, {
      width: this.tile.tileSize,
      height: this.tile.tileSize,
      holes,
    });
    ground.parent = this;
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
