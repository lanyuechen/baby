import * as BABYLON from 'babylonjs';
import earcut from 'earcut';
import Osm from '@/utils/Osm';

export default class DemoScene {
  scene: BABYLON.Scene;
  osm: Osm = new Osm();

  constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    this.scene = this.createScene(engine, canvas);
  }

  createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    // 创建场景
    const scene = new BABYLON.Scene(engine);
  
    // 创建相机
    // const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
    const camera = new BABYLON.ArcRotateCamera('camera2', -Math.PI / 2, Math.PI / 4, 2, new BABYLON.Vector3(0, 0, 0), scene);
  
    // 相机指向原点
    camera.setTarget(BABYLON.Vector3.Zero());
  
    // 相机固定到画布上
    camera.attachControl(canvas, true);
  
    // 创建一个半球光，朝向天空（0, 1, 0）
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 1), scene);
  
    // 灯光强度设为0.7
    light.intensity = 0.7;

    const center = { lon: 116.3160, lat: 40.0468 };
    const radius = 500;

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
      })
    });

    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 2, height: 2 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
    ground.material = groundMaterial;
    
    return scene;
  }
}
