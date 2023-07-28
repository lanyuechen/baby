import * as BABYLON from 'babylonjs';

export default class {
  scene: BABYLON.Scene;
  observer: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;
  body: BABYLON.Mesh;

  constructor(scene: BABYLON.Scene) {
    this.scene = scene;
    this.observer = this.addKeyboardEventObserver();
    this.body = this.createPlayer();
  }

  createPlayer() {
    const box = BABYLON.MeshBuilder.CreateBox('player', { size: 0.1 }, this.scene);
    const boxMaterial = new BABYLON.StandardMaterial('playerMaterial', this.scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
    box.material = boxMaterial;
    box.position.y = 0.3;
    return box;
  }

  addKeyboardEventObserver() {
    return this.scene.onKeyboardObservable.add((info) => {
      switch(info.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          console.log('down', info.event.key);
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          console.log('up', info.event.key);
          break;
      }
    })
  }

  destroy() {
    this.scene.onKeyboardObservable.remove(this.observer);
  }
}