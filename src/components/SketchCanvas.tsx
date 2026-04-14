import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { FlowerElement, GlitchSlice, RenderItem, RenderMode } from '../types';

interface SketchCanvasProps {
  imageSrc: string | null;
  effectMode: RenderMode;
  onReady: (ready: boolean) => void;
  hasStarted: boolean;
}

const SketchCanvas: React.FC<SketchCanvasProps> = ({ imageSrc, effectMode, onReady, hasStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderBarRef = useRef<HTMLDivElement>(null);
  const loaderPctRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  
  // Phase 3: Synchronized Loading
  const loadingTimerFinished = useRef(false);
  const p5LoadingFinished = useRef(false);
  const isUnmounted = useRef(false);

  useEffect(() => {
    isUnmounted.current = false;
    if (!containerRef.current) return;

    // Start 2.5s minimum loading timer
    setTimeout(() => {
      loadingTimerFinished.current = true;
      checkLoadingState();
    }, 2500);

    const checkLoadingState = () => {
      if (loadingTimerFinished.current && p5LoadingFinished.current && !isUnmounted.current) {
        onReady(true);
      }
    };

    const sketch = (p: p5) => {
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

      let bloom = 0;
      let bloomTarget = 1;
      let lastBloom = -1;

      let renderMode: RenderMode = 0, prevMode: RenderMode = 0, modeT = 1;

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let lastWilt = -1;

      const easeInOutCubic = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - p.pow(-2 * x + 2, 3) / 2;
      const easeOutQuart = (x: number) => 1 - p.pow(1 - x, 4);

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.pixelDensity(1);
        p.textFont('Courier New, monospace');
        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();

        buf = p.createGraphics(BUF_W, BUF_H);
        buf.pixelDensity(1);
        buf.noSmooth();
        
        // Performance Fix: willReadFrequently
        ((buf as any).canvas.getContext('2d', { willReadFrequently: true }));

        ctx = (p.drawingContext as CanvasRenderingContext2D);

        elements = [
          {
            type: 'peony', c1: [230, 130, 170], c2: [255, 210, 235], c3: [170, 60, 100],
            stemC: [55, 85, 40], layers: 14, petalsPerLayer: 9, maxRadius: 155,
            ruffleAmt: 12, sepals: 5
          },
          {
            type: 'peony', c1: [240, 170, 190], c2: [255, 230, 240], c3: [190, 90, 130],
            stemC: [55, 88, 42], layers: 15, petalsPerLayer: 10, maxRadius: 150,
            ruffleAmt: 14, sepals: 6
          },
          {
            type: 'peony', c1: [200, 100, 180], c2: [245, 185, 225], c3: [150, 45, 110],
            stemC: [50, 80, 38], layers: 13, petalsPerLayer: 9, maxRadius: 158,
            ruffleAmt: 13, sepals: 5
          },
        ];

        startElement(0);
      };

      const startElement = (idx: number) => {
        curEl = idx;
        bloom = 0;
        bloomTarget = 1;
        lastBloom = -1;
        lastWilt = -1;
        wilt = 0;
        phase = 'growing';
        phaseT = 0;
        grid = GRID_MIN;
        gridTarget = GRID_MIN;
        densDir = 1;
        densTimer = 0;
        modeT = 1;
      };

      (p as any).updateCustomImage = (url: string | null) => {
        currentImageUrl = url || "";
        if (!url) {
          customImg = null;
          return;
        }
        p.loadImage(url, (img) => {
          if (url === currentImageUrl) {
            customImg = img;
            loadingPhase = false;
          }
        });
      };

      (p as any).setEffectMode = (mode: RenderMode) => {
        isManualMode = true;
        renderMode = mode;
        modeT = 1;
      };

      (p as any).startExperience = () => {
        loadingPhase = false;
      };

      p.draw = () => {
        const dt = p.deltaTime / 1000;
        const f = elements[curEl];

        if (loadingPhase && !customImg) {
          p.background(0);
          bloom = p.min(0.5, warmFrames / WARM_TARGET * 0.5);
          drawFlowerToBuffer(f, bloom, 0);
          warmFrames++;
          const pct = p.min(100, p.floor(warmFrames / WARM_TARGET * 100));
          
          if (loaderBarRef.current) loaderBarRef.current.style.width = pct + '%';
          if (loaderPctRef.current) loaderPctRef.current.textContent = pct + '%';
          
          if (warmFrames >= WARM_TARGET) {
            p5LoadingFinished.current = true;
            checkLoadingState();
            // Don't set loadingPhase = false here anymore, wait for hasStarted prop
          }
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
          bloom += (bloomTarget - bloom) * 0.006;
          phaseT += dt;
          if (bloom > 0.98) { bloom = 1; phase = 'interactive'; phaseT = 0; }
        }

        densTimer += dt;
        if (densTimer > 0.8) {
          densTimer = 0;
          triggerGlitch();
          
          if (!isManualMode) {
            prevMode = renderMode;
            renderMode = ((renderMode + 1) % 3) as RenderMode;
            modeT = 0;
          }

          if (densDir === 1) { gridTarget = GRID_MAX; densDir = -1; }
          else { gridTarget = GRID_MIN; densDir = 1; }
        }

        if (phase === 'interactive') {
          phaseT += dt;
          if (phaseT > 25) { phase = 'wilting'; phaseT = 0; triggerGlitch(); }
        }

        if (phase === 'wilting') {
          wilt = p.min(1, wilt + dt * 0.04);
          phaseT += dt;
          if (wilt > 0.95) { phase = 'waiting'; phaseT = 0; }
        }

        if (phase === 'waiting') {
          phaseT += dt;
          if (phaseT > 0.6) {
            if (!isManualMode) {
              prevMode = renderMode;
              renderMode = ((renderMode + 1) % 3) as RenderMode;
              modeT = 0;
            }
            triggerGlitch();
            startElement((curEl + 1) % elements.length);
          }
        }

        grid += (gridTarget - grid) * 0.08;
        modeT = p.min(1, modeT + dt * 4.0);

        updateGlitch(dt);

        if (phase === 'interactive') {
          mInfX += ((p.mouseX - p.width / 2) * 0.08 - mInfX) * 0.04;
          mInfY += ((p.mouseY - p.height / 2) * 0.08 - mInfY) * 0.04;
        } else {
          mInfX *= 0.95; mInfY *= 0.95;
        }

        if (customImg && customImg.width > 0) {
          buf.background(0);
          const imgW = customImg.width;
          const imgH = customImg.height;
          const s = p.max(680 / imgW, 680 / imgH);
          buf.image(customImg, (680 - imgW * s) / 2, (680 - imgH * s) / 2, imgW * s, imgH * s);
          buf.loadPixels();
        } else {
          drawFlowerToBuffer(f, bloom, wilt);
        }

        glitchTimer -= dt;
        if (glitchTimer <= 0 && !glitchActive) {
          glitchTimer = p.random(3, 7);
          if (p.random() < 0.4) triggerGlitch();
        }

        renderToScreen();
        drawGlitchOverlay();
        drawUI();
      };

      const triggerGlitch = () => {
        glitchActive = true;
        glitchIntensity = p.random(0.4, 1.0);
        glitchSlices = [];
        const scaleF = p.min(p.width / BUF_W, p.height / BUF_H) * 0.85;
        const rW = BUF_W * scaleF;
        const rH = BUF_H * scaleF;
        const fOx = (p.width - rW) / 2 + mInfX;
        const fOy = (p.height - rH) / 2 + mInfY;
        const numSlices = p.floor(p.random(3, 10));
        for (let i = 0; i < numSlices; i++) {
          const sy = p.random(fOy, fOy + rH);
          const sh = p.min(p.random(2, rH * 0.08), fOy + rH - sy);
          glitchSlices.push({
            y: sy, h: sh,
            fx: fOx, fw: rW,
            offset: p.random(-80, 80) * glitchIntensity,
            colorShift: p.random() < 0.4,
            duration: p.random(0.08, 0.3)
          });
        }
      };

      const updateGlitch = (dt: number) => {
        if (!glitchActive) return;
        let allDone = true;
        for (const s of glitchSlices) {
          s.duration -= dt;
          if (s.duration > 0) allDone = false;
          else s.offset *= 0.7;
        }
        if (allDone) {
          glitchActive = false;
          glitchSlices = [];
        }
      };

      const drawGlitchOverlay = () => {
        if (!glitchActive || glitchSlices.length === 0) return;
        const dc = ctx; 
        for (const s of glitchSlices) {
          if (p.abs(s.offset) < 0.5) continue;
          const sx = p.floor(s.fx), sy = p.floor(s.y), sw = p.floor(s.fw), sh = p.floor(s.h);
          if (sw < 1 || sh < 1) continue;
          if (s.colorShift) {
            dc.save();
            dc.globalAlpha = 0.7;
            dc.globalCompositeOperation = 'lighter';
            dc.drawImage(dc.canvas, sx, sy, sw, sh, sx + s.offset * 1.5, sy, sw, sh);
            dc.globalAlpha = 0.45;
            dc.drawImage(dc.canvas, sx, sy, sw, sh, sx - s.offset, sy, sw, sh);
            dc.restore();
          } else {
            dc.drawImage(dc.canvas, sx, sy, sw, sh, sx + s.offset, sy, sw, sh);
          }
        }
      };

      const drawFlowerToBuffer = (f: FlowerElement, bl: number, wl: number) => {
        const g = buf;
        g.background(0);
        g.noStroke();
        wl = wl || 0;
        const stemProgress = p.constrain(bl * 3, 0, 1);
        const flowerBloom = p.constrain((bl - 0.15) / 0.85, 0, 1);
        const wiltDroop = wl * 55;
        const flowerCX = BUF_W / 2;
        const flowerCY = BUF_H * 0.38 + wiltDroop;
        drawStem(g, f, stemProgress, wl, flowerCX, flowerCY);
        drawPeony3D(g, f, flowerBloom, wl, flowerCX, flowerCY);
        buf.loadPixels();
      };

      const drawStem = (g: p5.Graphics, f: FlowerElement, progress: number, wl: number, cx: number, cy: number) => {
        wl = wl || 0;
        const stemLen = BUF_H * 0.42;
        const stemX = BUF_W / 2;
        const stemTop = cy;
        const stemBot = stemTop + stemLen;
        const visibleLen = stemLen * easeOutQuart(progress);
        const visibleTop = stemBot - visibleLen;
        for (let y = visibleTop; y < stemBot; y += 3) {
          const tt = (y - stemTop) / stemLen;
          const sw = p.lerp(15, 8, tt);
          const wiltBend = wl * 45 * (1 - tt) * p.sin((1 - tt) * p.PI);
          const curveX = p.sin(tt * p.PI * 0.3) * 22 + p.sin(tt * p.PI * 0.8) * 8 + wiltBend;
          let r = p.lerp(f.stemC[0], f.stemC[0] * 0.5, tt);
          let gc = p.lerp(f.stemC[1], f.stemC[1] * 0.5, tt);
          let b = p.lerp(f.stemC[2], f.stemC[2] * 0.5, tt);
          if (wl > 0) {
            r = p.lerp(r, r * 0.4 + 30, wl * 0.5);
            gc = p.lerp(gc, gc * 0.3 + 15, wl * 0.5);
            b = p.lerp(b, b * 0.25 + 8, wl * 0.5);
          }
          g.fill(r, gc, b);
          g.ellipse(stemX + curveX, y, sw, 5);
          g.fill(r * 1.4, gc * 1.4, b * 1.3, 50);
          g.ellipse(stemX + curveX - 2, y, sw * 0.2, 3);
        }
        if (progress > 0.3) {
          const leafP = p.constrain((progress - 0.3) / 0.4, 0, 1);
          const ly = stemTop + stemLen * 0.22;
          const lx = stemX + p.sin(0.22 * p.PI * 0.3) * 22;
          drawLeaf(g, lx, ly, -1, 48 * leafP, f.stemC);
        }
        if (progress > 0.5) {
          const leafP = p.constrain((progress - 0.5) / 0.4, 0, 1);
          const ly = stemTop + stemLen * 0.50;
          const lx = stemX + p.sin(0.50 * p.PI * 0.3) * 22;
          drawLeaf(g, lx, ly, 1, 42 * leafP, f.stemC);
        }
        if (progress > 0.7) {
          const leafP = p.constrain((progress - 0.7) / 0.3, 0, 1);
          const ly = stemTop + stemLen * 0.35;
          const lx = stemX + p.sin(0.35 * p.PI * 0.3) * 22;
          drawLeaf(g, lx, ly, -1, 35 * leafP, f.stemC);
        }
      };

      const drawLeaf = (g: p5.Graphics, x: number, y: number, side: number, sz: number, sc: [number, number, number]) => {
        if (sz < 2) return;
        g.push(); g.translate(x, y); g.rotate(side * 0.65);
        g.fill(sc[0] * 0.85, sc[1] * 1.15, sc[2] * 0.75);
        g.beginShape(); g.vertex(0, 0); 
        g.bezierVertex(sz * 0.35 * side, -sz * 0.38, sz * 0.85 * side, -sz * 0.22, sz * 1.35 * side, 0);
        g.bezierVertex(sz * 0.85 * side, sz * 0.22, sz * 0.35 * side, sz * 0.38, 0, 0);
        g.endShape(p.CLOSE);
        g.fill(sc[0] * 1.1, sc[1] * 1.4, sc[2] * 1.0, 60);
        g.beginShape(); g.vertex(sz * 0.1 * side, 0);
        g.bezierVertex(sz * 0.4 * side, -sz * 0.15, sz * 0.7 * side, -sz * 0.08, sz * 1.0 * side, 0);
        g.bezierVertex(sz * 0.7 * side, sz * 0.08, sz * 0.4 * side, sz * 0.15, sz * 0.1 * side, 0);
        g.endShape(p.CLOSE);
        g.stroke(sc[0] * 1.3, sc[1] * 1.5, sc[2] * 1.2, 70); g.strokeWeight(0.8);
        g.line(0, 0, sz * 1.15 * side, 0);
        for (let i = 1; i <= 3; i++) {
          const vx = sz * 0.3 * i * side;
          g.line(vx, 0, vx + sz * 0.2 * side, -sz * 0.12);
          g.line(vx, 0, vx + sz * 0.2 * side, sz * 0.12);
        }
        g.noStroke(); g.pop();
      };

      const rot3D = (x: number, y: number, z: number): [number, number, number] => {
        const cY = p.cos(rotY), sY = p.sin(rotY);
        const rx = x * cY + z * sY;
        const rz = -x * sY + z * cY;
        const cX = p.cos(rotX), sX = p.sin(rotX);
        const ry = y * cX - rz * sX;
        const rz2 = y * sX + rz * cX;
        const cZ = p.cos(rotZ), sZ = p.sin(rotZ);
        const fx = rx * cZ - ry * sZ;
        const fy = rx * sZ + ry * cZ;
        return [fx, fy, rz2];
      };

      const drawPeony3D = (g: p5.Graphics, f: FlowerElement, bl: number, wl: number, cx: number, cy: number) => {
        wl = wl || 0;
        const focal = 420;
        const wiltTilt = wl * 0.18;
        const cosW = p.cos(wiltTilt), sinW = p.sin(wiltTilt);
        const items: RenderItem[] = [];
        if (f.sepals && bl < 0.7) {
          const numS = f.sepals;
          const openAng = easeInOutCubic(bl) * p.HALF_PI * 0.9;
          let sepalAlpha = p.map(p.constrain(bl, 0, 0.7), 0, 0.7, 255, 0);
          if (wl) sepalAlpha *= (1 - wl);
          if (sepalAlpha > 5) {
            for (let i = 0; i < numS; i++) {
              const a = (p.TWO_PI / numS) * i;
              const sTilt = p.HALF_PI * 0.35 - openAng;
              const distance = 50;
              const ct = p.cos(sTilt), st = p.sin(sTilt);
              const x3 = p.cos(a) * distance * ct, z3 = p.sin(a) * distance * ct, y3 = -st * distance;
              const [rx, ry, rz] = rot3D(x3, y3, z3);
              const ps = focal / (focal + rz), sepAng = p.atan2(ry, rx), fv = p.max(focal / (focal + p.abs(rz)), 0.15);
              items.push({ rz, tp: 's', sx: rx * ps, sy: ry * ps, sa: sepAng, sLen: 80 * ps, sW: 25 * ps * fv, sAlpha: sepalAlpha, sc: f.stemC });
            }
          }
        }
        const cAlpha = p.constrain((bl - 0.45) / 0.3, 0, 1) * (1 - wl);
        if (cAlpha > 0) items.push({ rz: 0, tp: 'c', sx: 0, sy: 0, sa: 0, alpha: cAlpha });
        for (let layer = f.layers; layer >= 0; layer--) {
          const lr = layer / f.layers, layerDelay = (1 - lr) * 0.35, layerBl = p.constrain((bl - layerDelay) / (1 - layerDelay), 0, 1), ebl = easeInOutCubic(layerBl);
          if (ebl < 0.01) continue;
          const layerFall = p.constrain((wl * 1.4 - (1 - lr) * 0.4) / 0.6, 0, 1);
          if (layerFall > 0.9) continue;
          const innerBoost = (1 - lr), np = f.petalsPerLayer + p.floor(layer * 1.5) + p.floor(innerBoost * 5), baseR = p.lerp(10, f.maxRadius, lr);
          let tiltAngle = p.lerp(p.PI * 0.42, p.PI * 0.04, ebl) + layerFall * p.PI * 0.22;
          tiltAngle -= innerBoost * 0.15 * ebl;
          const cosTilt = p.cos(tiltAngle), sinTilt = p.sin(tiltAngle);
          for (let i = 0; i < np; i++) {
            const petalHash = ((i * 73 + layer * 137) & 0xFF) / 255;
            if (wl > 0.1 && petalHash < (wl - 0.1) * 1.3) continue;
            let angle = (p.TWO_PI / np) * i + layer * 0.42 + p.sin(layer * 2.1) * 0.12;
            angle += petalHash * 0.15;
            const droopAmt = layerFall * 0.5 * (0.4 + lr * 0.6), shrink = 1 - layerFall * 0.35, distance = baseR * ebl * (0.35 + lr * 0.25);
            let x3 = p.cos(angle) * distance * cosTilt, z3 = p.sin(angle) * distance * cosTilt, y3 = -sinTilt * distance + droopAmt * 28;
            if (wiltTilt > 0.001) {
              const ny = y3 * cosW - x3 * sinW * 0.3;
              x3 = x3 + y3 * sinW * 0.3; y3 = ny;
            }
            const [rx, ry, rz] = rot3D(x3, y3, z3);
            const ps = focal / (focal + rz), sx = rx * ps, sy = ry * ps, viewAngle = p.atan2(ry, rx), depthFactor = focal / (focal + p.abs(rz)), faceVis = p.max(depthFactor, 0.12);
            const nx3 = p.cos(angle) * cosTilt, ny3 = -sinTilt, nz3 = p.sin(angle) * cosTilt;
            const [, , lnz] = rot3D(nx3, ny3, nz3), lightDot = p.constrain(-lnz, -1, 1), lightMod = p.map(lightDot, -1, 1, 0.32, 1.25), cupFactor = (1 - lr) * (1 - ebl * 0.5) * 0.35;
            const pl = baseR * (0.2 + 0.8 * ebl) * (1.15 + innerBoost * 0.3) * shrink * ps;
            let pw = baseR * (0.15 + 0.85 * ebl) * 0.55 * shrink * ps * faceVis;
            pw *= (1 + cupFactor);
            const rPhase = i * 1.7 + layer * 0.9, rAmt = f.ruffleAmt * ebl * (1 + layerFall * 2 + innerBoost * 0.5) * ps, lA = p.sin(angle + layer * 0.5), dM = p.map(layer, 0, f.layers, 0.35, 1.0), bB = 0.4 + 0.6 * ebl, cm = p.map(lA, -1, 1, 0.45, 1.2) * dM * bB * lightMod;
            let r = p.constrain(p.lerp(f.c1[0], f.c2[0], lr) * cm, 0, 255), gr = p.constrain(p.lerp(f.c1[1], f.c2[1], lr) * cm, 0, 255), b = p.constrain(p.lerp(f.c1[2], f.c2[2], lr) * cm, 0, 255);
            if (wl > 0) {
              const wf = p.min(1, layerFall * 1.3);
              r = p.lerp(r, r * 0.5 + 55, wf); gr = p.lerp(gr, gr * 0.28 + 22, wf); b = p.lerp(b, b * 0.12 + 6, wf);
            }
            items.push({ rz, tp: 'p', sx, sy, sa: viewAngle, pl, pw, rPhase, rAmt, r, gr, b, cup: cupFactor });
          }
        }
        items.sort((a, b) => a.rz - b.rz);
        for (const it of items) {
          if (it.tp === 'c') {
            g.push(); g.translate(cx, cy);
            const [cnx, cny, cnz] = rot3D(0, -1, 0), cps = focal / (focal + cnz * 15), csx = cnx * 15 * cps, csy = cny * 15 * cps;
            for (let r = 28; r > 0; r -= 3) {
              const ratio = r / 28;
              g.fill(p.lerp(f.c3[0] * 0.1, f.c3[0] * 0.7, ratio) * (it.alpha || 1), p.lerp(f.c3[1] * 0.1, f.c3[1] * 0.7, ratio) * (it.alpha || 1), p.lerp(f.c3[2] * 0.1, f.c3[2] * 0.7, ratio) * (it.alpha || 1));
              g.ellipse(csx, csy, r * 2.2 * cps, r * 2.2 * cps);
            }
            if (bl > 0.65) {
              const sa2 = p.constrain((bl - 0.65) / 0.25, 0, 1) * (1 - wl);
              for (let i = 0; i < 22; i++) {
                const a = (p.TWO_PI / 22) * i, d = 6 + (i % 5) * 3, stX = p.cos(a) * d * sa2, stZ = p.sin(a) * d * sa2, stY = -3;
                const [srx, sry, srz] = rot3D(stX, stY, stZ), stP = focal / (focal + srz);
                g.fill(f.c2[0] * 0.7, f.c2[1] * 0.5, f.c2[2] * 0.3, 140 * sa2); g.ellipse(srx * stP, sry * stP, 2.5 * stP, 2.5 * stP);
              }
            }
            g.pop();
          } else if (it.tp === 's') {
            if (!it.sW || it.sW < 1) continue;
            g.push(); g.translate(cx + it.sx, cy + it.sy); g.rotate(it.sa);
            g.fill(it.sc![0] * 0.7, it.sc![1] * 1.0, it.sc![2] * 0.6, it.sAlpha!);
            g.beginShape(); g.vertex(0, 0);
            g.bezierVertex(it.sLen! * 0.3, -it.sW * 0.6, it.sLen! * 0.7, -it.sW * 0.4, it.sLen!, 0);
            g.bezierVertex(it.sLen! * 0.7, it.sW * 0.4, it.sLen! * 0.3, it.sW * 0.6, 0, 0);
            g.endShape(p.CLOSE); g.pop();
          } else {
            if (!it.pw || it.pw < 0.5) continue;
            g.push(); g.translate(cx + it.sx, cy + it.sy); g.rotate(it.sa); g.fill(it.r!, it.gr!, it.b!); g.beginShape();
            for (let tt = 0; tt <= 1; tt += 0.07) {
              const px = tt * it.pl!, bW = p.sin(tt * p.PI) * it.pw, cup = p.sin(tt * p.PI) * (it.cup || 0) * it.pw * 0.6, ruf = p.sin(tt * 8 + it.rPhase!) * it.rAmt! * tt;
              g.vertex(px, bW + ruf + cup);
            }
            for (let tt = 1; tt >= 0; tt -= 0.07) {
              const px = tt * it.pl!, bW = p.sin(tt * p.PI) * it.pw, cup = p.sin(tt * p.PI) * (it.cup || 0) * it.pw * 0.4, ruf = p.sin(tt * 8 + it.rPhase! + p.PI) * it.rAmt! * tt;
              g.vertex(px, -bW + ruf - cup);
            }
            g.endShape(p.CLOSE); g.pop();
          }
        }
      };

      const renderToScreen = () => {
        const px = (buf as any).pixels;
        const g = p.max(4, p.round(grid));
        const asciiG = p.max(g, 6);
        const scaleF = p.min(p.width / BUF_W, p.height / BUF_H) * 0.85;
        const invScale = 1 / scaleF, renderW = BUF_W * scaleF, renderH = BUF_H * scaleF, ox = (p.width - renderW) / 2 + mInfX, oy = (p.height - renderH) / 2 + mInfY;
        const curM = renderMode, prevM = prevMode, mt = modeT, transitionDone = mt >= 0.99;
        const useNative = (curM === 0) || (!transitionDone && prevM === 0);
        if (useNative) { ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; }
        const gEff = (curM === 0 && transitionDone) ? asciiG : g, halfG = gEff * 0.5, yStart = p.max(0, p.floor(oy / gEff) * gEff), yEnd = p.min(p.height, oy + renderH), xStart = p.max(0, p.floor(ox / gEff) * gEff), xEnd = p.min(p.width, ox + renderW);
        const asciiSize = gEff * 1.1;
        let lastFontStr = '';
        for (let sy = yStart; sy < yEnd; sy += gEff) {
          const byBase = p.floor((sy - oy) * invScale);
          if (byBase < 0 || byBase >= BUF_H) continue;
          const rowOff = byBase * BUF_W;
          for (let sx = xStart; sx < xEnd; sx += gEff) {
            const bx = p.floor((sx - ox) * invScale);
            if (bx < 0 || bx >= BUF_W) continue;
            const idx = (rowOff + bx) * 4, r = px[idx], gr = px[idx + 1], b = px[idx + 2];
            if ((r + gr + b) < 12) continue;
            const bright = r * 0.299 + gr * 0.587 + b * 0.114, cx = sx + halfG, cy = sy + halfG;
            let mode: RenderMode;
            if (transitionDone) mode = curM;
            else {
              const hash = ((sx * 73 + sy * 137) & 0xFF) * 0.00392;
              mode = hash < mt ? curM : prevM;
            }
            if (mode === 0) {
              const fontSz = p.floor(asciiSize * (0.4 + bright * 0.004)), fontStr = fontSz + 'px Courier New';
              if (fontStr !== lastFontStr) { ctx.font = fontStr; lastFontStr = fontStr; }
              ctx.fillStyle = 'rgb(' + r + ',' + gr + ',' + b + ')';
              const ci = ((bright >> 2) + ((sx * 7 + sy * 13) >> 3)) % chars.length;
              ctx.fillText(chars[ci], cx, cy);
            } else if (mode === 1) {
              p.fill(r, gr, b); const d = gEff * (0.1 + bright * 0.0033); p.ellipse(cx, cy, d, d);
            } else {
              p.fill(r, gr, b); p.rectMode(p.CENTER); p.rect(cx, cy, gEff * 0.93, gEff * 0.93);
            }
          }
        }
      };

      const drawUI = () => {
        p.fill(255, 255, 255, 40);
        p.textSize(9);
        p.textAlign(p.LEFT, p.TOP);
        p.text(p.floor(p.frameRate()) + ' fps', 10, 10);
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.mousePressed = () => { if (loadingPhase) return; triggerGlitch(); };
      p.keyPressed = () => {
        if (p.key === 'f' || p.key === 'F') { const fs = p.fullscreen(); p.fullscreen(!fs); }
        if (p.key === 'g' || p.key === 'G') triggerGlitch();
      };
      p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    const p5Instance = new p5(sketch, containerRef.current);
    p5InstanceRef.current = p5Instance;

    return () => {
      isUnmounted.current = true;
      p5Instance.remove();
    };
  }, []);

  // Synchronize start signal
  useEffect(() => {
    if (hasStarted && p5InstanceRef.current) {
      (p5InstanceRef.current as any).startExperience();
      if (loaderRef.current) {
        loaderRef.current.classList.add('fade');
      }
    }
  }, [hasStarted]);

  useEffect(() => {
    if (p5InstanceRef.current) {
      (p5InstanceRef.current as any).updateCustomImage(imageSrc);
    }
  }, [imageSrc]);

  useEffect(() => {
    if (p5InstanceRef.current) {
      (p5InstanceRef.current as any).setEffectMode(effectMode);
    }
  }, [effectMode]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div id="loader" ref={loaderRef}>
        <div className="title">LOADING</div>
        <div className="bar-bg">
          <div className="bar-fill" ref={loaderBarRef}></div>
        </div>
        <div className="pct" ref={loaderPctRef}>0%</div>
      </div>
    </div>
  );
};

export default SketchCanvas;
