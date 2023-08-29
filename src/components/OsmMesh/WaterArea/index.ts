import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import MaterialHelper from '@/components/MaterialHelper';
import type { Geo } from '@/components/OsmService/typing';

export default class extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: Geo.Way) {
    super('osmWaterarea', scene);
    this.scene = scene;

    this.create(data);
  }

  create(data: Geo.Way) {
    this.createWaterArea(data);
    this.createBank(data);
  }

  // 创建水域
  createWaterArea(data: Geo.Way) {
    const mesh = BABYLON.MeshBuilder.CreatePolygon(
      `waterArea-${data.id}`,
      { shape: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)) },
      this.scene,
      earcut,
    );
    mesh.parent = this;
    mesh.position.y = -2;
    mesh.material = MaterialHelper.getInstance(this.scene).waterMaterial;
    mesh.checkCollisions = true;
  }

  createBank(data: Geo.Way) {
    const mesh = BABYLON.MeshBuilder.ExtrudeShape(
      `waterarea-bank-${data.id}`,
      {
        shape: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(0, -10, 0),
        ],
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        path: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
      }
    );
    mesh.parent = this;
    mesh.material = MaterialHelper.getInstance(this.scene).basicMaterial;
  }

  addToRenderList(...nodes: any[]) {
    const waterMaterial = MaterialHelper.getInstance(this.scene).waterMaterial;
    if (waterMaterial) {
      nodes.forEach(node => {
        waterMaterial.addToRenderList(node);
      });
    }
  }
}
