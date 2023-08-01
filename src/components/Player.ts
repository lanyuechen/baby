import * as BABYLON from 'babylonjs';

export default class Player {
  scene: BABYLON.Scene;
  speed: number;
  x: number = 0.5;
  y: number = 0.5;
  observer?: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;
  body: BABYLON.Mesh;

  constructor(scene: BABYLON.Scene, options: any = {}) {
    this.scene = scene;
    this.speed = options.speed || 0.01;
    this.body = this.createPlayer();
  }

  createPlayer() {
    const box = BABYLON.MeshBuilder.CreateBox('player', { size: 0.02 }, this.scene);
    const boxMaterial = new BABYLON.StandardMaterial('playerMaterial', this.scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
    box.material = boxMaterial;
    box.position.y = 0.1;
    box.position.x = 0;
    box.position.z = 0;
    return box;
  }

  addKeyboardEventObserver(cb: (player: Player) => void) {
    this.observer = this.scene.onKeyboardObservable.add((info) => {
      switch(info.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          this.move(info.event.key);
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          break;
      }
      cb(this);
    });
  }

  move(direction: string) {
    if (direction === 'ArrowUp') {
      this.y += this.speed;
    } else if (direction === 'ArrowDown') {
      this.y -= this.speed;
    } else if (direction === 'ArrowLeft') {
      this.x -= this.speed;
    } else if (direction === 'ArrowRight') {
      this.x += this.speed;
    }
  }

  destroy() {
    if (this.observer) {
      this.scene.onKeyboardObservable.remove(this.observer);
    }
  }
}