/**
 * @module flower-painter
 * @description Module for drawing the 3D geometry (stem, leaf, petals) of the flower into a p5.Graphics buffer.
 */

import p5 from 'p5';
import { FlowerElement, RenderItem } from '../types';
import { rot3D, easeInOutCubic, easeOutQuart } from '../utils/p5-math';

const BUF_W = 680, BUF_H = 680;

/**
 * Draws a single leaf.
 * 
 * @param p - p5 instance
 * @param g - Target drawing layer (Graphics)
 * @param x - Starting X coordinate
 * @param y - Starting Y coordinate
 * @param side - Direction (-1: left, 1: right)
 * @param sz - Leaf size
 * @param sc - Stem color array [R, G, B]
 */
export const drawLeaf = (p: p5, g: p5.Graphics, x: number, y: number, side: number, sz: number, sc: [number, number, number]) => {

  if (sz < 2) return;
  g.push(); g.translate(x, y); g.rotate(side * 0.65);
  g.fill(sc[0] * 0.85, sc[1] * 1.15, sc[2] * 0.75);
  g.beginShape(); g.vertex(0, 0); 
  g.bezierVertex(sz * 0.35 * side, -sz * 0.38, sz * 0.85 * side, -sz * 0.22, sz * 1.35 * side, 0);
  g.bezierVertex(sz * 0.85 * side, sz * 0.22, sz * 0.35 * side, sz * 0.38, 0, 0);
  g.endShape(p.CLOSE);
  g.pop();
};

/**
 * Draws the stem and leaves on it.
 * 
 * @param p - p5 instance
 * @param g - Target drawing layer (Graphics)
 * @param f - Flower element data
 * @param progress - Growth progress (0-1)
 * @param wl - Wilting factor (0-1)
 * @param cx - Center X of flower head
 * @param cy - Center Y of flower head
 */
export const drawStem = (p: p5, g: p5.Graphics, f: FlowerElement, progress: number, wl: number, cx: number, cy: number) => {
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
  }

  if (progress > 0.3) {
    const leafP = p.constrain((progress - 0.3) / 0.4, 0, 1);
    const ly = stemTop + stemLen * 0.22;
    const lx = stemX + p.sin(0.22 * p.PI * 0.3) * 22;
    drawLeaf(p, g, lx, ly, -1, 48 * leafP, f.stemC);
  }
  if (progress > 0.5) {
    const leafP = p.constrain((progress - 0.5) / 0.4, 0, 1);
    const ly = stemTop + stemLen * 0.50;
    const lx = stemX + p.sin(0.50 * p.PI * 0.3) * 22;
    drawLeaf(p, g, lx, ly, 1, 42 * leafP, f.stemC);
  }
};

/**
 * Draws the 3D peony flower head. Creates a set of RenderItems and sorts them by Z-buffer.
 * 
 * @param p - p5 instance
 * @param g - Target drawing layer (Graphics)
 * @param f - Flower element data
 * @param bl - Bloom degree (0-1)
 * @param wl - Wilting factor (0-1)
 * @param cx - Center X on canvas
 * @param cy - Center Y on canvas
 * @param rotX - 3D rotation X
 * @param rotY - 3D rotation Y
 * @param rotZ - 3D rotation Z
 */
