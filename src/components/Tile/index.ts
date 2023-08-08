import * as BABYLON from 'babylonjs';
import Boundary from '@/components/Boundary';
import Sun from '@/components/Sun';
import OsmTile from './OsmTile';

type TileOptions = {
  center: any;
  tileSize: number;
  preLoadBoxSize: number;
  boundary: Boundary;
  sun?: Sun;
}

export default class {
  scene: BABYLON.Scene;
  rootNode: BABYLON.TransformNode;
  tileSize: number;
  x: number = 0;
  y: number = 0;
  preLoadBoxSize: number = 0;
  currentOsmTile: OsmTile;
  osmTiles: OsmTile[] = [];
  
  constructor(scene: BABYLON.Scene, { center, tileSize, preLoadBoxSize, boundary, sun }: TileOptions) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.preLoadBoxSize = preLoadBoxSize || tileSize;
    this.rootNode = new BABYLON.TransformNode('rootNode', scene);

    this.currentOsmTile = new OsmTile(scene, { center, tileSize, boundary, sun });
    this.currentOsmTile.createTile();
    this.currentOsmTile.rootNode.parent = this.rootNode;
    this.osmTiles.push(this.currentOsmTile);
  }

  update(position: BABYLON.Vector3) {
    this.x = position.x;
    this.y = position.z;

    this.rootNode.position.x = -position.x;
    this.rootNode.position.z = -position.z;

    this.updatetile();
  }

  updatetile() {
    const offset = this.preLoadBoxSize / 2;
    const points = [
      [this.x - offset, this.y + offset],
      [this.x + offset, this.y + offset],
      [this.x + offset, this.y - offset],
      [this.x - offset, this.y - offset],
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
