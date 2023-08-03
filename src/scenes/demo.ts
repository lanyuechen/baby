import * as BABYLON from 'babylonjs';
import Player from '@/components/Player';
import Sun from '@/components/Sun';
import World from '@/components/World';
import Tile from '@/utils/Tile';

const center = { lon: 116.3160, lat: 40.0468 };
const tileSize = 1000;

export default class DemoScene {
  scene: BABYLON.Scene;

  constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    this.scene = this.createScene(engine, canvas);
  }

  createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    // 创建场景
    const scene = new BABYLON.Scene(engine);
  
    // 创建相机
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 4,
      tileSize,
      new BABYLON.Vector3(0, 0, 0),
      scene,
    );

    // 相机指向原点
    camera.setTarget(BABYLON.Vector3.Zero());
  
    // 相机控制
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = tileSize * 0.8;
    camera.upperRadiusLimit = tileSize * 2;
    camera.lowerBetaLimit = 0.001;  // 设置为0会导致α旋转时方向错乱
    camera.upperBetaLimit = Math.PI / 2;
    camera.wheelPrecision = 0.3;
  
    // 创建一个半球光，朝向天空（0, 1, 0）
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  
    // 灯光强度
    light.intensity = 0.5;

    const world = new World(scene, tileSize * 0.6);
    world.setBoundary();
    const sun = new Sun(scene, {
      world,
      center,
    });

    light.excludedMeshes.push(sun.lightSphere);

    const player = new Player(scene);
    const tile = new Tile(scene, {
      center,
      tileSize,
      player,
      shadowGenerator: sun.shadowGenerator,
    });

    // 碰撞检测
    scene.collisionsEnabled = true;
    player.body.checkCollisions = true;
    
    return scene;
  }
}
