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
    const box = BABYLON.MeshBuilder.CreateBox('player', { size: 0.02 }, this.scene);
    const boxMaterial = new BABYLON.StandardMaterial('playerMaterial', this.scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
    box.material = boxMaterial;
    box.position.y = 0.1;
    return box;
  }

  addKeyboardEventObserver() {
    return this.scene.onKeyboardObservable.add((info) => {
      switch(info.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          // this.move(info.event.key);
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          break;
      }
    })
  }

  move(direction: string) {
    if (direction === 'ArrowUp') {
      this.body.position.z += 0.1;
    } else if (direction === 'ArrowDown') {
      this.body.position.z -= 0.1;
    } else if (direction === 'ArrowLeft') {
      this.body.position.x -= 0.1;
    } else if (direction === 'ArrowRight') {
      this.body.position.x += 0.1;
    }
  }

  destroy() {
    this.scene.onKeyboardObservable.remove(this.observer);
  }
}