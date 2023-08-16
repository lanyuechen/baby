export type OsmTags = {
  [key: string]: string;
}

export type OsmWayElement = {
  type: 'way';
  id: number;
  nodes: number[];
  tags: OsmTags;
}

export type OsmNodeElement = {
  type: 'node';
  id: number;
  lon: number;
  lat: number;
  tags?: OsmTags;
}

export type OsmElement = OsmNodeElement | OsmWayElement;

export type OsmData = {
  elements: OsmElement[];
}

export type NodeData = OsmNodeElement & {
  x: number;
  y: number;
}

export type BuildingData = {
  id: number;
  type: 'building';
  nodes: NodeData[];
  height: number;
  minHeight: number;
  color: string;
  roofColor: string;
  material?: string;
  roofMaterial?: string;
  origin: OsmWayElement;  // 存储原始数据，测试用
}

export type HighwayData = {
  id: number;
  type: 'highway';
  nodes: NodeData[];
  origin: OsmWayElement;  // 存储原始数据，测试用
}

export type WaterData = {
  id: number;
  type: 'water';
  nodes: NodeData[];
  origin: OsmWayElement;  // 存储原始数据，测试用
}

export type GeoData = BuildingData | HighwayData | WaterData;