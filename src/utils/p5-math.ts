/**
 * @module p5-math
 * @description p5.js instance'ından bağımsız saf matematiksel hesaplamalar ve easing fonksiyonları.
 */

import p5 from 'p5';

/**
 * Rotates a point in 3D space based on specified angles.
 * 
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param rotX - Rotation angle around X axis (Radians)
 * @param rotY - Rotation angle around Y axis (Radians)
 * @param rotZ - Rotation angle around Z axis (Radians)
 * @param p - p5 instance (used for sin/cos functions)
 * @returns [x, y, z] New rotated coordinates
 */
export const rot3D = (
  x: number, 
  y: number, 
  z: number, 
  rotX: number, 
  rotY: number, 
  rotZ: number,
  p: p5
): [number, number, number] => {
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

/**
 * Cubic In-Out Easing function.
 * Smooth motion: slow at start and end, fast in the middle.
 * 
 * @param x - Progress value between 0 and 1
 * @returns Smoothed value between 0 and 1
 */
export const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/**
 * Quartic Out Easing function.
 * Starts fast and decelerates smoothly.
 * 
 * @param x - Progress value between 0 and 1
 * @returns Smoothed value between 0 and 1
 */
export const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

