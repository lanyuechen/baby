import type { Osm } from './typing';

type MMap = {
  [key: string]: string[] | RegExp;
};

const TAG_MAP: {[key:string]: MMap} = {
  /************************ polygon ************************/
  building: {
    building: /.+/,
  },
  water: {
    natural: ['water'],
  },
  grass: {
    landuse: ['meadow', 'farmland', 'grass'],
    natural: ['fell', 'gress' /* deprecated */, 'grassland', 'wood' /* 树林 */],
    landcover: ['grass'],
  },
  area: {
    leisure: ['pitch', 'golf_course'], // 球场、高尔夫
    amenity: ['parking'], // 停车场
  },
  /************************ line ************************/
  highway: {
    highway: /.+/,
  },
  railway: {
    railway: /.+/,
  },
  fence: {
    barrier: ['fence'],
  },
  /************************ point ************************/
  tree: {
    natural: ['tree'],
  },
}

export const getType = (tags?: Osm.Tags) => {
  if (!tags) {
    return '';
  }
  for (let type in TAG_MAP) {
    const mMap = TAG_MAP[type];
    for (let key in mMap) {
      const values = mMap[key];
      if (tags[key]) {
        if (values instanceof RegExp) {
          if (values.test(tags[key])) {
            return type;
          }
        } else {
          if (values.includes(tags[key])) {
            return type;
          }
        }
      }
    }
  }
  return 'unknown';
}
