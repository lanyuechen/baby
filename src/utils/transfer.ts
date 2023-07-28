import { degToRad } from '@/utils/utils';

export const WGS_84 = {
  a: 6378137,                // 长半轴
  b: 6356752.3142,           // 短半轴
  f: 1 / 298.257223563,      // 扁率 f = (a - b) / a
  e: 0.08181919092890633,    // 第一偏心率 e = Math.sqrt(a * a - b * b) / a
  e2: 0.08209443803685426,   // 第二偏心率 e = Math.sqrt(a * a - b * b) / b
}

export const blhToXyz = (lon: number, lat: number, H: number = 0) => {
  lon = degToRad(lon);
  lat = degToRad(lat);

  const W = Math.sqrt(1 - WGS_84.e ** 2 * Math.sin(lat) ** 2);
  const N = WGS_84.a / W;
  const x = (N + H) * Math.cos(lat) * Math.cos(lon);
  const y = (N + H) * Math.cos(lat) * Math.sin(lon);
  const z = (N * (1 - WGS_84.e ** 2) + H) * Math.sin(lat);

  return { x, y, z };
}

export const getTransformMatrix = (lon: number, lat: number) => {
  lon = degToRad(lon);
  lat = degToRad(lat);
  
  return [
    [ -Math.sin(lon), Math.cos(lon), 0 ],
    [ -Math.sin(lat) * Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat) ],
    [ Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat) ],
  ]
}

export const xyzToEnu = (matrix: any, center: any, point: any) => {
  const deltaX = point.x - center.x;
  const deltaY = point.y - center.y;
  const deltaZ = point.z - center.z;

  const e = matrix[0][0] * deltaX + matrix[0][1] * deltaY + matrix[0][2] * deltaZ;
  const n = matrix[1][0] * deltaX + matrix[1][1] * deltaY + matrix[1][2] * deltaZ;
  const u = matrix[2][0] * deltaX + matrix[2][1] * deltaY + matrix[2][2] * deltaZ;
  return { e, n, u };
}