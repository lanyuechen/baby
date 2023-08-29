
const R = 6378137;

const mercator = (lon: number, lat: number) => {
  const lonRad = lon * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  const x = lonRad * R;
  const y = Math.log((1 + Math.sin(latRad)) / (1 - Math.sin(latRad))) * R / 2;

  return [x, y];
}