export const drawPeony3D = (
  p: p5, 
  g: p5.Graphics, 
  f: FlowerElement, 
  bl: number, 
  wl: number, 
  cx: number, 
  cy: number,
  rotX: number,
  rotY: number,
  rotZ: number
) => {
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
        const [rx, ry, rz] = rot3D(x3, y3, z3, rotX, rotY, rotZ, p);
        const ps = focal / (focal + rz), sepAng = p.atan2(ry, rx), fv = p.max(focal / (focal + p.abs(rz)), 0.15);
        items.push({ rz, tp: 's', sx: rx * ps, sy: ry * ps, sa: sepAng, sLen: 80 * ps, sW: 25 * ps * fv, sAlpha: sepalAlpha, sc: f.stemC });
      }
    }
  }

  const cAlpha = p.constrain((bl - 0.45) / 0.3, 0, 1) * (1 - wl);
  if (cAlpha > 0) items.push({ rz: 0, tp: 'c', sx: 0, sy: 0, sa: 0, alpha: cAlpha });

  for (let layer = f.layers; layer >= 0; layer--) {
    const lr = layer / f.layers;
    const layerDelay = (1 - lr) * 0.35;
    const layerBl = p.constrain((bl - layerDelay) / (1 - layerDelay), 0, 1);
    const ebl = easeInOutCubic(layerBl);
    if (ebl < 0.01) continue;

    const layerFall = p.constrain((wl * 1.4 - (1 - lr) * 0.4) / 0.6, 0, 1);
    if (layerFall > 0.9) continue;

    const innerBoost = (1 - lr);
    const np = f.petalsPerLayer + p.floor(layer * 1.5) + p.floor(innerBoost * 5);
    const baseR = p.lerp(10, f.maxRadius, lr);
    let tiltAngle = p.lerp(p.PI * 0.42, p.PI * 0.04, ebl) + layerFall * p.PI * 0.22;
    tiltAngle -= innerBoost * 0.15 * ebl;
    const cosTilt = p.cos(tiltAngle);

    for (let i = 0; i < np; i++) {
      const petalHash = ((i * 73 + layer * 137) & 0xFF) / 255;
      if (wl > 0.1 && petalHash < (wl - 0.1) * 1.3) continue;
      
      let angle = (p.TWO_PI / np) * i + layer * 0.42 + p.sin(layer * 2.1) * 0.12;
      angle += petalHash * 0.15;
      const droopAmt = layerFall * 0.5 * (0.4 + lr * 0.6), shrink = 1 - layerFall * 0.35, distance = baseR * ebl * (0.35 + lr * 0.25);
      let x3 = p.cos(angle) * distance * cosTilt, z3 = p.sin(angle) * distance * cosTilt, y3 = -p.sin(tiltAngle) * distance + droopAmt * 28;
      
      if (wl > 0.001) {
        const ny = y3 * cosW - x3 * sinW * 0.3;
        x3 = x3 + y3 * sinW * 0.3; y3 = ny;
      }
      
      const [rx, ry, rz] = rot3D(x3, y3, z3, rotX, rotY, rotZ, p);
      const ps = focal / (focal + rz), sx = rx * ps, sy = ry * ps, viewAngle = p.atan2(ry, rx), depthFactor = focal / (focal + p.abs(rz)), faceVis = p.max(depthFactor, 0.12);
      const pl = baseR * (0.2 + 0.8 * ebl) * (1.15 + innerBoost * 0.3) * shrink * ps;
      let pw = baseR * (0.15 + 0.85 * ebl) * 0.55 * shrink * ps * faceVis;
      const rPhase = i * 1.7 + layer * 0.9, rAmt = f.ruffleAmt * ebl * (1 + layerFall * 2 + innerBoost * 0.5) * ps;
      const dM = p.map(layer, 0, f.layers, 0.35, 1.0), bB = 0.4 + 0.6 * ebl;
      
      let r = p.constrain(p.lerp(f.c1[0], f.c2[0], lr) * dM * bB, 0, 255);
      let gr = p.constrain(p.lerp(f.c1[1], f.c2[1], lr) * dM * bB, 0, 255); 
      let b = p.constrain(p.lerp(f.c1[2], f.c2[2], lr) * dM * bB, 0, 255);
      
      if (wl > 0) {
        const wf = p.min(1, layerFall * 1.3);
        r = p.lerp(r, r * 0.5 + 55, wf); 
        gr = p.lerp(gr, gr * 0.28 + 22, wf); 
        b = p.lerp(b, b * 0.12 + 6, wf);
      }
      items.push({ rz, tp: 'p', sx, sy, sa: viewAngle, pl, pw, rPhase, rAmt, r, gr, b });
    }
  }

  items.sort((a, b) => a.rz - b.rz);

  for (const it of items) {
    if (it.tp === 'c') {
      g.push(); g.translate(cx, cy);
      const [cnx, cny, cnz] = rot3D(0, -1, 0, rotX, rotY, rotZ, p);
      const cps = focal / (focal + cnz * 15), csx = cnx * 15 * cps, csy = cny * 15 * cps;
      for (let r = 28; r > 0; r -= 3) {
        const ratio = r / 28;
        g.fill(p.lerp(f.c3[0] * 0.1, f.c3[0] * 0.7, ratio) * (it.alpha || 1), p.lerp(f.c3[1] * 0.1, f.c3[1] * 0.7, ratio) * (it.alpha || 1), p.lerp(f.c3[2] * 0.1, f.c3[2] * 0.7, ratio) * (it.alpha || 1));
        g.ellipse(csx, csy, r * 2.2 * cps, r * 2.2 * cps);
      }
      g.pop();
    } else if (it.tp === 's') {
      g.push(); g.translate(cx + it.sx, cy + it.sy); g.rotate(it.sa);
      g.fill(it.sc![0] * 0.7, it.sc![1] * 1.0, it.sc![2] * 0.6, it.sAlpha!);
      g.beginShape(); g.vertex(0, 0);
      g.bezierVertex(it.sLen! * 0.3, -it.sW! * 0.6, it.sLen! * 0.7, -it.sW! * 0.4, it.sLen!, 0);
      g.bezierVertex(it.sLen! * 0.7, it.sW! * 0.4, it.sLen! * 0.3, it.sW! * 0.6, 0, 0);
      g.endShape(p.CLOSE); g.pop();
    } else {
      g.push(); g.translate(cx + it.sx, cy + it.sy); g.rotate(it.sa); g.fill(it.r!, it.gr!, it.b!); g.beginShape();
      for (let tt = 0; tt <= 1; tt += 0.07) {
        const px = tt * it.pl!, bW = p.sin(tt * p.PI) * it.pw!, ruf = p.sin(tt * 8 + it.rPhase!) * it.rAmt! * tt;
        g.vertex(px, bW + ruf);
      }
      for (let tt = 1; tt >= 0; tt -= 0.07) {
        const px = tt * it.pl!, bW = p.sin(tt * p.PI) * it.pw!, ruf = p.sin(tt * 8 + it.rPhase! + p.PI) * it.rAmt! * tt;
        g.vertex(px, -bW + ruf);
      }
      g.endShape(p.CLOSE); g.pop();
    }
  }
};

/**
 * Renders the full flower (stem + head) to a p5.Graphics buffer.
 * 
 * @param p - p5 instance
 * @param g - Target drawing layer (Graphics)
 * @param f - Flower element data
 * @param bl - Bloom/Growth degree (0-1)
 * @param wl - Wilting factor (0-1)
 * @param rotX - 3D rotation X
 * @param rotY - 3D rotation Y
 * @param rotZ - 3D rotation Z
 */
export const drawFlowerToBuffer = (
  p: p5, 
  g: p5.Graphics, 
  f: FlowerElement, 
  bl: number, 
  wl: number,
  rotX: number,
  rotY: number,
  rotZ: number
) => {
  g.background(0);
  g.noStroke();
  const stemProgress = p.constrain(bl * 3, 0, 1);
  const flowerBloom = p.constrain((bl - 0.15) / 0.85, 0, 1);
  const wiltDroop = wl * 55;
  const flowerCX = BUF_W / 2;
  const flowerCY = BUF_H * 0.38 + wiltDroop;
  
  drawStem(p, g, f, stemProgress, wl, flowerCX, flowerCY);
  drawPeony3D(p, g, f, flowerBloom, wl, flowerCX, flowerCY, rotX, rotY, rotZ);
  g.loadPixels();
};
