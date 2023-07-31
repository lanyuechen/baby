import { degToRad } from '@/utils/utils';

// ECEF坐标系：地心地固坐标系，简称地心坐标系（Earth-Centered, Earth-Fixed）
// LLA坐标系：经度（longitude）、纬度（latitude）、高度（altitude）
// ENU坐标系：东-北-天坐标系

export const WGS_84 = {
  a: 6378137,                // 长半轴
  b: 6356752.3142,           // 短半轴
  f: 1 / 298.257223563,      // 扁率 f = (a - b) / a
  e: 0.08181919092890633,    // 第一偏心率 e = Math.sqrt(a * a - b * b) / a
  e2: 0.08209443803685426,   // 第二偏心率 e = Math.sqrt(a * a - b * b) / b
}

export type PointLla = {
  lon: number;
  lat: number;
  alt?: number;
}

export type PointXyz = {
  x: number;
  y: number;
  z: number;
}

class Coord {
  centerLla: PointLla;
  centerXyz: PointXyz;
  matrix: number[][];
  matrixReverse: number[][];

  constructor(center: PointLla) {
    this.centerLla = center;
    this.centerXyz = Coord.blhToXyz(center.lon, center.lat);
    this.matrix = Coord.getTransformMatrix(center.lon, center.lat);
    this.matrixReverse = Coord.getTransformMatrixReverse(center.lon, center.lat);
  }

  static getTransformMatrix(lon: number, lat: number) {
    lon = degToRad(lon);
    lat = degToRad(lat);
    
    return [
      [ -Math.sin(lon), Math.cos(lon), 0 ],
      [ -Math.sin(lat) * Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat) ],
      [ Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat) ],
    ]
  }

  static getTransformMatrixReverse(lon: number, lat: number) {
    lon = degToRad(lon);
    lat = degToRad(lat);
    
    return [
      [ -Math.sin(lon), -Math.sin(lat) * Math.cos(lon), Math.cos(lat) * Math.cos(lon) ],
      [ Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat) * Math.sin(lon) ],
      [ 0, Math.cos(lat), Math.sin(lat) ],
    ]
  }

  static blhToXyz(L: number, B: number, H: number = 0) {
    L = degToRad(L);
    B = degToRad(B);
  
    const W = Math.sqrt(1 - WGS_84.e ** 2 * Math.sin(B) ** 2);
    const N = WGS_84.a / W;
    const x = (N + H) * Math.cos(B) * Math.cos(L);
    const y = (N + H) * Math.cos(B) * Math.sin(L);
    const z = (N * (1 - WGS_84.e ** 2) + H) * Math.sin(B);
  
    return { x, y, z };
  }

  static xyzToBlh(x: number, y: number, z: number) {

    const p = Math.sqrt(x **2 + y **2);
    const theta = Math.atan(z * WGS_84.a / (p * WGS_84.b));
    const L = Math.atan2(y, x);

    const B = Math.atan((z + WGS_84.e2 ** 2 * WGS_84.b * Math.sin(theta) ** 3) / (p - WGS_84.e ** 2 * WGS_84.a * Math.cos(theta) ** 3))
    const N = WGS_84.a / Math.sqrt(1 - WGS_84.e ** 2 * Math.sin(B) ** 2);
    const H = p / Math.cos(B) - N;

    return { B, L, H };
  }

  toEnu(lon: number, lat: number, alt: number = 0) {
    const pointXyz = Coord.blhToXyz(lon, lat, alt);
    const deltaX = pointXyz.x - this.centerXyz.x;
    const deltaY = pointXyz.y - this.centerXyz.y;
    const deltaZ = pointXyz.z - this.centerXyz.z;
  
    const e = this.matrix[0][0] * deltaX + this.matrix[0][1] * deltaY + this.matrix[0][2] * deltaZ;
    const n = this.matrix[1][0] * deltaX + this.matrix[1][1] * deltaY + this.matrix[1][2] * deltaZ;
    const u = this.matrix[2][0] * deltaX + this.matrix[2][1] * deltaY + this.matrix[2][2] * deltaZ;
    return { e, n, u };
  }

  toEcef(e: number, n: number, u: number = 0) {
    const x = this.matrixReverse[0][0] * e + this.matrixReverse[0][1] * n + this.matrixReverse[0][2] * u + this.centerXyz.x;
    const y = this.matrixReverse[1][0] * e + this.matrixReverse[1][1] * n + this.matrixReverse[1][2] * u + this.centerXyz.y;
    const z = this.matrixReverse[2][0] * e + this.matrixReverse[2][1] * n + this.matrixReverse[2][2] * u + this.centerXyz.z;

    const blh = Coord.xyzToBlh(x, y, z);
    return { lon: blh.L, lat: blh.B, alt: blh.H };
  }
}

export default Coord;