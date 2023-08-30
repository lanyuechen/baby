import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { getPerimeter } from '@/utils/utils';
import MaterialHelper from '@/components/MaterialHelper';
import type { Geo } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: Geo.Way) {
    super('osmBuilding', scene);
    this.scene = scene;

    this.create(data as Geo.Building);
  }

  // 创建建筑
  create(data: Geo.Building) {
    const material = this.createMaterial(data);

    const faceUV = new Array(data.nodes.length + 2);
    faceUV[0] = new BABYLON.Vector4(0, 0, 0, 0);
    faceUV[faceUV.length - 1] = new BABYLON.Vector4(0, 0, 0, 0);
    for (let i = 1; i < faceUV.length - 1; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
    }

    const poly = BABYLON.MeshBuilder.ExtrudePolygon(
      `building-${data.id}`,
      {
        shape: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
        depth: data.height - data.minHeight,
        wrap: true,
        faceUV,
        // sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = material;
    poly.receiveShadows = true;
    poly.checkCollisions = true;
    poly.position.y = data.height;
  }

  createMaterial(data: Geo.Building) {
    const { buildingMaterial, buildingTexture } = MaterialHelper.getInstance(this.scene);
    const material = buildingMaterial.clone('') as BABYLON.PBRMaterial;

    material.albedoColor = BABYLON.Color3.FromHexString(data.color);   // 设置建筑颜色

    const perimeter = getPerimeter(data.nodes);

    const vScale = (data.height - data.minHeight) / 3;
    const uScale = perimeter / 3;
    
    const albedoTexture = buildingTexture.albedoTexture.clone();
    albedoTexture.vScale = vScale;
    albedoTexture.uScale = uScale;
    material.albedoTexture = albedoTexture
    
    const bumpTexture = buildingTexture.bumpTexture.clone();
    bumpTexture.vScale = vScale;
    bumpTexture.uScale = uScale;

    return material;
  }
}
