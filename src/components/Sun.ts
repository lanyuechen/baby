import * as BABYLON from 'babylonjs';

import { degToRad } from '@/utils/utils';
import WorldBox from '@/components/WorldBox';

type SunOptions = {
  world?: WorldBox;
  center: any;
  date?: Date;
};

const LIGHT_INTENSITY = 0.6;

export default class Sun {
  scene: BABYLON.Scene;
  center: any;
  radius: number = 400;
  speed: number = 30; // 分钟
  sunSize: number = 40;
  light: BABYLON.DirectionalLight;
  lightSphere: BABYLON.Mesh;
  shadowGenerator: BABYLON.ShadowGenerator;
  observer?: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;
  day: number = 1; // 1 ~ 365
  time: number = 0;

  constructor(scene: BABYLON.Scene, { world, center, date }: SunOptions) {
    this.scene = scene;
    this.center = center;

    this.initDate(date);
    
    this.light = this.createLight();
    this.lightSphere = this.createLightSphere();
    this.shadowGenerator = this.createShadowGenerator(this.light);
    this.updateLight();
    this.addKeyboardEventObserver();

    if (world) {
      this.lightSphere.onBeforeRenderObservable.add(() => {
        world.removeBoundary();
      });
      
      this.lightSphere.onAfterRenderObservable.add(() => {
        world.setBoundary();
      });
    }
  }

  static getTrack(lon: number, lat: number, radius: number, n: number, t: number) {
    lon = degToRad(lon);
    lat = degToRad(lat);
  
    // const tao = 2 * Math.PI * (n - 1) / 365;
    // const a = 0.006918 - 0.399912 * Math.cos(tao) + 0.070257 * Math.sin(tao) - 0.006758 * Math.cos(2 * tao) + 0.000907 * Math.sin(2 * tao) - 0.002697 * Math.cos(3 * tao) + 0.00148 * Math.sin(3 * tao);
    
    const a = degToRad(23.45 * Math.sin(2 * Math.PI * (284 + n) / 365));
    const hm = Math.PI / 2 - lat + a; // 太阳正午高度角
  
    const beta = hm + lat;
    const phi = 2 * Math.PI * t / 1440;
    const d = radius * Math.cos(beta);
    const x = radius * Math.sin(beta) * Math.sin(phi);
    const y = radius * Math.sin(beta) * Math.cos(phi) * Math.sin(lat) + d * Math.cos(lat);
    const z = radius * Math.sin(beta) * Math.cos(phi) * Math.cos(lat) - d * Math.sin(lat);
    return { x, y: -z, z: y }; // 坐标转换
  }

  initDate(date?: Date) {
    date = date || new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const d1 = new Date(year, 0, 0).getTime();
    const d2 = new Date(year, month, day).getTime();
    this.day = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    this.time = hour * 60 + minute;
  }

  updateLight() {
    const { x, y, z } = Sun.getTrack(this.center.lon, this.center.lat, this.radius, this.day, this.time);
    if (y + this.sunSize / 2 < 0) {
      this.light.intensity = 0;
    } else {
      this.light.intensity = LIGHT_INTENSITY;
    }
    this.light.position = new BABYLON.Vector3(x, y, z);
    this.light.direction = new BABYLON.Vector3(-x, -y, -z);
    this.lightSphere.position = this.light.position;
  }

  createLight() {
    const light = new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(0, 0, 0), this.scene);
    // light.autoUpdateExtends = false;
    light.intensity = LIGHT_INTENSITY;
    return light;
  }

  createLightSphere = () => {
    const lightSphere = BABYLON.MeshBuilder.CreateSphere(
      'sphere', {
        diameter: this.sunSize
      },
      this.scene,
    );

    const lightSphereMaterial = new BABYLON.StandardMaterial('lightSphereMaterial', this.scene);
    lightSphereMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
    lightSphere.material = lightSphereMaterial;
    return lightSphere;
  }

  createShadowGenerator(light: BABYLON.DirectionalLight) {
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    // shadowGenerator.getShadowMap()!.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    return shadowGenerator;
  }

  addKeyboardEventObserver() {
    this.observer = this.scene.onKeyboardObservable.add((info) => {
      switch(info.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          this.move(info.event.key);
          this.updateLight();
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          break;
      }
    });
  }

  move(direction: string) {
    if (direction === 'r') {
      this.time += this.speed;
    } else if (direction === 'f') {
      this.time -= this.speed;
    }
    if (this.time > 1440) {
      this.time -= 1440;
    }
    if (this.time < 0) {
      this.time += 1440;
    }
  }
}