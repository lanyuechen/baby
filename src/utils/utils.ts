export const degToRad = (deg: number) => {
  return deg * Math.PI / 180;
}

export const radToDeg = (rad: number) => {
  return rad * 180 / Math.PI;
}

export const getPolygonDirection = (points: any[]) => {
  let idx = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x > points[idx].x) {
      idx = i;
    }
  }
  const a = points[(idx - 1 + points.length) % points.length];
  const b = points[idx];
  const c = points[(idx + 1) % points.length];
  const ab = [b.x - a.x, b.y - a.y];
  const bc = [c.x - b.x, c.y - b.y];
  return ab[0] * bc[1] - bc[0] * ab[1] > 0; // 大于0正向，逆时针反向
}

export const getPerimeter = (nodes: any[], close: boolean = true) => {
  let res = 0;
  for (let i = 1; i < nodes.length; i++) {
    res += Math.sqrt((nodes[i].x - nodes[i - 1].x) ** 2 + (nodes[i].y - nodes[i - 1].y) ** 2);
  }
  if (close) {
    res += Math.sqrt((nodes[0].x - nodes[nodes.length - 1].x) ** 2 + (nodes[0].y - nodes[nodes.length - 1].y) ** 2);
  }
  return res;
}