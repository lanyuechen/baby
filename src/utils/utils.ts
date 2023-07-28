import getDistanceByLonLat from './getDistanceByLonLat';

export const fetchMap = async (rect: any) => {
  const result = await fetch('https://www.overpass-api.de/api/interpreter?', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: `
      [out:json];
      (
        way(${rect[0].lat}, ${rect[0].lon}, ${rect[1].lat}, ${rect[1].lon})["building"];
        >;
      );
      out body;
    `
  });
  return result.json();
}

const parseMap = async (rect: any, osm: any) => {
  const nodeMap: any = {};
  const buildings: any[] = [];
  const dis = getDistanceByLonLat(rect[0], rect[1]) / Math.sqrt(2);
  console.log('=====', dis)
  osm.elements.forEach((d: any) => {
    if (d.type === 'node') {
      nodeMap[d.id] = d;
    } else if (d.type === 'way') {
      buildings.push({
        ...d,
        nodes: parseNodes(rect, d.nodes.map((id: number) => nodeMap[id])),
        level: parseInt(d.tags['building:levels'] || '1') * 3 / dis,
      });
    }
  });

  return buildings;
}

const parseNodes = (rect: any, nodes: any[]) => {
  const w = rect[1].lon - rect[0].lon;
  const h = rect[1].lat - rect[0].lat;
  return nodes.map((d: any) => ({
    ...d,
    x: (d.lon - rect[0].lon) / w,
    y: (d.lat - rect[0].lat) / h,
  }));
}

export const testMap = async () => {
  const rect = [{ lon: 116.3132, lat: 40.0445 }, { lon: 116.3189, lat: 40.0490 }];
  const osm = await fetchMap(rect);
  const data = await parseMap(rect, osm);

  return data;
}

// function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
//   const R = 6371000;
//   const dLat = (lat2-lat1) * (Math.PI/180);
//   const dLon = (lon2-lon1) * (Math.PI/180);
//   const a =
//     Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) *
//     Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   const d = R * c;
//   return d;
// }
