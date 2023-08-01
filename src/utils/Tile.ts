import * as BABYLON from 'babylonjs';
import OsmTile from '@/utils/OsmTile';

export default class {
  scene: BABYLON.Scene;
  rootNode: BABYLON.TransformNode;
  x: number = 0;
  y: number = 0;
  preLoadDistance: number = 0.499;  // 防止边界情况一次加载多个瓦片
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
      [this.x - this.preLoadDistance, this.y + this.preLoadDistance],
      [this.x + this.preLoadDistance, this.y + this.preLoadDistance],
      [this.x + this.preLoadDistance, this.y - this.preLoadDistance],
      [this.x - this.preLoadDistance, this.y - this.preLoadDistance],
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
