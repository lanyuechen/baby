import Coord from './Coord';

export default class Osm {
  constructor() {

  }

  async fetchDataPixel(center: any, radius: number) {
    // const center = { lon: 116.3160, lat: 40.0468 };
    // const radius = 500;
    
    const osm = await this.fetchData(center, radius);
    const data = await this.osmToPixel(center, radius, osm);
  
    return data;
  }

  async fetchData(center: any, radius: number) {
    const result = await fetch('https://www.overpass-api.de/api/interpreter?', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: `
        [out:json];
        (
          way(around:${radius},${center.lat},${center.lon})["building"];
          >;
        );
        out body;
      `
    });
    return result.json();
  }

  async osmToPixel(center: any, radius: number, osm: any) {
    const nodeMap: any = {};
    const buildings: any[] = [];
    const coord = new Coord(center);

    osm.elements.forEach((d: any) => {
      if (d.type === 'node') {
        const nv = coord.toEnu(d.lon, d.lat);

        nodeMap[d.id] = {
          ...d,
          x: nv.e / radius,
          y: nv.n / radius,
        };
      } else if (d.type === 'way') {
        buildings.push({
          ...d,
          nodes: d.nodes.map((id: number) => nodeMap[id]),
          level: parseInt(d.tags['building:levels'] || '1') * 3 / radius,
        });
      }
    });
  
    return buildings;
  }
}
