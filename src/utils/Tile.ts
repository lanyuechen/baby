import * as BABYLON from 'babylonjs';
import OsmTile from '@/utils/OsmTile';

export default class {
  scene: BABYLON.Scene;
  rootNode: BABYLON.TransformNode;
  x: number = 0.5;
  y: number = 0.5;
  currentOsmTile: OsmTile;
  osmTiles: OsmTile[] = [];
  observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;
  
  constructor(center: any, tileSize: number, scene: BABYLON.Scene) {
    this.scene = scene;
    this.observer = this.addKeyboardEventObserver();
    this.rootNode = new BABYLON.TransformNode('rootNode', scene);

    this.currentOsmTile = new OsmTile(center, tileSize, scene);
    this.currentOsmTile.createBuildings();
    this.currentOsmTile.rootNode.parent = this.rootNode;
    this.osmTiles.push(this.currentOsmTile);
  }

  updatetile() {
    const offsetX = Math.ceil(this.x) - 1;
    const offsetY = Math.ceil(this.y) - 1;

    const tile = this.osmTiles.find(d => d.offsetX === offsetX && d.offsetY === offsetY);
    if (!tile) {
      const newTile = this.currentOsmTile.next(offsetX, offsetY);
      newTile.createBuildings();
      newTile.rootNode.parent = this.rootNode;
      this.osmTiles.push(newTile);
    }
  }

  clearTiles() {

  }

  move(direction: string) {
    if (direction === 'ArrowUp') {
      this.y += 0.1;
      this.rootNode.position.z -= 0.1;
    } else if (direction === 'ArrowDown') {
      this.y -= 0.1;
      this.rootNode.position.z += 0.1;
    } else if (direction === 'ArrowLeft') {
      this.x -= 0.1;
      this.rootNode.position.x += 0.1;
    } else if (direction === 'ArrowRight') {
      this.x += 0.1;
      this.rootNode.position.x -= 0.1;
    }
    this.updatetile();
  }


  addKeyboardEventObserver() {
    return this.scene.onKeyboardObservable.add((info) => {
      switch(info.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          this.move(info.event.key);
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          break;
      }
    })
  }


  update() {

  }
}