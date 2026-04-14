# Project Architecture

This document explains the technical structure, modular organization, and render data flow of the `peoniap5` project.

## 1. General Architectural Approach

The project combines the declarative UI management power of **React** with the imperative drawing capabilities of **p5.js**. The architecture is based on the "High Cohesion, Low Coupling" principle.

### Modular Structure
- **React Layer (`src/App.tsx`, `src/components`):** Manages user interaction, file handling, and overall application state.
- **Orchestration Layer (`src/hooks/useSketch.ts`):** The hub that initializes p5.js, maps React states to the p5 loop, and coordinates events.
- **Rendering Layer (`src/rendering`):** Modules that perform pure drawing operations via the p5.js context.
- **Utility Layer (`src/utils`):** Mathematical and helper tools independent of the p5.js instance.

## 2. Data Flow and Render Loop

The application's rendering process is designed as a multi-stage pipeline:

1.  **3D Calculation:** Flower geometry (stem, petals, etc.) is calculated in 3D space within `flower-painter.ts`.
2.  **Depth Sorting:** All parts to be drawn (`RenderItem`) are sorted by the Z-axis (Z-buffer simulation).
3.  **Buffer Rendering:** Sorted items are drawn to a low-resolution (680x680) `p5.Graphics` buffer, independent of the main canvas.
4.  **Pixel Processing:** `post-processor.ts` reads the raw pixel data from this buffer.
5.  **Final Output:** Read pixels are converted into ASCII, Dots, or Pixel modes and painted onto the main canvas (HTML5 Canvas).

## 3. State Management

Communication between the p5.js draw loop and the React world is maintained through:
- **Props:** `App.tsx` -> `SketchCanvas.tsx` -> `useSketch.ts` (RenderMode, ImageSrc, etc.).
- **Refs:** Methods exposed externally via the `ExtendedP5` interface (`setEffectMode`, `updateCustomImage`).
- **Callbacks:** Signals sent from the p5.js world to React via `onLoadingProgress` and `onReady`.

## 4. Performance Optimizations

- **Offscreen Buffering:** All heavy drawing operations are performed off-canvas.
- **Manual Chunking:** Large libraries like `p5` and `react` are separated from the main bundle into a `vendor` chunk.
- **Lazy Loading:** The `SketchCanvas` component is loaded only when needed (Suspense).
- **Canvas context 2D:** Native Canvas API is used for the ASCII render mode to balance GPU/CPU load.

---

*This architecture ensures the project remains scalable and testable while minimizing the performance constraints of p5.js.*
