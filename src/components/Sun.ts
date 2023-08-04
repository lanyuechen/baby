import * as BABYLON from 'babylonjs';

import { degToRad } from '@/utils/utils';

type SunOptions = {
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
  body: BABYLON.Mesh;
  shadowGenerator: BABYLON.ShadowGenerator;
  observer?: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;
  day: number = 1; // 1 ~ 365
  time: number = 0;

  constructor(scene: BABYLON.Scene, { center, date }: SunOptions) {
    this.scene = scene;
    this.center = center;

    this.initDate(date);
    
    this.light = this.createLight();
    this.body = this.createSun();
    this.light.excludedMeshes.push(this.body);
    this.shadowGenerator = this.createShadowGenerator(this.light);
    this.updateLight();
    this.addKeyboardEventObserver();

    var animation = new BABYLON.Animation(
      'sun-routate',
      'rotation.y',
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE,
    );

    animation.setKeys([
      { frame: 0, value: 0 },
      { frame: 300, value: 2 * Math.PI },
    ])
    this.body.animations.push(animation);
    this.scene.beginAnimation(this.body, 0, 100, true);
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
    this.body.position = this.light.position;
  }

  createLight() {
    const light = new BABYLON.DirectionalLight('directionalLight', new BABYLON.Vector3(0, 0, 0), this.scene);
    // light.autoUpdateExtends = false;
    light.intensity = LIGHT_INTENSITY;
    return light;
  }

  createSun() {
    // Create a particle system
    const surfaceParticles = new BABYLON.ParticleSystem('surfaceParticles', 1600, this.scene);
    const flareParticles = new BABYLON.ParticleSystem('flareParticles', 20, this.scene);
    const coronaParticles = new BABYLON.ParticleSystem('coronaParticles', 600, this.scene);

    surfaceParticles.isLocal = true;
    flareParticles.isLocal = true;
    coronaParticles.isLocal = true;
  
    // Texture of each particle
    surfaceParticles.particleTexture = new BABYLON.Texture('textures/sun/T_SunSurface.png', this.scene);
    flareParticles.particleTexture = new BABYLON.Texture('textures/sun/T_SunFlare.png', this.scene);
    coronaParticles.particleTexture = new BABYLON.Texture('textures/sun/T_Star.png', this.scene);
   
    // Create core sphere
    const coreSphere = BABYLON.MeshBuilder.CreateSphere(
      'coreSphere',
      {
        diameter: 2.01 * this.sunSize / 2,
        segments: 64,
      },
      this.scene,
    );
  
    // Create core material
    const coreMaterial = new BABYLON.StandardMaterial('coreMaterial', this.scene)
    coreMaterial.emissiveColor = new BABYLON.Color3(0.3773, 0.0930, 0.0266); 
  
    // Assign core material to sphere
    coreSphere.material = coreMaterial;
  
    // Pre-warm
    surfaceParticles.preWarmStepOffset = 10;
    surfaceParticles.preWarmCycles = 100;
  
    flareParticles.preWarmStepOffset = 10;
    flareParticles.preWarmCycles = 100;

    coronaParticles.preWarmStepOffset = 10;
    coronaParticles.preWarmCycles = 100;
  
    // Initial rotation
    surfaceParticles.minInitialRotation = -2 * Math.PI;
    surfaceParticles.maxInitialRotation = 2 * Math.PI;
  
    flareParticles.minInitialRotation = -2 * Math.PI;
    flareParticles.maxInitialRotation = 2 * Math.PI;

    coronaParticles.minInitialRotation = -2 * Math.PI;
    coronaParticles.maxInitialRotation = 2 * Math.PI;
  
    // Where the sun particles come from
    const sunEmitter = new BABYLON.SphereParticleEmitter();
    sunEmitter.radius = this.sunSize / 2;
    sunEmitter.radiusRange = 0; // emit only from shape surface
  
    // Assign particles to emitters
    surfaceParticles.emitter = coreSphere; // the starting object, the emitter
    surfaceParticles.particleEmitterType = sunEmitter;
  
    flareParticles.emitter = coreSphere; // the starting object, the emitter
    flareParticles.particleEmitterType = sunEmitter;

    coronaParticles.emitter = coreSphere; // the starting object, the emitter
    coronaParticles.particleEmitterType = sunEmitter;
  
    // Color gradient over time
    surfaceParticles.addColorGradient(0, new BABYLON.Color4(0.8509, 0.4784, 0.1019, 0.0));
    surfaceParticles.addColorGradient(0.4, new BABYLON.Color4(0.6259, 0.3056, 0.0619, 0.5));
    surfaceParticles.addColorGradient(0.5, new BABYLON.Color4(0.6039, 0.2887, 0.0579, 0.5));
    surfaceParticles.addColorGradient(1.0, new BABYLON.Color4(0.3207, 0.0713, 0.0075, 0.0));
  
    flareParticles.addColorGradient(0, new BABYLON.Color4(1, 0.9612, 0.5141, 0.0));
    flareParticles.addColorGradient(0.25, new BABYLON.Color4(0.9058, 0.7152, 0.3825, 1.0));
    flareParticles.addColorGradient(1.0, new BABYLON.Color4(0.6320, 0.0, 0.0, 0.0));

    coronaParticles.addColorGradient(0, new BABYLON.Color4(0.8509, 0.4784, 0.1019, 0.0));
    coronaParticles.addColorGradient(0.5, new BABYLON.Color4(0.6039, 0.2887, 0.0579, 0.12));
    coronaParticles.addColorGradient(1.0, new BABYLON.Color4(0.3207, 0.0713, 0.0075, 0.0));
  
    // Size of each particle (random between...
    surfaceParticles.minSize = 0.4 * this.sunSize / 2;
    surfaceParticles.maxSize = 0.7 * this.sunSize / 2;
  
    flareParticles.minScaleX = 0.5 * this.sunSize / 2;
    flareParticles.minScaleY = 0.5 * this.sunSize / 2;
    flareParticles.maxScaleX= 1.0 * this.sunSize / 2;
    flareParticles.maxScaleY = 1.0 * this.sunSize / 2;

    coronaParticles.minScaleX = 0.5 * this.sunSize / 2;
    coronaParticles.minScaleY = 0.75 * this.sunSize / 2;
    coronaParticles.maxScaleX = 1.2 * this.sunSize / 2;
    coronaParticles.maxScaleY = 3.0 * this.sunSize / 2;
  
    // Size over lifetime
    flareParticles.addSizeGradient(0, 0);
    flareParticles.addSizeGradient(1, 1);
    
    // Life time of each particle (random between...
    surfaceParticles.minLifeTime = 8.0;
    surfaceParticles.maxLifeTime = 8.0;
  
    flareParticles.minLifeTime = 10.0;
    flareParticles.maxLifeTime = 10.0;

    coronaParticles.minLifeTime = 2.0;
    coronaParticles.maxLifeTime= 2.0;
  
    // Emission rate
    surfaceParticles.emitRate = 200;
    flareParticles.emitRate = 1;
    coronaParticles.emitRate = 300;
  
    // Blend mode : BLENDMODE_ONEONE, BLENDMODE_STANDARD, or BLENDMODE_ADD
    surfaceParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    flareParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    coronaParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  
    // Set the gravity of all particles
    surfaceParticles.gravity = new BABYLON.Vector3(0, 0, 0);
    flareParticles.gravity = new BABYLON.Vector3(0, 0, 0);
    coronaParticles.gravity = new BABYLON.Vector3(0, 0, 0);
  
    // Angular speed, in radians
    surfaceParticles.minAngularSpeed = -0.4;
    surfaceParticles.maxAngularSpeed = 0.4;
  
    flareParticles.minAngularSpeed = 0.0;
    flareParticles.maxAngularSpeed = 0.0;

    coronaParticles.minAngularSpeed = 0.0;
    coronaParticles.maxAngularSpeed = 0.0;
  
    // Speed
    surfaceParticles.minEmitPower = 0;
    surfaceParticles.maxEmitPower = 0;
    surfaceParticles.updateSpeed = 0.005;
  
    flareParticles.minEmitPower = 0.001;
    flareParticles.maxEmitPower = 0.01;

    coronaParticles.minEmitPower = 0.0;
    coronaParticles.maxEmitPower = 0.0;
  
    // No billboard
    surfaceParticles.isBillboardBased = false;
    flareParticles.isBillboardBased = true;
    coronaParticles.isBillboardBased = true;
  
    // Render Order
    // coronaParticles.renderingGroupId = 1;
    // flareParticles.renderingGroupId = 2;
    // surfaceParticles.renderingGroupId = 3;
    // coreSphere.renderingGroupId = 3;

    // Start the particle system
    surfaceParticles.start();
    flareParticles.start();
    coronaParticles.start();

    return coreSphere;
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