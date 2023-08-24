import * as BABYLON from '@babylonjs/core';
import { getPerimeter } from '@/utils/utils';
import Boundary from '@/components/Boundary';
import type { WayData } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: WayData) {
    super('osmBuilding', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

  // 创建道路
  create(data: WayData) {
    if (data.nodes.length < 2) {
      return;
    }

    const material = this.createMaterial(data);

    const mesh = BABYLON.MeshBuilder.ExtrudeShape(
      `fence-${data.id}`,
      {
        shape: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(0, 200, 0),
        ],
        invertUV: true,
        path: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      },
      this.scene,
    );

    mesh.parent = this;
    mesh.material = material;
  }

  createMaterial(data: WayData) {
    const material = new BABYLON.PBRMaterial('fenceMaterial', this.scene);
    material.albedoColor = BABYLON.Color3.White();
    // material.roughness = 1;
    // material.metallic = 0;

    const perimeter = getPerimeter(data.nodes, false);

    const vScale = 1;
    const uScale = perimeter;

    const albedoTexture = new BABYLON.Texture('textures/surfaces/metal_fence_diffuse.png', this.scene);
    albedoTexture.vScale = vScale;
    albedoTexture.uScale = uScale;
    material.albedoTexture = albedoTexture;
    const bumpTexture = new BABYLON.Texture('textures/surfaces/metal_fence_normal.png', this.scene);
    bumpTexture.vScale = vScale;
    bumpTexture.uScale = uScale;
    material.bumpTexture = bumpTexture;
    // material.ambientTexture = new BABYLON.Texture('textures/surfaces/metal_fence_mask.png', this.scene);

    // const metallicTexture = new BABYLON.Texture('textures/surfaces/metal_fence_normal.png', this.scene);
    // metallicTexture.vScale = vScale;
    // metallicTexture.uScale = uScale;
    // material.metallicTexture = metallicTexture;

    material.opacityTexture = new BABYLON.Texture('textures/surfaces/metal_fence_diffuse.png', this.scene);
    material.useAlphaFromAlbedoTexture = false;
    
    material.useRoughnessFromMetallicTextureAlpha = false;
    material.useRoughnessFromMetallicTextureGreen = true;       // glTF Roughness涡流通道必须是Green
    material.useMetallnessFromMetallicTextureBlue = true;       // glTF Metallic涡流通道必须是Blue
    material.useAmbientOcclusionFromMetallicTextureRed = true;  // glTF Ambient Occlusion涡流通道必须是Red

    this.boundary?.setBoundary(material);

    return material;
  }
}
