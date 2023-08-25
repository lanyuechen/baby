import type { OsmTags } from './typing';

type MMap = {
  [key: string]: string[] | RegExp;
};

const TAG_MAP: {[key:string]: MMap} = {
  building: {
    building: /.+/,
  },
  highway: {
    highway: /.+/,
  },
  water: {
    natural: ['water'],
  },
  grass: {
    landuse: ['meadow', 'farmland', 'grass'],
    natural: ['fell', 'gress' /* deprecated */, 'grassland', 'wood' /* 树林 */],
    landcover: ['grass'],
  },
  fence: {
    barrier: ['fence'],
  },
  area: {
    leisure: ['pitch'], // 球场
    amenity: ['parking'], // 停车场
  }
}

export const getType = (tags: OsmTags) => {
  if (tags) {
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
  }
}
