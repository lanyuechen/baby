import * as BABYLON from '@babylonjs/core';
import { getPerimeter } from '@/utils/utils';
import type { Geo } from '@/components/OsmService/typing';

const FENCE_HEIGHT = 2;

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;

  constructor(scene: BABYLON.Scene, data: Geo.Way) {
    super('osmBuilding', scene);
    this.scene = scene;

    this.create(data);
  }

  // 创建Fence
  create(data: Geo.Way) {
    if (data.nodes.length < 2) {
      return;
    }

    const material = this.createMaterial(data);

    const mesh = BABYLON.MeshBuilder.ExtrudeShape(
      `fence-${data.id}`,
      {
        shape: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(0, FENCE_HEIGHT, 0),
        ],
        cap: BABYLON.Mesh.CAP_ALL,
        invertUV: true,
        path: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      },
      this.scene,
    );

    mesh.parent = this;
    mesh.material = material;
    mesh.checkCollisions = true;
  }

  createMaterial(data: Geo.Way) {
    const material = new BABYLON.PBRMaterial('fenceMaterial', this.scene);
    material.albedoColor = BABYLON.Color3.White();
    material.roughness = 1;
    material.metallic = 0;

    const perimeter = getPerimeter(data.nodes, false);

    const vScale = 1;
    const uScale = perimeter / FENCE_HEIGHT;

    const albedoTexture = new BABYLON.Texture('textures/surfaces/metal_fence_diffuse.png', this.scene);
    albedoTexture.vScale = vScale;
    albedoTexture.uScale = uScale;
    material.albedoTexture = albedoTexture;

    const bumpTexture = new BABYLON.Texture('textures/surfaces/metal_fence_normal.png', this.scene);
    bumpTexture.vScale = vScale;
    bumpTexture.uScale = uScale;
    material.bumpTexture = bumpTexture;
    material.useParallax = true;
    material.useParallaxOcclusion = true;

    const opacityTexture = new BABYLON.Texture('textures/surfaces/metal_fence_diffuse.png', this.scene);
    opacityTexture.vScale = vScale;
    opacityTexture.uScale = uScale;
    material.opacityTexture = opacityTexture;
    material.useAlphaFromAlbedoTexture = false;

    // const metallicTexture = new BABYLON.Texture('textures/surfaces/metal_fence_mask.png', this.scene);
    // metallicTexture.vScale = vScale;
    // metallicTexture.uScale = uScale;
    // material.metallicTexture = metallicTexture;
    
    // material.useRoughnessFromMetallicTextureAlpha = false;
    // material.useRoughnessFromMetallicTextureGreen = true;       // glTF Roughness涡流通道必须是Green
    // material.useMetallnessFromMetallicTextureBlue = true;       // glTF Metallic涡流通道必须是Blue
    // material.useAmbientOcclusionFromMetallicTextureRed = true;  // glTF Ambient Occlusion涡流通道必须是Red

    this.scene.boundary?.setBoundary(material);

    return material;
  }
}
