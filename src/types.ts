export type FlowerType = 'peony' | 'rose' | 'dahlia';

export interface FlowerElement {
  type: FlowerType;
  c1: [number, number, number];
  c2: [number, number, number];
  c3: [number, number, number];
  stemC: [number, number, number];
  layers: number;
  petalsPerLayer: number;
  maxRadius: number;
  ruffleAmt: number;
  sepals?: number;
}

export interface GlitchSlice {
  y: number;
  h: number;
  fx: number;
  fw: number;
  offset: number;
  colorShift: boolean;
  duration: number;
}

export type RenderMode = 0 | 1 | 2; // 0: ASCII, 1: DOTS, 2: PIXEL

export interface RenderItem {
  rz: number;
  tp: 'p' | 's' | 'c'; // petal, sepal, center
  sx: number;
  sy: number;
  sa: number;
  pl?: number;
  pw?: number;
  rPhase?: number;
  rAmt?: number;
  r?: number;
  gr?: number;
  b?: number;
  cup?: number;
  sLen?: number;
  sW?: number;
  sAlpha?: number;
  sc?: [number, number, number];
  alpha?: number;
}
