import * as BABYLON from '@babylonjs/core';
import Player from '@/components/Player';
import Sun from '@/components/Sun';
import Boundary from '@/components/Boundary';
import Tile from '@/components/Tile';
import Skybox from '@/components/Skybox';
// import HavokPhysics from '@babylonjs/havok';

let center = { lon: 116.3150, lat: 40.0478 };  // 清河

// center = { lon: 116.3908, lat: 39.9148 }; // 故宫
center = { lon: 116.4734, lat: 39.9350 }; // 朝阳公园
// center = { lon: 116.4609, lat: 39.9129 }; // CBD
// center = { lon: 121.49610, lat: 31.24012 }; //上海
// center = { lon: -74.0112, lat: 40.7063 }; // 曼哈顿

const tileSize = 1000;
const boundarySize = tileSize * 0.4;
const CAMERA_DISTANCE_MAX = 1000;
const CAMERA_DISTANCE_MIN = 10;

export default class WorldScene {
  engine: BABYLON.Engine;
  canvas: HTMLCanvasElement;
  scene!: BABYLON.Scene;

  constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    this.engine = engine;
    this.canvas = canvas;
    // this.init();
  }

  async init() {
    // 创建场景
    this.scene = await this.createScene(this.engine);

    // 创建相机
    const camera = this.createCamera(this.scene);
    camera.attachControl(this.canvas, true);
    this.scene.activeCamera = camera;

    // 创建天空盒子
    const skybox = Skybox.create(this.scene);
    this.scene.skybox = skybox;

    // 创建世界边界（clipPanel）
    const boundary = new Boundary(this.scene, boundarySize);
    this.scene.boundary = boundary;

    // 创建太阳（太阳模型、提供光照、阴影）
    const sun = new Sun(this.scene, { center });
    this.scene.sun = sun;

    // 创建基础灯光，照亮世界
    const light = this.createBaseLight(this.scene);

    // 创建地图瓦片
    const tile = new Tile(this.scene, tileSize, center);
    await tile.init();  // 初始化tile

    // 创建玩家
    const player = new Player(this.scene);
    await player.init();
    player.parent = tile;                             // 玩家作为地图瓦片的子元素
    player.position = new BABYLON.Vector3(500, 100, 500);  // 初始位置

    // 根据玩家位置更新瓦片图位置，实现将用户置于地图中心的效果
    tile.update(player.position);
    this.scene.onBeforeRenderObservable.add(() => {
      tile.update(player.position);
    });
  }

  async createScene(engine: BABYLON.Engine) {
    // 创建场景
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
    scene.collisionsEnabled = true;
    // scene.createDefaultEnvironment();
    // scene.environmentTexture = new BABYLON.CubeTexture('public/environment.env', this.scene);

    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    // const havokInstance = await HavokPhysics();
    // const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);
    // scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), physicsPlugin);

    return scene;
  }

  createCamera(scene: BABYLON.Scene) {
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 4,
      CAMERA_DISTANCE_MAX,
      new BABYLON.Vector3(0, 3, 0), // 相机指向头顶位置
      scene,
    );
  
    // 相机控制
    camera.lowerRadiusLimit = CAMERA_DISTANCE_MIN;
    // camera.upperRadiusLimit = CAMERA_DISTANCE_MAX;
    camera.lowerBetaLimit = 0.1;      // 由于技术原因，将beta设置为0或者PI(180°)会引起问题，在这种情况下可以将beta在0或PI的基础上偏移0.1弧度（0.6°）
    camera.upperBetaLimit = Math.PI;  // 远距离观察室会导致相机进入到地面下，需要限制
    camera.wheelPrecision = 0.3;

    return camera;
  }

  createBaseLight(scene: BABYLON.Scene) {
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;  // 灯光强度
    return light;
  }
}
