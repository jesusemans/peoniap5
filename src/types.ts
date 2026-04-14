/**
 * @module types
 * @description Type definitions, interfaces, and enums used across the project.
 */

import p5 from 'p5';

/** Flower types */
export type FlowerType = 'peony' | 'rose' | 'dahlia';


/**
 * Enum indicating the rendering modes.
 */
export enum RenderMode {
  ASCII = 0,
  DOTS = 1,
  PIXEL = 2,
  ALL = 3, // Auto-cycle mode
}

/**
 * Custom methods added externally to the p5.js Sketch instance.
 */
export interface ExtendedP5 extends p5 {
  updateCustomImage: (url: string | null) => void;
  setEffectMode: (mode: RenderMode) => void;
  startExperience: () => void;
}

/**
 * Data structure defining flower types and their appearance.
 */
export interface FlowerElement {
  type: FlowerType;
  c1: [number, number, number];      // Primary color
  c2: [number, number, number];      // Accent color
  c3: [number, number, number];      // Center color
  stemC: [number, number, number];   // Stem color
  layers: number;                    // Number of petal layers
  petalsPerLayer: number;            // Number of petals per layer
  maxRadius: number;                 // Maximum flower width
  ruffleAmt: number;                 // Petal ruffle intensity
  sepals?: number;                   // Number of sepals
}

/**
 * Definition of a glitch slice during the glitch effect.
 */
export interface GlitchSlice {
  y: number;
  h: number;
  fx: number;
  fw: number;
  offset: number;
  colorShift: boolean;
  duration: number;
}

/**
 * Drawing items waiting in the render queue.
 * Used for Depth Sorting (Z-buffer).
 */
export interface RenderItem {
  rz: number;                         // Z-depth
  tp: 'p' | 's' | 'c';                // Type (Petal, Sepal, Center)
  sx: number;                         // Coordinate X
  sy: number;                         // Coordinate Y
  sa: number;                         // Angle
  pl?: number;                        // Length (for Petal)
  pw?: number;                        // Width (for Petal)
  rPhase?: number;                    // Ruffle phase
  rAmt?: number;                      // Ruffle intensity
  r?: number;                         // Color R
  gr?: number;                        // Color G
  b?: number;                         // Color B
  sLen?: number;                      // Sepal length
  sW?: number;                        // Sepal width
  sAlpha?: number;                    // Sepal transparency
  sc?: [number, number, number];      // Stem color
  alpha?: number;                     // General transparency
}
