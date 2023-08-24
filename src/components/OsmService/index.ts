import Coord, { PointLla } from '@/components/Coord';
import { getPolygonDirection } from '@/utils/utils';
import OverpassApi from './OverpassApi';
import type { OsmData, OsmWayElement, GeoData, BuildingData, NodeData, WayData, WayType } from './typing';

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

  static parseData(center: PointLla, radius: number, osmData: OsmData) {
    const nodeMap: {[id: number]: NodeData} = {};
    const features: GeoData[] = [];
    const coord = new Coord(center);

    // 因为默认osm数据node在前，所以可以在一个循环内处理
    osmData.elements.forEach((d) => {
      if (d.type === 'node') {
        // 经纬度转换为本地坐标
        const enu = coord.toEnu(d.lon, d.lat);

        nodeMap[d.id] = {
          ...d,
          x: enu.e + radius / Math.sqrt(2),
          y: enu.n + radius / Math.sqrt(2),
        };
      } else if (d.type === 'way') {
        const nodes = d.nodes.map((id: number) => nodeMap[id]);
        if (!getPolygonDirection(nodes)) {  // 判断多边形方向，如果相反，则进行反转
          nodes.reverse();
        }

        if (OsmService.isBuilding(d)) {
          features.push(OsmService.parseBuildingData(d, nodes));
        } else if (OsmService.isHighway(d)) {
          features.push(OsmService.parseWayData(d, nodes, 'highway'));
        } else if (OsmService.isWater(d)) {
          features.push(OsmService.parseWayData(d, nodes, 'water'));
        } else if (OsmService.isGrass(d)) {
          features.push(OsmService.parseWayData(d, nodes, 'grass'));
        } else if (OsmService.isFence(d)) {
          features.push(OsmService.parseWayData(d, nodes, 'fence'));
        } else if (OsmService.isWay(d)) {
          features.push(OsmService.parseWayData(d, nodes));
        }
      }
    });
  
    return features;
  }

  static isBuilding(data: OsmWayElement) {
    return data.type === 'way' && !!data.tags?.['building'];
  }

  static isHighway(data: OsmWayElement) {
    return data.type === 'way' && !!data.tags?.['highway'];
  }

  static isWater(data: OsmWayElement) {
    return data.type === 'way' && data.tags?.['natural'] === 'water';
  }

  static isGrass(data: OsmWayElement) {
    return data.type === 'way' && (
      ['meadow', 'farmland', 'grass'].includes(data.tags?.['landuse']) ||
      ['fell', 'gress' /* deprecated */, 'grassland'].includes(data.tags?.['natural']) ||
      ['grass'].includes(data.tags?.['landcover'])
    );
  }

  static isFence(data: OsmWayElement) {
    return data.type === 'way' && data.tags?.['barrier'] === 'fence';
  }

  static isWay(data: OsmWayElement) {
    return data.type === 'way';
  }

  static parseBuildingData(data: OsmWayElement, nodes: NodeData[]): BuildingData {
    return {
      origin: data,
  
      id: data.id,
      type: 'building',
      nodes,
      height: parseInt(data.tags['height']) || (parseInt(data.tags?.['building:levels']??1) * LEVEL_HEIGHT),
      minHeight: parseInt(data.tags['min_height']) || (parseInt(data.tags?.['building:min_level']??0) * LEVEL_HEIGHT),
      color: data.tags['building:colour'] || '#ffffff',
      roofColor: data.tags['roof:colour'] || '#ffffff',
      material: data.tags['building:material'] || data.tags['material'],
      roofMaterial: data.tags['roof:material'],
    }
  }

  static parseWayData(data: OsmWayElement, nodes: NodeData[], type: WayType = 'way'): WayData {
    return {
      origin: data,
  
      id: data.id,
      type,
      nodes,
    }
  }
}