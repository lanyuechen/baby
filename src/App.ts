import * as BABYLON from '@babylonjs/core';

import WorldScene from '@/scenes/World';

export default class {
  engine: BABYLON.Engine;
  world: WorldScene;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas, true);
    this.engine.enableOfflineSupport = false;   // 优化：关闭IndexDB
    this.engine.doNotHandleContextLost = true;  // 优化：关闭上下文丢失处理

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
    this.world = new WorldScene(this.engine, this.canvas);
  }

  debug(debugOn: boolean = true) {
    if (debugOn) {
      this.world.scene.debugLayer.show({ overlay: true });
    } else {
      this.world.scene.debugLayer.hide();
    }
  }

  async run() {
    const fps = document.getElementById('fps')!;
    // this.debug(true);
    this.engine.displayLoadingUI();
    await this.world.init();
    this.engine.hideLoadingUI();
    this.engine.runRenderLoop(() => {
      this.world.scene.render();
      fps.innerHTML = `${this.engine.getFps().toFixed()} fps`;
    });
  }
}
