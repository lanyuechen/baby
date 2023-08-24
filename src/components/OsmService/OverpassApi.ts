import * as BABYLON from '@babylonjs/core';

// 公路标签分类：https://wiki.openstreetmap.org/wiki/Zh-hans:Key:highway

export default class Osm {
  constructor() {
    
  }

  static async fetchApi(spec: string) {
    const result = await fetch('https://www.overpass-api.de/api/interpreter?', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: spec,
    });
    return result.json();
  }

  static fetchData(center: any, radius: number) {
    return this.fetchApi(`
      [out:json];
      (
        way(around:${radius},${center.lat},${center.lon});>;
      );
      out body;
    `);
  }

  static fetchWaterData(center: any, radius: number) {
    return this.fetchApi(`
      [out:json];
      (
        way(around:${radius},${center.lat},${center.lon})["natural"="water"];>;
      );
      out body;
    `);
  }

  static fetchHighwayData(center: any, radius: number) {
    return this.fetchApi(`
      [out:json];
      (
        way(around:${radius},${center.lat},${center.lon})["highway"];>;
      );
      out body;
    `);
  }

  static fetchBuildingData(center: any, radius: number) {
    return this.fetchApi(`
      [out:json];
      (
        way(around:${radius},${center.lat},${center.lon})["building"];>;
      );
      out body;
    `);
  }
}
