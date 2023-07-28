import * as BABYLON from 'babylonjs';
import earcut from 'earcut';
import Osm from '@/utils/Osm';

export default class {
  center: any;
  osm: Osm = new Osm();

  constructor(center: any, radius: number, scene: BABYLON.Scene) {
    this.createBuildings(center, radius, scene);
  }

  createBuildings(center: any, radius: number, scene: BABYLON.Scene) {
    this.osm.fetchDataPixel(center, radius).then(res => {
      // 创建建筑
      console.log('===', res)
      res.forEach(d => {
        const vec3 = d.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y));
        const poly = BABYLON.MeshBuilder.ExtrudePolygon(
          `building-${d.id}`,
          { shape: vec3, depth: d.level, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
          scene,
          earcut,
        );
        poly.position.y = d.level;
      });
    });
  }
}
