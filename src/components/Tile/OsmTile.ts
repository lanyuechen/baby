import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { getPolygonDirection } from '@/utils/utils';
import Boundary from '@/components/Boundary';
import Sun from '@/components/Sun';
import Osm from './Osm';
import Coord, { PointLla } from './Coord';

type OsmTileOptions = {
  center: any;
  tileSize: number;
  boundary?: Boundary;
  sun?: Sun;
}

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  center: PointLla;
  radius: number;
  tileSize: number;
  boundary?: Boundary;
  sun?: Sun;
  coord: Coord;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor(scene: BABYLON.Scene, { center, tileSize, boundary, sun }: OsmTileOptions) {
    super('osmTile', scene);

    this.scene = scene;
    this.center = center;
    this.boundary = boundary;
    this.sun = sun;
    this.tileSize = tileSize;
    this.radius = tileSize / Math.sqrt(2);
    this.coord = new Coord(center);
  }

  async init() {
    const data = await this.fetchData();

    this.createHighways(data.filter(d => d.tags.highway));
    this.createBuildings(data.filter(d => d.tags.building && d.tags['building']));
    this.createWaterAreas(data.filter(d => d.tags.natural === 'water'));
    this.createGround();
    
    this.position.x = this.offsetX * this.tileSize;
    this.position.z = this.offsetY * this.tileSize;
  }

  createBuildings(data: any[]) {
    // 创建建筑
    console.log('building', data);

    data.forEach(d => {
      const material = new BABYLON.PBRMaterial('buildingMaterial', this.scene);

      material.albedoColor = new BABYLON.Color3(1, 1, 1);
      material.metallic = 0;
      material.roughness = 1.0;
      material.albedoColor = Osm.getBuildingColor(d);   // 设置建筑颜色
      this.boundary?.setBoundary(material);

      const direction = getPolygonDirection(d.nodes);
      const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
      const poly = BABYLON.MeshBuilder.ExtrudePolygon(
        `building-${d.id}`,
        {
          shape: direction ? vec3 : vec3.reverse(),
          depth: d.height,
          // sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        },
        this.scene,
        earcut,
      );
      poly.checkCollisions = true;
      poly.position.y = d.height;
      poly.parent = this;
      poly.material = material;
      poly.receiveShadows = true;
      this.sun?.shadowGenerator.addShadowCaster(poly);
    });
  }

  createHighways(data: any[]) {
    // 创建道路
    console.log('highway', data);
    const material = new BABYLON.StandardMaterial('highwayMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.boundary?.setBoundary(material);

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
        line.parent = this;
        line.material = material;
      }
    });
  }

  createWaterAreas(data: any[]) {
    // 创建水域
    console.log('waterArea', data);
    const material = new BABYLON.StandardMaterial('waterAreaMaterial', this.scene);
    material.diffuseColor = new BABYLON.Color3(0, 1, 1);
    this.boundary?.setBoundary(material);

    data.forEach(d => {
      const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
      const poly = BABYLON.MeshBuilder.CreatePolygon(
        `waterArea-${d.id}`,
        { shape: vec3 },
        this.scene,
        earcut,
      );
      poly.position.y = 0.1;
      poly.parent = this;
      poly.material = material;
    });
  }

  createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: this.tileSize, height: this.tileSize }, this.scene);
    
    const material = new BABYLON.PBRMaterial('groundMaterial', this.scene);

    material.albedoColor = new BABYLON.Color3(1, 1, 1);
    material.metallic = 0;
    material.roughness = 1.0;
    
    // const material = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    // material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    // // material.diffuseTexture = new BABYLON.Texture('textures/ground.jpg', this.scene);
    // // material.specularColor = new BABYLON.Color3(0, 0, 0);
    this.boundary?.setBoundary(material);

    ground.checkCollisions = true;
    ground.material = material;
    ground.position.x = this.tileSize / 2;
    ground.position.z = this.tileSize / 2;
    ground.parent = this;
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
          height: Osm.getBuildingHeight(d),
        });
      }
    });
  
    return buildings;
  }
}
