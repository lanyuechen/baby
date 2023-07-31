import * as BABYLON from 'babylonjs';
import OsmTile from '@/utils/OsmTile';

export default class {
  constructor(center: any, tileSize: number, scene: BABYLON.Scene) {
    const osm = new OsmTile(center, tileSize);
    osm.createBuildings(undefined, scene);

    const offset = { x: -1, y: 0 };
    const osm2 = osm.next(offset.x, offset.y);
    osm2.createBuildings(offset, scene);
  }
}
