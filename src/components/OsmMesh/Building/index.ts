import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { getPerimeter } from '@/utils/utils';
import type { BuildingData } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: BuildingData) {
    super('osmBuilding', scene);
    this.scene = scene;

    this.create(data);
  }

  // 创建建筑
  create(data: BuildingData) {
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

  createMaterial(data: BuildingData) {
    const material = new BABYLON.PBRMaterial('buildingMaterial', this.scene);

    material.albedoColor = BABYLON.Color3.FromHexString(data.color);   // 设置建筑颜色

    const perimeter = getPerimeter(data.nodes);

    const vScale = (data.height - data.minHeight) / 3;
    const uScale = perimeter / 3;
    
    const albedoTexture = new BABYLON.Texture('textures/buildings/facades/block_window_diffuse.png', this.scene);
    albedoTexture.vScale = vScale;
    albedoTexture.uScale = uScale;
    material.albedoTexture = albedoTexture
    
    const bumpTexture = new BABYLON.Texture('textures/buildings/facades/block_window_normal.png', this.scene);
    bumpTexture.vScale = vScale;
    bumpTexture.uScale = uScale;
    material.bumpTexture = bumpTexture;

    material.useParallax = true;
    material.useParallaxOcclusion = true;

    // const metallicTexture = new BABYLON.Texture('textures/buildings/facades/block_window_mask.png', this.scene);
    // metallicTexture.vScale = vScale;
    // metallicTexture.uScale = uScale;
    // material.metallicTexture = metallicTexture;
    material.roughness = 1;
    material.metallic = 0;

    // https://learn.foundry.com/zh-hans/modo/content/help/pages/shading_lighting/shader_items/gltf.html
    // material.useRoughnessFromMetallicTextureAlpha = false;
    // material.useRoughnessFromMetallicTextureGreen = true;       // glTF Roughness涡流通道必须是Green
    // material.useMetallnessFromMetallicTextureBlue = true;       // glTF Metallic涡流通道必须是Blue
    // material.useAmbientOcclusionFromMetallicTextureRed = true;  // glTF Ambient Occlusion涡流通道必须是Red

    this.scene.boundary?.setBoundary(material);

    return material;
  }
}
