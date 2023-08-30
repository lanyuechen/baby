import Coord, { PointLla } from '@/components/Coord';
import { getPolygonDirection } from '@/utils/utils';
import OverpassApi from './OverpassApi';
import { getType } from './tagMap';
import type { Geo, Osm } from './typing';

const LEVEL_HEIGHT = 3;

export type * from './typing';

export default class OsmService {
  constructor() {
    
  }

  static async fetchData(center: PointLla, radius: number) {
    const osmData = await OverpassApi.fetchData(center, radius);
    const data = OsmService.parseData(center, radius, osmData);
  
    return data;
  }

  static parseData(center: PointLla, radius: number, osmData: Osm.Data) {
    const nodeMap: {[id: number]: Geo.Node} = {};
    const features: (Geo.Way | Geo.Node)[] = [];
    const coord = new Coord(center);

    // 因为默认osm数据node在前，所以可以在一个循环内处理
    osmData.elements.forEach((d) => {
      const type = getType(d.tags);

      if (d.type === 'node') {
        // 经纬度转换为本地坐标
        const enu = coord.toEnu(d.lon, d.lat);

        nodeMap[d.id] = {
          ...d,
          type,
          x: enu.e + radius / Math.sqrt(2),
          y: enu.n + radius / Math.sqrt(2),
        };
        if (type === 'tree') {
          features.push(nodeMap[d.id]);
        }
      } else if (d.type === 'way') {
        const nodes = d.nodes.map((id: number) => nodeMap[id]);
        if (!getPolygonDirection(nodes)) {  // 判断多边形方向，如果相反，则进行反转
          nodes.reverse();
        }

        if (type === 'building') {
          features.push(OsmService.parseBuildingData(d, nodes));
        } else if (type === 'unknown') {
          features.push(OsmService.parseWayData(d, nodes, 'unknown'));
        } else if (type) {
          features.push(OsmService.parseWayData(d, nodes, type));
        }
      } else if (d.type === 'relation') {
        console.log('====relation', d)
        Object.assign(window, { relation: d })
      }
    });
  
    return features;
  }

  static parseBuildingData(data: Osm.Way, nodes: Geo.Node[]): Geo.Building {
    return {
      origin: data,
  
      id: data.id,
      type: 'building',
      nodes,
      height: parseInt(data.tags['height']) || (parseInt(data.tags['building:levels']??1) * LEVEL_HEIGHT),
      minHeight: parseInt(data.tags['min_height']) || (parseInt(data.tags['building:min_level']??0) * LEVEL_HEIGHT),
      color: data.tags['building:colour'] || '#ffffff',
      roofColor: data.tags['roof:colour'] || '#ffffff',
      material: data.tags['building:material'] || data.tags['material'],
      roofMaterial: data.tags['roof:material'],
    }
  }

  static parseWayData(data: Osm.Way, nodes: Geo.Node[], type: string): Geo.Way {
    const height = parseInt(data.tags['layer']||'0') * 10;
    return {
      origin: data,
  
      id: data.id,
      type,
      height,
      minHeight: height,
      nodes,
    }
  }

  // static parseNodeData(data: OsmNodeElement, type: string): NodeData {
  //   return {
      
  //   }
  // }
}