import * as BABYLON from 'babylonjs';
import Boundary from '@/components/Boundary';
import Sun from '@/components/Sun';
import OsmTile from './OsmTile';

type TileOptions = {
  center: any;
  tileSize: number;
  boundary: Boundary;
  sun?: Sun;
}

export default class {
  scene: BABYLON.Scene;
  rootNode: BABYLON.TransformNode;
  tileSize: number;
  x: number = 0;
  y: number = 0;
  preLoadDistance: number = 499;  // 防止边界情况一次加载多个瓦片
  currentOsmTile: OsmTile;
  osmTiles: OsmTile[] = [];
  
  constructor(scene: BABYLON.Scene, { center, tileSize, boundary, sun }: TileOptions) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.rootNode = new BABYLON.TransformNode('rootNode', scene);

    this.currentOsmTile = new OsmTile(scene, { center, tileSize, boundary, sun });
    this.currentOsmTile.createTile();
    this.currentOsmTile.rootNode.parent = this.rootNode;
    this.osmTiles.push(this.currentOsmTile);
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.rootNode.position.x = -x;
    this.rootNode.position.z = -y;

    this.updatetile();
  }

  updatetile() {
    const points = [
      [this.x - this.preLoadDistance, this.y + this.preLoadDistance],
      [this.x + this.preLoadDistance, this.y + this.preLoadDistance],
      [this.x + this.preLoadDistance, this.y - this.preLoadDistance],
      [this.x - this.preLoadDistance, this.y - this.preLoadDistance],
    ];
    points.forEach(point => {
      const offsetX = Math.ceil(point[0] / this.tileSize) - 1;
      const offsetY = Math.ceil(point[1] / this.tileSize) - 1;
      const tile = this.osmTiles.find(d => d.offsetX === offsetX && d.offsetY === offsetY);

      if (!tile) {
        const newTile = this.currentOsmTile.next(offsetX, offsetY);
        newTile.createTile();
        newTile.rootNode.parent = this.rootNode;
        this.osmTiles.push(newTile);
      }
    });
    this.clearTiles();
  }

  clearTiles() {
    const offsetX = Math.ceil(this.x / this.tileSize) - 1;
    const offsetY = Math.ceil(this.y / this.tileSize) - 1;
    this.osmTiles = this.osmTiles.filter(d => {
      if (Math.abs(d.offsetX - offsetX) < 2 && Math.abs(d.offsetY - offsetY) < 2) {
        return true;
      }
      // 移除瓦片
      d.dispose();
    });
  }
}