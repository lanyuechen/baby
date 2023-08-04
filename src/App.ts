import * as BABYLON from 'babylonjs';

import WorldScene from '@/scenes/World';

export default class {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas, true);
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
    this.scene = (new WorldScene(this.engine, this.canvas)).scene;
  }

  debug(debugOn: boolean = true) {
    if (debugOn) {
      this.scene.debugLayer.show({ overlay: true });
    } else {
      this.scene.debugLayer.hide();
    }
  }

  run() {
    // this.debug(true);
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}
