import * as BABYLON from 'babylonjs';
import earcut from 'earcut';
import Osm from './Osm';
import Coord, { PointLla } from './Coord';

export default class OsmTile {
  center: PointLla;
  radius: number;
  tileSize: number;
  coord: Coord;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(center: PointLla, tileSize: number) {
    this.center = center;
    this.tileSize = tileSize;
    this.radius = tileSize / Math.sqrt(2);
    this.coord = new Coord(center);
  }

  async createBuildings(scene: BABYLON.Scene) {
    const data = await this.fetchDataPixel();
    
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

    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 1, height: 1 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
    ground.material = groundMaterial;
    ground.position.x = 0.5 + this.offsetX;
    ground.position.z = 0.5 + this.offsetY;
  }

  next(offsetX: number, offsetY: number) {
    const point = this.coord.toEcef(this.tileSize * offsetX, this.tileSize * offsetY);
    const osm = new OsmTile(point, this.tileSize);
    osm.offsetX = offsetX;
    osm.offsetY = offsetY;
    return osm;
  }

  async fetchDataPixel() {
    const osmData = await Osm.fetchData(this.center, this.radius);
    const data = await this.osmToPixel(osmData);
  
    return data;
  }

  async osmToPixel(osmData: any) {
    const nodeMap: any = {};
    const buildings: any[] = [];
    const coord = new Coord(this.center);

    osmData.elements.forEach((d: any) => {
      if (d.type === 'node') {
        const enu = coord.toEnu(d.lon, d.lat);

        nodeMap[d.id] = {
          ...d,
          x: enu.e / this.tileSize + 0.5 + this.offsetX,
          y: enu.n / this.tileSize + 0.5 + this.offsetY,
        };
      } else if (d.type === 'way') {
        buildings.push({
          ...d,
          nodes: d.nodes.map((id: number) => nodeMap[id]),
          level: parseInt(d.tags['building:levels'] || '1') * 3 / this.tileSize,
        });
      }
    });
  
    return buildings;
  }
}
