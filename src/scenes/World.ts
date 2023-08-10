import * as BABYLON from '@babylonjs/core';
import Player from '@/components/Player';
import Sun from '@/components/Sun';
import Boundary from '@/components/Boundary';
import Tile from '@/components/Tile';
import HavokPhysics from '@babylonjs/havok';

const center = { lon: 116.3150, lat: 40.0478 };  // 清河
// const center = { lon: 116.3908, lat: 39.9148 }; // 故宫
// const center = { lon: 116.4734, lat: 39.9414 }; // 朝阳公园
const tileSize = 1000;
const boundarySize = tileSize * 0.4;
const preLoadBoxSize = tileSize * 0.5;
const cameraDistance = tileSize * 0.8;

export default class WorldScene {
  scene!: BABYLON.Scene;
  camera!: BABYLON.Camera;
  player!: Player;
  tile!: Tile;
  sun?: Sun;
  boundary!: Boundary;

  constructor(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    this.init(engine, canvas);
  }

  async init(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    this.scene = await this.createScene(engine);
    this.camera = this.createCamera(this.scene);

    this.camera.attachControl(canvas, true);
    this.scene.activeCamera = this.camera;

    this.boundary = new Boundary(this.scene, boundarySize);
    // this.sun = new Sun(this.scene, { center });

    // 创建一个半球光，朝向天空（0, 1, 0）
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);
    light.intensity = 0.5;  // 灯光强度
    // if (this.sun) {
    //   light.excludedMeshes.push(this.sun.body);
    // }

    this.tile = new Tile(this.scene, {
      center,
      tileSize,
      preLoadBoxSize,
      boundary: this.boundary,
      // sun: this.sun,
    });

    this.player = new Player(this.scene);
    this.player.parent = this.tile;
    this.player.position = new BABYLON.Vector3(500, 100, 500);

    this.tile.update(this.player.position);
    this.scene.onBeforeRenderObservable.add(() => {
      this.tile.update(this.player.position);
    });
  }

  async createScene(engine: BABYLON.Engine) {
    // 创建场景
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
    scene.collisionsEnabled = true;

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
      cameraDistance,
      new BABYLON.Vector3(0, 1.8, 0), // 相机指向头顶位置
      scene,
    );
  
    // 相机控制
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = cameraDistance * 2;
    camera.lowerBetaLimit = 0.1;  // 由于技术原因，将beta设置为0或者PI(180°)会引起问题，在这种情况下可以将beta在0或PI的基础上偏移0.1弧度（0.6°）
    camera.upperBetaLimit = Math.PI;  // 远距离观察室会导致相机进入到地面下，需要限制
    camera.wheelPrecision = 0.3;

    return camera;
  }
}
