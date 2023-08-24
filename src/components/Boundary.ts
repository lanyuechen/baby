import * as BABYLON from '@babylonjs/core';

export default class {
  scene: BABYLON.Scene;
  size: number;

  constructor(scene: BABYLON.Scene, size: number) {
    this.scene = scene;
    this.size = size;

    // this.createUnderGround();
  }

  createUnderGround() {
    const ground = BABYLON.MeshBuilder.CreateCylinder(
      'underGround', 
      {
        diameter: this.size * Math.sqrt(2),
        height: this.size / 5,
        tessellation: 4,
        cap: BABYLON.Mesh.CAP_START,
      },
      this.scene,
    );
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);

    // ground.checkCollisions = true;  // 开启碰撞检测
    ground.material = groundMaterial;
    ground.rotation.y = Math.PI / 4;
    // ground.position.x = this.size / 2;
    // ground.position.z = this.size / 2;
    ground.position.y = -this.size / 5 / 2;

    // new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, this.scene);
  }

  getBoundary() {
    const clipPlane = new BABYLON.Plane(1, 0, 0, -this.size / 2);    // 东
    const clipPlane2 = new BABYLON.Plane(-1, 0, 0, -this.size / 2);  // 西
    const clipPlane3 = new BABYLON.Plane(0, 0, 1, -this.size / 2);   // 北
    const clipPlane4 = new BABYLON.Plane(0, 0, -1, -this.size / 2);  // 南

    return [clipPlane, clipPlane2, clipPlane3, clipPlane4];
  }

  setBoundary(material: BABYLON.Material) {
    // const [clipPlane, clipPlane2, clipPlane3, clipPlane4] = this.getBoundary();
    // material.clipPlane = clipPlane;
    // material.clipPlane2 = clipPlane2;
    // material.clipPlane3 = clipPlane3;
    // material.clipPlane4 = clipPlane4;
  }
}