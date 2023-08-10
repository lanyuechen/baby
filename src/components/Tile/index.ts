import * as BABYLON from '@babylonjs/core';
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

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  tileSize: number;
  preLoadBoxSize: number = 0;
  currentOsmTile: OsmTile;
  osmTiles: OsmTile[] = [];
  
  constructor(scene: BABYLON.Scene, { center, tileSize, preLoadBoxSize, boundary, sun }: TileOptions) {
    super('tile', scene);

    this.scene = scene;
    this.tileSize = tileSize;
    this.preLoadBoxSize = preLoadBoxSize || tileSize;

    this.currentOsmTile = new OsmTile(scene, { center, tileSize, boundary, sun });
    this.currentOsmTile.createTile();
    this.currentOsmTile.parent = this;
    this.osmTiles.push(this.currentOsmTile);
  }

  update(position: BABYLON.Vector3) {
    this.position.x = -position.x;
    this.position.z = -position.z;

    this.updatetile();
  }

  updatetile() {
    const offset = this.preLoadBoxSize / 2;
    const { x, z } = this.position;
    const points = [
      [-x - offset, -z + offset],
      [-x + offset, -z + offset],
      [-x + offset, -z - offset],
      [-x - offset, -z - offset],
    ];
    points.forEach(point => {
      const offsetX = Math.ceil(point[0] / this.tileSize) - 1;
      const offsetY = Math.ceil(point[1] / this.tileSize) - 1;
      const tile = this.osmTiles.find(d => d.offsetX === offsetX && d.offsetY === offsetY);

      if (!tile) {
        const newTile = this.currentOsmTile.next(offsetX, offsetY);
        newTile.createTile();
        newTile.parent = this;
        this.osmTiles.push(newTile);
      }
    });
    this.clearTiles();
  }

  clearTiles() {
    const offsetX = Math.ceil(-this.position.x / this.tileSize) - 1;
    const offsetY = Math.ceil(-this.position.z / this.tileSize) - 1;
    this.osmTiles = this.osmTiles.filter(d => {
      if (Math.abs(d.offsetX - offsetX) < 2 && Math.abs(d.offsetY - offsetY) < 2) {
        return true;
      }
      // 移除瓦片
      d.dispose();
    });
  }
}
