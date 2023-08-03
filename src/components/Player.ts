import * as BABYLON from 'babylonjs';

export default class Player {
  scene: BABYLON.Scene;
  speed: number;
  x: number = 500;
  y: number = 100;
  z: number = 500;
  observer?: BABYLON.Nullable<BABYLON.Observer<BABYLON.KeyboardInfo>>;
  body: BABYLON.Mesh;

  constructor(scene: BABYLON.Scene, options: any = {}) {
    this.scene = scene;
    this.speed = options.speed || 10;
    this.body = this.createPlayer();
  }

  createPlayer() {
    const box = BABYLON.MeshBuilder.CreateBox('player', { size: 10 }, this.scene);
    const boxMaterial = new BABYLON.StandardMaterial('playerMaterial', this.scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
    box.material = boxMaterial;
    box.position.x = this.x;
    box.position.y = this.y;
    box.position.z = this.z;
    box.ellipsoid = new BABYLON.Vector3(10, 10, 10);
    box.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);
    box.checkCollisions = true; // 开启碰撞检测
    return box;
  }

  addKeyboardEventObserver(cb: (player: Player) => void) {
    this.observer = this.scene.onKeyboardObservable.add((info) => {
      switch(info.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          this.move(info.event.key);
          cb(this);
          break;
        case BABYLON.KeyboardEventTypes.KEYUP:
          break;
      }
    });
  }

  move(direction: string) {
    let displacement;
    if (direction === 'w') {
      displacement = new BABYLON.Vector3(0, 0, this.speed);
    } else if (direction === 's') {
      displacement = new BABYLON.Vector3(0, 0, -this.speed);
    } else if (direction === 'a') {
      displacement = new BABYLON.Vector3(-this.speed, 0, 0);
    } else if (direction === 'd') {
      displacement = new BABYLON.Vector3(this.speed, 0, 0);
    } else if (direction === 'u') {
      displacement = new BABYLON.Vector3(0, this.speed, 0);
    } else if (direction === 'j') {
      displacement = new BABYLON.Vector3(0, -this.speed, 0);
    }
    
    if (displacement) {
      const { x, y, z } = this.body.moveWithCollisions(displacement).position;

      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  destroy() {
    if (this.observer) {
      this.scene.onKeyboardObservable.remove(this.observer);
    }
  }
}