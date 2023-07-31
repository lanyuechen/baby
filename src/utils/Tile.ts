import * as BABYLON from 'babylonjs';
import OsmTile from '@/utils/OsmTile';

export default class {
  scene: BABYLON.Scene;
  x: number = 0;
  y: number = 0;
  currentOsmTile: OsmTile;
  osmTiles: OsmTile[] = [];
  observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;
  
  constructor(center: any, tileSize: number, scene: BABYLON.Scene) {
    this.scene = scene;
    this.observer = this.addKeyboardEventObserver();

    this.currentOsmTile = new OsmTile(center, tileSize);
    this.currentOsmTile.createBuildings(scene);
    this.osmTiles.push(this.currentOsmTile);

    // const offset = { x: -1, y: 0 };
    // const osm2 = osm.next(offset.x, offset.y);
    // osm2.createBuildings(offset, scene);
  }

  updatetile() {
    if (this.x > 1) {
      const tile2 = this.currentOsmTile.next(1, 0);
      tile2.createBuildings(this.scene);
      this.osmTiles.push(tile2);
    }
  }

  move(direction: string) {
    if (direction === 'ArrowUp') {
      this.y += 0.1;
    } else if (direction === 'ArrowDown') {
      this.y -= 0.1;
    } else if (direction === 'ArrowLeft') {
      this.x -= 0.1;
    } else if (direction === 'ArrowRight') {
      this.x += 0.1;
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
