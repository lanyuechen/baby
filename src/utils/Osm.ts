export default class Osm {
  constructor() {
    
  }

  static async fetchData(center: any, radius: number) {
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
}
