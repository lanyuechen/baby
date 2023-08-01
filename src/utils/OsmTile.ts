import * as BABYLON from 'babylonjs';
import earcut from 'earcut';
import Osm from './Osm';
import Coord, { PointLla } from './Coord';

export default class OsmTile {
  scene: BABYLON.Scene;
  center: PointLla;
  radius: number;
  tileSize: number;
  coord: Coord;
  offsetX: number = 0;
  offsetY: number = 0;
  rootNode: BABYLON.TransformNode;

  constructor(center: PointLla, tileSize: number, scene: BABYLON.Scene) {
    this.scene = scene;
    this.center = center;
    this.tileSize = tileSize;
    this.radius = tileSize / Math.sqrt(2);
    this.coord = new Coord(center);
    this.rootNode = new BABYLON.TransformNode('tileRoot', scene);
  }

  async createTile() {
    const data = await this.fetchData();

    this.createRoads(data.filter(d => d.tags.highway));
    this.createBuildings(data.filter(d => d.tags.building));
    this.createGround();
    
    this.rootNode.position.x = this.offsetX;
    this.rootNode.position.z = this.offsetY;
  }

  createBuildings(data: any[]) {
    // 创建建筑
    console.log('building', data)
    data.forEach(d => {
      const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
      const poly = BABYLON.MeshBuilder.ExtrudePolygon(
        `building-${d.id}`,
        { shape: vec3, depth: d.level, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
        this.scene,
        earcut,
      );
      poly.position.y = d.level;
      poly.parent = this.rootNode;
    });
  }

  createRoads(data: any[]) {
    // 创建道路
    console.log('highway', data)
    data.forEach(d => {
      if (d.nodes.length > 2) {
        const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
        const line = BABYLON.MeshBuilder.CreateLines(
          `highway-${d.id}`,
          {
            points: vec3,
          },
          this.scene,
        );
        line.parent = this.rootNode;
      }
    });
  }

  createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 1, height: 1 }, this.scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
    // groundMaterial.diffuseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    ground.material = groundMaterial;
    ground.position.x = 0.5;
    ground.position.z = 0.5;
    ground.parent = this.rootNode;
  }

  next(offsetX: number, offsetY: number) {
    const point = this.coord.toEcef(this.tileSize * offsetX, this.tileSize * offsetY);
    const osm = new OsmTile(point, this.tileSize, this.scene);
    osm.offsetX = offsetX;
    osm.offsetY = offsetY;
    return osm;
  }

  private async fetchData() {
    const osmData = await Osm.fetchData(this.center, this.radius);
    const data = this.osmToEnu(osmData);
  
    return data;
  }

  private osmToEnu(osmData: any) {
    const nodeMap: any = {};
    const buildings: any[] = [];
    const coord = new Coord(this.center);

    osmData.elements.forEach((d: any) => {
      if (d.type === 'node') {
        const enu = coord.toEnu(d.lon, d.lat);

        nodeMap[d.id] = {
          ...d,
          x: enu.e / this.tileSize + 0.5,
          y: enu.n / this.tileSize + 0.5,
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
