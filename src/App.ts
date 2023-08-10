import { Engine } from '@babylonjs/core';

import WorldScene from '@/scenes/World';

export default class {
  engine: Engine;
  world: WorldScene;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
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

  run() {
    // this.debug(true);
    this.engine.runRenderLoop(() => {
      this.world?.scene?.render();
    });
  }
}
