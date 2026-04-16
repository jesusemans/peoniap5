/**
 * @module useSketch
 * @description Main orchestration center for the p5.js sketch. Coordinates growth, interaction, wilting, and UI synchronization.
 */

import { useRef, useCallback, useEffect } from 'react';
import p5 from 'p5';
import { ExtendedP5, FlowerElement, GlitchSlice, RenderMode } from '../types';
import { easeInOutCubic } from '../utils/p5-math';
import { drawFlowerToBuffer } from '../rendering/flower-painter';
import { renderToScreen } from '../rendering/post-processor';

/**
 * React Hook that initializes and manages the p5.js sketch.
 * 
 * @param containerRef - Reference to the DOM element where canvas will be attached
 * @param onLoadingProgress - Callback that reports loading progress percentage
 * @param onReady - Callback triggered when the sketch is warmed up and ready
 * @returns Object containing sketch control methods
 */
export const useSketch = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  onLoadingProgress: (pct: number) => void,
  onReady: () => void
) => {

  const p5InstanceRef = useRef<ExtendedP5 | null>(null);

  const initSketch = useCallback(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const ep = p as ExtendedP5;
      const BUF_W = 680, BUF_H = 680;
      let buf: p5.Graphics;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'.split('');
      let ctx: CanvasRenderingContext2D;

      let customImg: p5.Image | null = null;
      let isManualMode = false;
      let currentImageUrl = "";

      let elements: FlowerElement[] = [];
      let curEl = 0;

      let phase: 'growing' | 'interactive' | 'wilting' | 'waiting' = 'growing';
      let phaseT = 0;

      let bloom = 0, bloomTarget = 1;
      let renderMode: RenderMode = RenderMode.ASCII;
      let prevMode: RenderMode = RenderMode.ASCII;
      let modeT = 1;

      let grid = 4, gridTarget = 4;
      const GRID_MIN = 4, GRID_MAX = 20;
      let densDir = 1, densTimer = 0;

      let mInfX = 0, mInfY = 0;
      let t = 0;

      let rotX = 0, rotY = 0, rotZ = 0;
      let autoRotX = 0, autoRotY = 0, autoRotZ = 0;
      let mouseRotX = 0, mouseRotY = 0;
      let targetMouseRotX = 0, targetMouseRotY = 0;
      let rotEaseIn = 0;

      let loadingPhase = true;
      let warmFrames = 0;
      const WARM_TARGET = 60;

      let glitchTimer = 0;
      let glitchActive = false;
      let glitchIntensity = 0;
      let glitchSlices: GlitchSlice[] = [];

      let wilt = 0;

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.pixelDensity(p.displayDensity() || 1);
        p.textFont('Courier New, monospace');
        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();

        buf = p.createGraphics(BUF_W, BUF_H);
        buf.pixelDensity(1);
        buf.noSmooth();
        
        // Fix: Enable frequent readback optimization for Canvas2D
        const bufCtx = (buf as any).elt.getContext('2d', { willReadFrequently: true });
        if (bufCtx) {
          // p5.js might have its own context, but setting it on 'elt' (the canvas) 
          // before heavy readback (loadPixels) helps the browser optimize.
        }

        ctx = (p.drawingContext as CanvasRenderingContext2D);

        elements = [
          { type: 'peony', c1: [230, 130, 170], c2: [255, 210, 235], c3: [170, 60, 100], stemC: [55, 85, 40], layers: 14, petalsPerLayer: 9, maxRadius: 155, ruffleAmt: 12, sepals: 5 },
          { type: 'peony', c1: [240, 170, 190], c2: [255, 230, 240], c3: [190, 90, 130], stemC: [55, 88, 42], layers: 15, petalsPerLayer: 10, maxRadius: 150, ruffleAmt: 14, sepals: 6 },
          { type: 'peony', c1: [200, 100, 180], c2: [245, 185, 225], c3: [150, 45, 110], stemC: [50, 80, 38], layers: 13, petalsPerLayer: 9, maxRadius: 158, ruffleAmt: 13, sepals: 5 },
        ];
        startElement(0);
      };

      const startElement = (idx: number) => {
        curEl = idx; bloom = 0; bloomTarget = 1; wilt = 0; 
        phase = 'growing'; phaseT = 0; 
        grid = GRID_MIN; gridTarget = GRID_MIN;
        densDir = 1; densTimer = 0; modeT = 1;
      };

      ep.updateCustomImage = (url: string | null) => {
        currentImageUrl = url || "";
        if (!url) { customImg = null; return; }
        p.loadImage(url, (img) => { if (url === currentImageUrl) { customImg = img; loadingPhase = false; } });
      };

      ep.setEffectMode = (mode: RenderMode) => {
        if (mode === RenderMode.ALL) isManualMode = false;
        else { isManualMode = true; renderMode = mode; modeT = 1; }
      };

      ep.startExperience = () => { loadingPhase = false; };

      p.draw = () => {
        const dt = p.deltaTime / 1000;
        const f = elements[curEl];

        if (loadingPhase && !customImg) {
          p.background(0);
          bloom = p.min(0.5, warmFrames / WARM_TARGET * 0.5);
          drawFlowerToBuffer(p, buf, f, bloom, 0, 0, 0, 0);
          warmFrames++;
          onLoadingProgress(p.min(100, p.floor(warmFrames / WARM_TARGET * 100)));
          if (warmFrames >= WARM_TARGET) onReady();
          return;
        }

        p.background(0);
        t += 0.016;

        rotEaseIn = p.min(1, rotEaseIn + dt * 0.08);
        const re = easeInOutCubic(rotEaseIn);
        autoRotY += dt * 0.3 * re;
        autoRotX += dt * 0.12 * p.sin(t * 0.15) * re;
        autoRotZ += dt * 0.08 * p.sin(t * 0.09 + 1.5) * re;
        targetMouseRotX = (p.mouseY - p.height / 2) / p.height * 1.2;
        targetMouseRotY = (p.mouseX - p.width / 2) / p.width * 1.8;
        mouseRotX += (targetMouseRotX - mouseRotX) * 0.04;
        mouseRotY += (targetMouseRotY - mouseRotY) * 0.04;
        rotX = autoRotX + mouseRotX * re;
        rotY = autoRotY + mouseRotY * re;
        rotZ = autoRotZ;

        if (phase === 'growing') {
          bloom += (bloomTarget - bloom) * 0.006; phaseT += dt;
          if (bloom > 0.98) { bloom = 1; phase = 'interactive'; phaseT = 0; }
        }

        densTimer += dt;
        if (densTimer > 0.8) {
          densTimer = 0; triggerGlitch();
          if (!isManualMode) { prevMode = renderMode; renderMode = ((renderMode + 1) % 3) as RenderMode; modeT = 0; }
          if (densDir === 1) { gridTarget = GRID_MAX; densDir = -1; }
          else { gridTarget = GRID_MIN; densDir = 1; }
        }

        if (phase === 'interactive') {
          phaseT += dt;
          if (phaseT > 25) { phase = 'wilting'; phaseT = 0; triggerGlitch(); }
          mInfX += ((p.mouseX - p.width / 2) * 0.08 - mInfX) * 0.04;
          mInfY += ((p.mouseY - p.height / 2) * 0.08 - mInfY) * 0.04;
        } else {
          mInfX *= 0.95; mInfY *= 0.95;
          if (phase === 'wilting') {
            wilt = p.min(1, wilt + dt * 0.04); phaseT += dt;
            if (wilt > 0.95) { phase = 'waiting'; phaseT = 0; }
          } else if (phase === 'waiting') {
            phaseT += dt;
            if (phaseT > 0.6) {
              if (!isManualMode) { prevMode = renderMode; renderMode = ((renderMode + 1) % 3) as RenderMode; modeT = 0; }
              triggerGlitch(); startElement((curEl + 1) % elements.length);
            }
          }
        }

        grid += (gridTarget - grid) * 0.08;
        modeT = p.min(1, modeT + dt * 4.0);

        updateGlitch(dt);

        if (customImg && customImg.width > 0) {
          const s = p.max(680 / customImg.width, 680 / customImg.height);
          buf.background(0);
          buf.image(customImg, (680 - customImg.width * s) / 2, (680 - customImg.height * s) / 2, customImg.width * s, customImg.height * s);
          buf.loadPixels();
        } else {
          drawFlowerToBuffer(p, buf, f, bloom, wilt, rotX, rotY, rotZ);
        }

        glitchTimer -= dt;
        if (glitchTimer <= 0 && !glitchActive) {
          glitchTimer = p.random(3, 7);
          if (p.random() < 0.4) triggerGlitch();
        }

        renderToScreen(p, ctx, buf, grid, mInfX, mInfY, renderMode, prevMode, modeT, chars);
        drawGlitchOverlay();
      };

      const triggerGlitch = () => {
        glitchActive = true; glitchIntensity = p.random(0.4, 1.0); glitchSlices = [];
        const scaleF = p.min(p.width / BUF_W, p.height / BUF_H) * 0.85;
        const rW = BUF_W * scaleF, rH = BUF_H * scaleF;
        const fOx = (p.width - rW) / 2 + mInfX, fOy = (p.height - rH) / 2 + mInfY;
        const numSlices = p.floor(p.random(3, 10));
        for (let i = 0; i < numSlices; i++) {
          const sy = p.random(fOy, fOy + rH);
          const sh = p.min(p.random(2, rH * 0.08), fOy + rH - sy);
          glitchSlices.push({ y: sy, h: sh, fx: fOx, fw: rW, offset: p.random(-80, 80) * glitchIntensity, colorShift: p.random() < 0.4, duration: p.random(0.08, 0.3) });
        }
      };

      const updateGlitch = (dt: number) => {
        if (!glitchActive) return;
        let allDone = true;
        for (const s of glitchSlices) { s.duration -= dt; if (s.duration > 0) allDone = false; else s.offset *= 0.7; }
        if (allDone) { glitchActive = false; glitchSlices = []; }
      };

      const drawGlitchOverlay = () => {
        if (!glitchActive || glitchSlices.length === 0) return;
        for (const s of glitchSlices) {
          if (p.abs(s.offset) < 0.5) continue;
          const sx = p.floor(s.fx), sy = p.floor(s.y), sw = p.floor(s.fw), sh = p.floor(s.h);
          if (sw < 1 || sh < 1) continue;
          if (s.colorShift) {
            ctx.save(); ctx.globalAlpha = 0.7; ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(ctx.canvas, sx, sy, sw, sh, sx + s.offset * 1.5, sy, sw, sh);
            ctx.globalAlpha = 0.45; ctx.drawImage(ctx.canvas, sx, sy, sw, sh, sx - s.offset, sy, sw, sh);
            ctx.restore();
          } else {
            ctx.drawImage(ctx.canvas, sx, sy, sw, sh, sx + s.offset, sy, sw, sh);
          }
        }
      };

      p.mousePressed = () => { if (loadingPhase) return; triggerGlitch(); };
      p.keyPressed = () => {
        if (p.key === 'f' || p.key === 'F') p.fullscreen(!p.fullscreen());
        if (p.key === 'g' || p.key === 'G') triggerGlitch();
      };
      p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    const p5Instance = new p5(sketch, containerRef.current) as ExtendedP5;
    p5InstanceRef.current = p5Instance;
    return () => p5Instance.remove();
  }, [containerRef, onLoadingProgress, onReady]);

  useEffect(() => initSketch(), [initSketch]);

  return {
    startExperience: useCallback(() => p5InstanceRef.current?.startExperience(), []),
    updateCustomImage: useCallback((url: string | null) => p5InstanceRef.current?.updateCustomImage(url), []),
    setEffectMode: useCallback((mode: RenderMode) => p5InstanceRef.current?.setEffectMode(mode), []),
  };
};
