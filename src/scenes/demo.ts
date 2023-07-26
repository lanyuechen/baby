import * as BABYLON from 'babylonjs';

export default (engine: BABYLON.Engine, canvas: HTMLCanvasElement) => {
  // 创建场景
  const scene = new BABYLON.Scene(engine);

  // 创建相机
  const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);

  // 相机指向原点
  camera.setTarget(BABYLON.Vector3.Zero());

  // 相机固定到画布上
  camera.attachControl(canvas, true);

  // 创建一个半球光，朝向天空（0, 1, 0）
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

  // 灯光强度设为0.7
  light.intensity = 0.7;

  // 创建球体
  const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 32 }, scene);

  // 向上移动球体半径高度
  sphere.position.y = 1;

  // 创建底面
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene);

  return scene;
};
