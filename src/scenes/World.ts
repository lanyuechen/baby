import * as BABYLON from 'babylonjs';
import Player from '@/components/Player';
import Sun from '@/components/Sun';
import Boundary from '@/components/Boundary';
import Tile from '@/components/Tile';

const center = { lon: 116.3160, lat: 40.0468 };  // 清河
// const center = { lon: 116.3908, lat: 39.9148 }; // 故宫
// const center = { lon: 116.4734, lat: 39.9414 }; // 朝阳公园
const tileSize = 1000;

export default class WorldScene {
  scene: BABYLON.Scene;
  camera: BABYLON.Camera;
  player: Player;
  tile: Tile;
  sun?: Sun;
  boundary: Boundary;

  constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    this.scene = this.createScene(engine);
    this.camera = this.createCamera(this.scene, canvas);

    this.boundary = new Boundary(this.scene, tileSize * 0.6);
    this.sun = new Sun(this.scene, { center });

    // 创建一个半球光，朝向天空（0, 1, 0）
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.5;  // 灯光强度
    if (this.sun) {
      light.excludedMeshes.push(this.sun.body);
    }

    this.tile = new Tile(this.scene, {
      center,
      tileSize,
      boundary: this.boundary,
      sun: this.sun,
    });

    this.player = new Player(this.scene);

    this.player.body.parent = this.tile.rootNode;

    this.tile.update(this.player.x, this.player.z);
    this.player.addKeyboardEventObserver(() => {
      this.tile.update(this.player.x, this.player.z);
    });
  }

  createScene(engine: BABYLON.Engine) {
    // 创建场景
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
    scene.collisionsEnabled = true;
    return scene;
  }

  createCamera(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
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

    return camera;
  }
}
