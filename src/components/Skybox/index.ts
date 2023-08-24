import * as BABYLON from '@babylonjs/core';

export default class {
  constructor() {
    
  }

  static create(scene: BABYLON.Scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox(
      'skybox',
      {
        size: 5000,
        sideOrientation: BABYLON.Mesh.BACKSIDE,
      },
      scene,
    );

    const material = new BABYLON.StandardMaterial('backgroundMaterial', scene);
    material.reflectionTexture = new BABYLON.CubeTexture('textures/skybox/TropicalSunnyDay/TropicalSunnyDay', scene);
    material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    material.specularColor = new BABYLON.Color3(0, 0, 0);
    material.disableLighting = true;
    skybox.material = material;

    return skybox;
  }
}
