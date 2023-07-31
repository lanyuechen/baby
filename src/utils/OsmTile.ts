import * as BABYLON from 'babylonjs';
import earcut from 'earcut';
import Osm from './Osm';
import Coord from './Coord';

export default class OsmTile {
  center: any;
  radius: number;
  tileSize: number;
  halfTileSize: number;
  coord: Coord;

  constructor(center: any, tileSize: number) {
    this.center = center;
    this.tileSize = tileSize;
    this.halfTileSize = tileSize / 2;
    this.radius = tileSize / Math.sqrt(2);
    this.coord = new Coord(center);
  }

  async createBuildings(offset: any, scene: BABYLON.Scene) {
    offset = { x: 0, y: 0, ...(offset || {}) };
    const data = await this.fetchDataPixel(offset);
    
    // 创建建筑
    console.log('===', data)
    data.forEach(d => {
      const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
      const poly = BABYLON.MeshBuilder.ExtrudePolygon(
        `building-${d.id}`,
        { shape: vec3, depth: d.level, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
        scene,
        earcut,
      );
      poly.position.y = d.level;
    });

    const ground = BABYLON.MeshBuilder.CreateGround('ground'+Math.random(), { width: 2, height: 2 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
    ground.material = groundMaterial;
    ground.position.x = offset.x * 2;
    ground.position.z = offset.y * 2;
  }

  next(offsetX: number, offsetY: number) {
    const point = this.coord.toEcef(this.tileSize * offsetX, this.tileSize * offsetY);
    const osm = new OsmTile(point, this.tileSize);
    return osm;
  }

  async fetchDataPixel(offset: any) {
    const osmData = await Osm.fetchData(this.center, this.radius);
    const data = await this.osmToPixel(osmData, offset);
  
    return data;
  }

  async osmToPixel(osmData: any, offset: any) {
    const nodeMap: any = {};
    const buildings: any[] = [];
    const coord = new Coord(this.center);

    osmData.elements.forEach((d: any) => {
      if (d.type === 'node') {
        const enu = coord.toEnu(d.lon, d.lat);

        nodeMap[d.id] = {
          ...d,
          x: enu.e / this.halfTileSize + offset.x * 2,
          y: enu.n / this.halfTileSize + offset.y * 2,
        };
      } else if (d.type === 'way') {
        buildings.push({
          ...d,
          nodes: d.nodes.map((id: number) => nodeMap[id]),
          level: parseInt(d.tags['building:levels'] || '1') * 3 / this.halfTileSize,
        });
      }
    });
  
    return buildings;
  }
}
