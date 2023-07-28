// 角度转弧度
const rad = (x) => {
  return x * Math.PI / 180;
}

// Vincenty
export const getDistanceByVincenty = (p1, p2) => {
  const a = 6378137;            // 半长轴
  const b = 6356752.3142;       // 半短轴
  const f = 1 / 298.257223563;  // 偏心率

  const L = rad(p2.lon - p1.lon);
  const U1 = Math.atan((1 - f) * Math.tan(rad(p1.lat)));
  const U2 = Math.atan((1 - f) * Math.tan(rad(p2.lat)));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);

  let lambda = L;
  let lambdaP = 2 * Math.PI;
  let iterLimit = 20;
  let cosSqAlpha;
  let sigma;
  let sinSigma;
  let cos2SigmaM;
  let cosSigma;
  while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
    if (sinSigma === 0) {
      return 0;  // co-incident points
    }
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    const alpha = Math.asin(cosU1 * cosU2 * sinLambda / sinSigma);
    cosSqAlpha = Math.cos(alpha) * Math.cos(alpha);
    cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
    const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    lambdaP = lambda;
    lambda = L + (1 - C) * f * Math.sin(alpha) * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  }
  if (iterLimit === 0) {
    return NaN;  // formula failed to converge
  }
  const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
  const s = b * A * (sigma - deltaSigma);
  const d = s.toFixed(3); // round to 1mm precision
  return d;
};

// Haversine
export const getDistanceByHaversine = (p1, p2) => {
  const R = 6371000;
  const deltaLatitude = rad(p2.lat - p1.lat);
  const deltaLongitude = rad(p2.lon - p1.lon);

  const lat1 = rad(p1.lat);
  const lat2 = rad(p2.lat);

  const a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

export default getDistanceByHaversine;