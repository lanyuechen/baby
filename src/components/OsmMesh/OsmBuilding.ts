import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import Boundary from '@/components/Boundary';
import type { BuildingData } from '@/components/OsmService/typing';

// roof:orientation=along/across	对于带有屋脊的屋顶，假定屋脊与建筑物的最长边平行(roof:orientation=along)。但是可以使用此标签明确标注。
// roof:height=*	建筑物的高度（即立面的高度）计算为建筑物的总height=*减去roof:height=*。
// roof:angle=*	除了roof:height=*之外，还可以通过提供坡面的倾斜度（以度为单位）来间接指定屋顶高度。
// roof:levels=*	尚未计入building:levels=*中的屋顶内楼层数。
// roof:direction=*

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
    poly.checkCollisions = true;
    poly.position.y = data.height;
  }

  createMaterial(data: BuildingData) {
    const material = new BABYLON.PBRMaterial('buildingMaterial', this.scene);

    material.albedoColor = new BABYLON.Color3(1, 1, 1);
    material.metallic = 0;
    material.roughness = 1.0;
    material.albedoColor = BABYLON.Color3.FromHexString(data.color);   // 设置建筑颜色

    this.boundary?.setBoundary(material);

    return material;
  }
}
