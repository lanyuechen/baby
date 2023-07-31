import * as BABYLON from 'babylonjs';
import Player from '@/components/Player';
import OsmBuilding from '@/components/OsmBuilding';

export default class DemoScene {
  scene: BABYLON.Scene;

  constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    this.scene = this.createScene(engine, canvas);
  }

  createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    // 创建场景
    const scene = new BABYLON.Scene(engine);
  
    // 创建相机
    // const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    const camera = new BABYLON.ArcRotateCamera('camera2', -Math.PI / 2, Math.PI / 4 * 0, 4, new BABYLON.Vector3(0, 0, 0), scene);
    // const camera = new BABYLON.UniversalCamera('camera3', new BABYLON.Vector3(0, 1, 1), scene);

    // 相机指向原点
    camera.setTarget(BABYLON.Vector3.Zero());
  
    // 相机固定到画布上
    // camera.attachControl(canvas, true);
  
    // 创建一个半球光，朝向天空（0, 1, 0）
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), scene);
  
    // 灯光强度设为0.7
    light.intensity = 0.7;

    const center = { lon: 116.3160, lat: 40.0468 };
    const center2 = { lon: 116.3140, lat: 40.0468 };
    const radius = 500;

    new OsmBuilding(center, radius, scene);
    // new OsmBuilding(center2, radius, scene);
    new Player(scene);

    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 2, height: 2 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
    ground.material = groundMaterial;
    
    return scene;
  }
}
