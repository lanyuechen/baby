import * as BABYLON from '@babylonjs/core';
import suncalc from 'suncalc';

type SunOptions = {
  center: any;
  date?: Date;
};

const LIGHT_INTENSITY = 0.6;

export default class Sun {
  scene: BABYLON.Scene;
  center: any;
  date: Date;
  trackRadius: number = 400;    // 太阳轨道半径
  sunRadius: number = 20;       // 太阳半径
  light: BABYLON.DirectionalLight;
  body: BABYLON.Mesh;
  shadowGenerator: BABYLON.ShadowGenerator;
  observer?: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;

  constructor(scene: BABYLON.Scene, { center, date }: SunOptions) {
    this.scene = scene;
    this.center = center;
    this.date = date || new Date();

    this.light = this.createLight();

    this.body = this.createSun();
    // this.body = new BABYLON.Mesh('test', this.scene);

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

  updateLight() {
    const pos = suncalc.getPosition(this.date, this.center.lat, this.center.lon);

    const z = -Math.cos(pos.azimuth) * Math.cos(pos.altitude) * this.trackRadius;
    const x = -Math.sin(pos.azimuth) * Math.cos(pos.altitude) * this.trackRadius;
    const y = Math.sin(pos.altitude) * this.trackRadius;

    if (y + this.sunRadius < 0) {
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
        diameter: 2.01 * this.sunRadius,
        segments: 64,
      },
      this.scene,
    );
  
    // Create core material
    const coreMaterial = new BABYLON.StandardMaterial('coreMaterial', this.scene)
    coreMaterial.emissiveColor = new BABYLON.Color3(0.3773, 0.0930, 0.0266);
    coreMaterial.disableLighting = true;
  
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
    sunEmitter.radius = this.sunRadius;
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
    surfaceParticles.minSize = 0.4 * this.sunRadius;
    surfaceParticles.maxSize = 0.7 * this.sunRadius;
  
    flareParticles.minScaleX = 0.5 * this.sunRadius;
    flareParticles.minScaleY = 0.5 * this.sunRadius;
    flareParticles.maxScaleX= 1.0 * this.sunRadius;
    flareParticles.maxScaleY = 1.0 * this.sunRadius;

    coronaParticles.minScaleX = 0.5 * this.sunRadius;
    coronaParticles.minScaleY = 0.75 * this.sunRadius;
    coronaParticles.maxScaleX = 1.2 * this.sunRadius;
    coronaParticles.maxScaleY = 3.0 * this.sunRadius;
  
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
    // const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    const shadowGenerator = new BABYLON.CascadedShadowGenerator(1024, light);
    shadowGenerator.forceBackFacesOnly = true;
    // shadowGenerator.useBlurExponentialShadowMap = true;
    // shadowGenerator.getShadowMap()!.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    // 速度优先
    //   将shadowMaxZ设置得等于camera.maxZ
    //   设置尽量小的cascadeBlendPercentage
    //   设置autoCalcDepthBounds = true
    //   设置freezeShadowCastersBoundingInfo = true
    //   设置depthClamp = false

    // 质量优先
    //   将 camera.maxZ - camera.minZ 的范围设置得越紧凑越好
    //   将 camera.minZ 设置得越大越好
    //   numCascades = 4
    //   map的size越大越好
    //   设置 autoCalcDepthBounds = true  
    //   设置lambda = 1
    //   设置 depthClamp = true
    //   设置 stabilizeCascades = false
    //   filteringQuality 设置得越大越好

    return shadowGenerator;
  }

  addKeyboardEventObserver() {
    this.observer = this.scene.onKeyboardObservable.add((info) => {
      switch(info.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          if (info.event.key === 'r') {
            this.date = new Date(this.date.getTime() + 1000 * 60 * 60);
          } else if (info.event.key === 'f') {
            this.date = new Date(this.date.getTime() - 1000 * 60 * 60);
          }
          this.updateLight();
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          break;
      }
    });
  }
}