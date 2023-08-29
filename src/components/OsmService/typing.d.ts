export declare namespace Osm {
  type Tags = {
    [key: string]: string;
  }

  type Way = {
    type: 'way';
    id: number;
    nodes: number[];
    tags: Osm.Tags;
  }

  type Node = {
    type: 'node';
    id: number;
    lon: number;
    lat: number;
    tags?: Osm.Tags;
  }

  type Element = Osm.Node | Osm.Way;

  type Data = {
    elements: Element[];
  }
}

export declare namespace Geo {
  type Node = Osm.Node & {
    x: number;
    y: number;
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