import * as BABYLON from 'babylonjs';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import Sun from '@/components/Sun';
import Osm from './Osm';
import Coord, { PointLla } from './Coord';

type OsmTileOptions = {
  center: any;
  tileSize: number;
  boundary: Boundary;
  sun?: Sun;
  shadowGenerator?: BABYLON.ShadowGenerator;
}

export default class OsmTile {
  scene: BABYLON.Scene;
  center: PointLla;
  radius: number;
  tileSize: number;
  boundary: Boundary;
  sun?: Sun;
  coord: Coord;
  offsetX: number = 0;
  offsetY: number = 0;
  rootNode: BABYLON.TransformNode;

  constructor(scene: BABYLON.Scene, { center, tileSize, boundary, sun }: OsmTileOptions) {
    this.scene = scene;
    this.center = center;
    this.boundary = boundary;
    this.sun = sun;
    this.tileSize = tileSize;
    this.radius = tileSize / Math.sqrt(2);
    this.coord = new Coord(center);
    this.rootNode = new BABYLON.TransformNode('tileRoot', scene);
  }

  async createTile() {
    const data = await this.fetchData();

    this.createHighways(data.filter(d => d.tags.highway));
    this.createBuildings(data.filter(d => d.tags.building));
    this.createWaterAreas(data.filter(d => d.tags.natural === 'water'));
    this.createGround();
    
    this.rootNode.position.x = this.offsetX * this.tileSize;
    this.rootNode.position.z = this.offsetY * this.tileSize;
  }

  createBuildings(data: any[]) {
    // 创建建筑
    console.log('building', data);
    const material = new BABYLON.StandardMaterial('buildingMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    this.boundary.setBoundary(material);

    data.forEach(d => {
      const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
      const poly = BABYLON.MeshBuilder.ExtrudePolygon(
        `building-${d.id}`,
        { shape: vec3, depth: d.level, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
        this.scene,
        earcut,
      );
      poly.checkCollisions = true;  // 开启碰撞检测
      poly.position.y = d.level;
      poly.parent = this.rootNode;
      poly.material = material;
      this.sun?.shadowGenerator.addShadowCaster(poly);
    });
  }

  createHighways(data: any[]) {
    // 创建道路
    console.log('highway', data);
    const material = new BABYLON.StandardMaterial('highwayMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.boundary.setBoundary(material);

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
        line.position.y = 0.1;
        line.parent = this.rootNode;
        line.material = material;
      }
    });
  }

  createWaterAreas(data: any[]) {
    // 创建水域
    console.log('waterArea', data);
    const material = new BABYLON.StandardMaterial('waterAreaMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0.69, 0.87, 0.89);
    this.boundary.setBoundary(material);

    data.forEach(d => {
      const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
      const poly = BABYLON.MeshBuilder.CreatePolygon(
        `waterArea-${d.id}`,
        { shape: vec3 },
        this.scene,
        earcut,
      );
      poly.position.y = 0.1;
      poly.parent = this.rootNode;
      poly.material = material;
    });
  }

  createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: this.tileSize, height: this.tileSize }, this.scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    // groundMaterial.diffuseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    this.boundary.setBoundary(groundMaterial);

    ground.checkCollisions = true;  // 开启碰撞检测
    ground.material = groundMaterial;
    ground.position.x = this.tileSize / 2;
    ground.position.z = this.tileSize / 2;
    ground.parent = this.rootNode;
    ground.receiveShadows = true;
  }

  next(offsetX: number, offsetY: number) {
    const point = this.coord.toEcef(this.tileSize * offsetX, this.tileSize * offsetY);
    const osmTile = new OsmTile(this.scene, {
      center: point,
      tileSize: this.tileSize,
      boundary: this.boundary,
      sun: this.sun,
    });
    osmTile.offsetX = offsetX;
    osmTile.offsetY = offsetY;
    return osmTile;
  }

  dispose() {
    this.rootNode.dispose(false, true);
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
          x: enu.e + this.tileSize / 2,
          y: enu.n + this.tileSize / 2,
        };
      } else if (d.type === 'way') {
        buildings.push({
          ...d,
          nodes: d.nodes.map((id: number) => nodeMap[id]),
          level: parseInt(d.tags['building:levels'] || '1') * 3,
        });
      }
    });
  
    return buildings;
  }
}
