/**
 * @module post-processor
 * @description Module that reads pixels from p5.Graphics buffer and renders them to the screen in ASCII, Dots, or Pixel modes.
 */

import p5 from 'p5';
import { RenderMode } from '../types';

const BUF_W = 680, BUF_H = 680;

/**
 * Reads data from Graphics buffer and draws it to the main canvas in the specified mode.
 * 
 * @param p - p5 instance
 * @param ctx - HTML5 Canvas 2D Rendering Context (used for ASCII render performance)
 * @param buf - Source Graphics buffer
 * @param grid - Pixel sampling interval (Lower = Higher Resolution)
 * @param mInfX - Mouse interaction X offset
 * @param mInfY - Mouse interaction Y offset
 * @param renderMode - Target render mode
 * @param prevMode - Previous render mode before transition
 * @param modeT - Transition progress between modes (0-1)
 * @param chars - Character set for ASCII mode
 */
export const renderToScreen = (
  p: p5,
  ctx: CanvasRenderingContext2D,
  buf: p5.Graphics,
  grid: number,
  mInfX: number,
  mInfY: number,
  renderMode: RenderMode,
  prevMode: RenderMode,
  modeT: number,
  chars: string[]
) => {

  const px = (buf as any).pixels;
  const g = p.max(4, p.round(grid));
  const asciiG = p.max(g, 6);
  const scaleF = p.min(p.width / BUF_W, p.height / BUF_H) * 0.85;
  const invScale = 1 / scaleF;
  const renderW = BUF_W * scaleF;
  const renderH = BUF_H * scaleF;
  const ox = (p.width - renderW) / 2 + mInfX;
  const oy = (p.height - renderH) / 2 + mInfY;

  const transitionDone = modeT >= 0.99;
  if (renderMode === RenderMode.ASCII || (!transitionDone && prevMode === RenderMode.ASCII)) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  }

  const gEff = (renderMode === RenderMode.ASCII && transitionDone) ? asciiG : g;
  const halfG = gEff * 0.5;
  const yStart = p.max(0, p.floor(oy / gEff) * gEff);
  const yEnd = p.min(p.height, oy + renderH);
  const xStart = p.max(0, p.floor(ox / gEff) * gEff);
  const xEnd = p.min(p.width, ox + renderW);
  const asciiSize = gEff * 1.1;

  let lastFontStr = '';

  for (let sy = yStart; sy < yEnd; sy += gEff) {
    const byBase = p.floor((sy - oy) * invScale);
    if (byBase < 0 || byBase >= BUF_H) continue;
    const rowOff = byBase * BUF_W;

    for (let sx = xStart; sx < xEnd; sx += gEff) {
      const bx = p.floor((sx - ox) * invScale);
      if (bx < 0 || bx >= BUF_W) continue;

      const idx = (rowOff + bx) * 4;
      const r = px[idx];
      const gr = px[idx + 1];
      const b = px[idx + 2];

      if ((r + gr + b) < 12) continue;

      const bright = r * 0.299 + gr * 0.587 + b * 0.114;
      const cx = sx + halfG;
      const cy = sy + halfG;

      let mode: RenderMode;
      if (transitionDone) {
        mode = renderMode;
      } else {
        const hash = ((sx * 73 + sy * 137) & 0xFF) * 0.00392;
        mode = hash < modeT ? renderMode : prevMode;
      }

      if (mode === RenderMode.ASCII) {
        const fontSz = p.floor(asciiSize * (0.4 + bright * 0.004));
        const fontStr = fontSz + 'px Courier New';
        if (fontStr !== lastFontStr) {
          ctx.font = fontStr;
          lastFontStr = fontStr;
        }
        ctx.fillStyle = `rgb(${r},${gr},${b})`;
        const ci = ((bright >> 2) + ((sx * 7 + sy * 13) >> 3)) % chars.length;
        ctx.fillText(chars[ci], cx, cy);
      } else if (mode === RenderMode.DOTS) {
        p.fill(r, gr, b);
        const d = gEff * (0.1 + bright * 0.0033);
        p.ellipse(cx, cy, d, d);
      } else {
        p.fill(r, gr, b);
        p.rectMode(p.CENTER);
        p.rect(cx, cy, gEff * 0.93, gEff * 0.93);
      }
    }
  }
};
