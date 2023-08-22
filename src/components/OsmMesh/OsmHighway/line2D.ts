import * as BABYLON from '@babylonjs/core';

export default (name: string, options: any, scene: BABYLON.Scene) => {
  //Arrays for vertex positions and indices
  const positions = [];
  const indices = [];
  const normals: any[] = [];

  const width = options.width || 1;
  const path = options.path;

  var outerData: BABYLON.Vector3[] = [];
  var innerData: BABYLON.Vector3[] = [];

  const nbPoints = path.length;

  let line = BABYLON.Vector3.Zero();
  let nextLine = BABYLON.Vector3.Zero();

  path[1].subtractToRef(path[0], line);

  let lineNormal = new BABYLON.Vector3(-line.z, 0, line.x).normalize();

  line.normalize();
  innerData[0] = path[0].add(lineNormal.scale(- width / 2));
  outerData[0] = path[0].add(lineNormal.scale(width / 2));

  if (nbPoints <= 2) {
    innerData[1] = path[1].add(lineNormal.scale(-width / 2));
    outerData[1] = path[1].add(lineNormal.scale(width / 2));
  } else {
    for (let i = 2; i < nbPoints; i++) {
      path[i].subtractToRef(path[i - 1], nextLine);
      const angle = Math.PI - Math.acos(BABYLON.Vector3.Dot(line, nextLine) / (line.length() * nextLine.length()));
      const direction = BABYLON.Vector3.Cross(line, nextLine).normalize().y;
      lineNormal = new BABYLON.Vector3(-line.z, 0, line.x).normalize();
      line.normalize();
      innerData[i - 1] = path[i - 1].add(lineNormal.scale(-width / 2)).add(line.scale(-(direction * width / 2) / Math.tan(angle / 2)));
      outerData[i - 1] = path[i - 1].add(lineNormal.scale(width / 2)).add(line.scale((direction * width / 2) / Math.tan(angle / 2)));
      line = nextLine.clone();
    }
  
    path[nbPoints - 1].subtractToRef(path[nbPoints - 2], line);
    lineNormal = new BABYLON.Vector3(-line.z, 0, line.x).normalize();
    line.normalize();
    innerData[nbPoints - 1] = path[nbPoints - 1].add(lineNormal.scale(-width / 2));
    outerData[nbPoints - 1] = path[nbPoints - 1].add(lineNormal.scale(width / 2));
  }

  for (let i = 0; i < nbPoints; i++) {
    positions.push(innerData[i].x, innerData[i].y, innerData[i].z);
  }

  for (let i = 0; i < nbPoints; i++) {
    positions.push(outerData[i].x, outerData[i].y, outerData[i].z);
  }

  for (let i = 0; i < nbPoints - 1; i++) {
    indices.push(i, i + 1, nbPoints + i + 1);
    indices.push(i, nbPoints + i + 1, nbPoints + i);
  }

  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  //Create a custom mesh
  const customMesh = new BABYLON.Mesh(name, scene);

  //Create a vertexData object
  const vertexData = new BABYLON.VertexData();

  //Assign positions and indices to vertexData
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;

  //Apply vertexData to custom mesh
  vertexData.applyToMesh(customMesh);

  return customMesh;
};
