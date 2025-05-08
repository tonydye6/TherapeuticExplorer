declare module 'litegraph.js' {
  export const VERSION: number;
  export const CANVAS_GRID_SIZE: number;
  export const NODE_TITLE_HEIGHT: number;
  export const NODE_TITLE_COLOR: string;
  export const NODE_DEFAULT_COLOR: string;
  export const NODE_DEFAULT_BGCOLOR: string;
  export const NODE_DEFAULT_BOXCOLOR: string;
  export const NODE_DEFAULT_SHAPE: string;
  export const DEFAULT_SHADOW_COLOR: string;
  export const CONNECTING_LINK_COLOR: string;
  export const DEFAULT_CONNECTION_COLOR: {
    input_off: string;
    input_on: string;
    output_off: string;
    output_on: string;
  };

  export class LGraph {
    constructor();
    start(): void;
    stop(): void;
    add(node: LGraphNode): void;
    remove(node: LGraphNode): void;
    clear(): void;
    serialize(): object;
    configure(data: object): void;
    onNodeAdded: (node: LGraphNode) => void;
    onNodeRemoved: (node: LGraphNode) => void;
    onNodeSelected: (node: LGraphNode) => void;
    onConnectionChange: (node: LGraphNode, inputIndex: number, outputIndex: number, linkInfo: any, connected: boolean) => void;
  }

  export class LGraphNode {
    id: string;
    title: string;
    inputs: any[];
    outputs: any[];
    size: [number, number];
    properties: Record<string, any>;
    constructor(title?: string);
    addInput(name: string, type: string): void;
    addOutput(name: string, type: string): void;
    configure(obj: object): void;
    serialize(): object;
  }

  export class LGraphCanvas {
    constructor(canvas: HTMLCanvasElement, graph: LGraph);
    resize(width: number, height: number): void;
    draw(force_canvas?: boolean, force_graph?: boolean): void;
    setZoom(value: number, center?: [number, number]): void;
    convertOffsetToCanvas(pos: [number, number]): [number, number];
    convertCanvasToOffset(pos: [number, number]): [number, number];
  }
}