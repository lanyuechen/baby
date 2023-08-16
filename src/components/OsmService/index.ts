import Coord, { PointLla } from '@/components/Coord';
import { getPolygonDirection } from '@/utils/utils';
import OverpassApi from './OverpassApi';
import type { OsmData, OsmWayElement, GeoData, BuildingData, NodeData, HighwayData, WaterData } from './typing';

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
          features.push(OsmService.parseHightwayData(d, nodes));
        } else if (OsmService.isWater(d)) {
          features.push(OsmService.parseWaterData(d, nodes));
        } else {
          
        }
      }
    });
  
    return features;
  }

  static isBuilding(data: OsmWayElement) {
    return !!data.tags['building'];
  }

  static isHighway(data: OsmWayElement) {
    return !!data.tags['highway'];
  }

  static isWater(data: OsmWayElement) {
    return data.tags['natural'] === 'water';
  }

  static parseBuildingData(data: OsmWayElement, nodes: NodeData[]): BuildingData {
    return {
      origin: data,
  
      id: data.id,
      type: 'building',
      height: parseInt(data.tags.height) || (parseInt(data.tags?.['building:levels']??0) * LEVEL_HEIGHT) || 1,
      minHeight: parseInt(data.tags.min_height) || (parseInt(data.tags?.['building:min_level']??0) * LEVEL_HEIGHT),
      color: data.tags['building:colour'] || '#ffffff',
      nodes,
    }
  }

  static parseHightwayData(data: OsmWayElement, nodes: NodeData[]): HighwayData {
    return {
      origin: data,
  
      id: data.id,
      type: 'highway',
      nodes,
    }
  }

  static parseWaterData(data: OsmWayElement, nodes: NodeData[]): WaterData {
    return {
      origin: data,
  
      id: data.id,
      type: 'water',
      nodes,
    }
  }
}