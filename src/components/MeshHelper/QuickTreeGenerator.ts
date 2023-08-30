import * as BABYLON from '@babylonjs/core';

// trunkMaterial - material used for trunk.
// leafMaterial - material for canopies.
const sizeBranch = 8; // sphere radius used for branches and leaves 15 to 20.
const sizeTrunk = 5; // height of trunk 10 to 15.
const radius = 0.2; // radius of trunk 1 to 5.

export default (scene: BABYLON.Scene) => {
  const leaves = BABYLON.MeshBuilder.CreateSphere('', { segments: 2, diameter: sizeBranch });

  const positions = leaves.getVerticesData(BABYLON.VertexBuffer.PositionKind)!;
  const indices = leaves.getIndices();

  const min = -sizeBranch / 10;
  const max = sizeBranch / 10;
  const map = [];

  for (let i = 0; i < positions.length; i += 3) {
    const p = new BABYLON.Vector3(positions[i], positions[i + 1], positions[i + 2]);

    let found = false;
    for (let index = 0; index < map.length && !found; index++) {
      const array = map[index];
      const p0 = array[0] as BABYLON.Vector3;
      if (p0.equals(p) || p0.subtract(p).lengthSquared() < 0.01) {
        array.push(i);
        found = true;
      }
    }
    if (!found) {
      let array = [];
      array.push(p, i);
      map.push(array);
    }
  }

  map.forEach((array) => {
    const rx = Math.random() * (max - min) + min;
    const ry = Math.random() * (max - min) + min;
    const rz = Math.random() * (max - min) + min;

    for (let j = 1; j < array.length; j++) {
      const i = array[j] as number;
      positions[i] += rx;
      positions[i + 1] += ry;
      positions[i + 2] += rz;
    }
  });

  const normals: any = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);

  leaves.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
  leaves.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  leaves.convertToFlatShadedMesh();

  const leafMaterial = new BABYLON.PBRMaterial('', scene);
  leafMaterial.roughness = 1;
  leafMaterial.metallic = 0;
  leafMaterial.albedoColor = BABYLON.Color3.Green();
  leaves.material = leafMaterial;

  const trunk = BABYLON.MeshBuilder.CreateCylinder('', {
    height: sizeTrunk,
    diameterTop: radius * 2,
    diameterBottom: radius * 2,
    tessellation: 10,
  });
  trunk.convertToFlatShadedMesh();

  const trunkMaterial = new BABYLON.PBRMaterial('', scene);
  trunkMaterial.roughness = 1;
  trunkMaterial.metallic = 0;
  trunkMaterial.albedoColor = BABYLON.Color3.Gray();
  trunk.material = trunkMaterial;

  trunk.position.y = sizeTrunk / 2;
  leaves.position.y = sizeTrunk + sizeBranch / 2 - 2;

  // 合并网格，保留子网格各自材质
  const tree = BABYLON.Mesh.MergeMeshes([leaves, trunk], true, true, undefined, false, true)!;

  return tree;
};
