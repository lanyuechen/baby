import * as BABYLON from 'babylonjs';
import OsmTile from '@/utils/OsmTile';

export default class {
  scene: BABYLON.Scene;
  rootNode: BABYLON.TransformNode;
  x: number = 0;
  y: number = 0;
  currentOsmTile: OsmTile;
  osmTiles: OsmTile[] = [];
  
  constructor(scene: BABYLON.Scene, center: any, tileSize: number) {
    this.scene = scene;
    this.rootNode = new BABYLON.TransformNode('rootNode', scene);

    this.currentOsmTile = new OsmTile(center, tileSize, scene);
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
      [this.x - 0.5, this.y + 0.5],
      [this.x + 0.5, this.y + 0.5],
      [this.x + 0.5, this.y - 0.5],
      [this.x - 0.5, this.y - 0.5],
    ];
    points.forEach(point => {
      const offsetX = Math.ceil(point[0]) - 1;
      const offsetY = Math.ceil(point[1]) - 1;
      const tile = this.osmTiles.find(d => d.offsetX === offsetX && d.offsetY === offsetY);

      if (!tile) {
        const newTile = this.currentOsmTile.next(offsetX, offsetY);
        newTile.createTile();
        newTile.rootNode.parent = this.rootNode;
        this.osmTiles.push(newTile);
      }
    });
  }

  clearTiles() {

  }
}
