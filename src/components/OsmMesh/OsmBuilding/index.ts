import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { BuildingData } from '@/components/OsmService/typing';

export default class OsmTile extends BABYLON.AbstractMesh {
  scene: BABYLON.Scene;
  boundary?: Boundary;

  constructor(scene: BABYLON.Scene, boundary: Boundary | undefined, data: BuildingData) {
    super('osmBuilding', scene);
    this.scene = scene;
    this.boundary = boundary;

    this.create(data);
  }

    // 创建建筑
  create(data: BuildingData) {
    const material = this.createMaterial(data);

    const poly = BABYLON.MeshBuilder.ExtrudePolygon(
      `building-${data.id}`,
      {
        shape: data.nodes.map((node: any) => new BABYLON.Vector3(node.x, 0, node.y)),
        depth: data.height - data.minHeight,
        // sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      },
      this.scene,
      earcut,
    );
    poly.parent = this;
    poly.material = material;
    poly.receiveShadows = true;
    // poly.checkCollisions = true;
    poly.position.y = data.height;
  }

  createMaterial(data: BuildingData) {
    const material = new BABYLON.PBRMaterial('buildingMaterial', this.scene);

    material.metallic = 0;
    material.roughness = 1.0;
    material.albedoColor = BABYLON.Color3.FromHexString(data.color);   // 设置建筑颜色
    material.albedoTexture = new BABYLON.Texture('textures/buildings/facades/block_wall_diffuse.png', this.scene);
    // material.metallicTexture
    material.bumpTexture = new BABYLON.Texture('textures/buildings/facades/block_wall_normal.png', this.scene);
    material.forceIrradianceInFragment = true;

    // this.boundary?.setBoundary(material);

    return material;
  }
}

// "facadeBlockWallDiffuse": {"url": "/textures/buildings/facades/block_wall_diffuse.png", "type": "image"},
// "facadeBlockWallNormal": {"url": "/textures/buildings/facades/block_wall_normal.png", "type": "image"},
// "facadeBlockWallMask": {"url": "/textures/buildings/facades/block_wall_mask.png", "type": "image"},