export declare namespace Osm {
  type Tags = {
    [key: string]: string;
  }

  type Node = {
    type: 'node';
    id: number;
    lon: number;
    lat: number;
    tags?: Osm.Tags;
  }

  type Way = {
    type: 'way';
    id: number;
    nodes: number[];
    tags: Osm.Tags;
  }

  type Relation = {
    type: 'relation';
    id: number;
    nodes: number[];
    tags: Osm.Tags;
  }

  type Element = Osm.Relation | Osm.Way | Osm.Node;

  type Data = {
    elements: Element[];
  }
}

export declare namespace Geo {
  type Node = {
    id: number;
    type: string;
    lon: number;
    lat: number;
    x: number;
    y: number;
    tags?: Osm.Tags;
  }

  type Way = {
    id: number;
    type: string;
    nodes: NodeData[];
    height: number;
    minHeight: number;
    origin: Osm.Way;  // 存储原始数据，测试用
  }

  type Building = Geo.Way & {
    type: 'building';
    color: string;
    roofColor: string;
    material?: string;
    roofMaterial?: string;
  }
}