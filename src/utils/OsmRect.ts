import getDistanceByLonLat from './getDistanceByLonLat';

export default class Osm {
  constructor() {

  }

  async fetchDataPixel() {
    const rect = [{ lon: 116.3132, lat: 40.0445 }, { lon: 116.3189, lat: 40.0490 }];
    const osm = await this.fetchMap(rect);
    const data = await this.parseMap(rect, osm);

    return data;
  }

  async fetchMap(rect: any) {
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

  async parseMap(rect: any, osm: any) {
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
          nodes: this.parseNodes(rect, d.nodes.map((id: number) => nodeMap[id])),
          level: parseInt(d.tags['building:levels'] || '1') * 3 / dis,
        });
      }
    });
  
    return buildings;
  }
  
  parseNodes(rect: any, nodes: any[]) {
    const w = rect[1].lon - rect[0].lon;
    const h = rect[1].lat - rect[0].lat;
    return nodes.map((d: any) => ({
      ...d,
      x: (d.lon - rect[0].lon) / w,
      y: (d.lat - rect[0].lat) / h,
    }));
  }
}




