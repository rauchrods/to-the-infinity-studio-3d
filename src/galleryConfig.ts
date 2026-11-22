import * as THREE from 'three';
import { PORTFOLIO_ITEMS } from './Data/portfolioData';
import type { GalleryItem, WallArtworkPosition } from './types';

// Gallery geometric specifications (meters)
export const GALLERY_CONFIG = {
  hallWidth: 9.6,      // European grand salon hall width
  hallHeight: 4.8,     // High ceiling European gallery proportion
  spacingZ: 4.8,       // Spacing between artwork stations
  frameElevation: 1.95,// Center height of artworks from the floor (eye level: 1.7m)
  startZ: 5.0,         // Starting distance from entrance
  endPaddingZ: 8.0,    // Clearance after final artwork
  playerSpeed: 7.2,    // Walk speed
  playerEyeHeight: 1.7,// FPS Camera eye level
  boundsPadding: 0.9,  // Collision buffer with walls
};

// Return all available studio artworks for complete grand exhibition
export function getCuratedArtworks(): GalleryItem[] {
  return PORTFOLIO_ITEMS.filter(
    (item) => item.imageSrc && item.title
  );
}

// Calculate 3D positions for artworks on both left and right walls simultaneously
export function calculateGalleryLayout(artworks: GalleryItem[]): {
  layout: WallArtworkPosition[];
  hallLength: number;
  maxZ: number;
} {
  const halfWidth = GALLERY_CONFIG.hallWidth / 2;
  const layout: WallArtworkPosition[] = [];

  let currentZ = GALLERY_CONFIG.startZ;

  // Place artworks on BOTH left and right walls in pairs at each station
  for (let i = 0; i < artworks.length; i += 2) {
    const leftItem = artworks[i];
    const rightItem = artworks[i + 1];

    // Left wall artwork
    if (leftItem) {
      let width = 1.9;
      let height = 2.45;
      if (leftItem.aspect === 'landscape') {
        width = 2.5;
        height = 1.75;
      } else if (leftItem.aspect === 'square') {
        width = 2.1;
        height = 2.1;
      }

      layout.push({
        item: leftItem,
        wall: 'left',
        x: -halfWidth + 0.12,
        y: GALLERY_CONFIG.frameElevation,
        z: currentZ,
        rotationY: Math.PI / 2, // Facing right (+X)
        width,
        height,
        frameIndex: i,
      });
    }

    // Right wall artwork (directly opposite on the other side)
    if (rightItem) {
      let width = 1.9;
      let height = 2.45;
      if (rightItem.aspect === 'landscape') {
        width = 2.5;
        height = 1.75;
      } else if (rightItem.aspect === 'square') {
        width = 2.1;
        height = 2.1;
      }

      layout.push({
        item: rightItem,
        wall: 'right',
        x: halfWidth - 0.12,
        y: GALLERY_CONFIG.frameElevation,
        z: currentZ,
        rotationY: -Math.PI / 2, // Facing left (-X)
        width,
        height,
        frameIndex: i + 1,
      });
    }

    // Step down the gallery corridor
    currentZ += GALLERY_CONFIG.spacingZ;
  }

  const maxZ = currentZ + GALLERY_CONFIG.endPaddingZ;
  const hallLength = maxZ + 4.0;

  return { layout, hallLength, maxZ };
}

/**
 * Procedural French Warm Grey Marble / Limestone Texture (Gris du Marais / French Greige)
 * Refined warm dove-grey & soft taupe stone base with organic creamy ivory and chalk-white feather veins
 */
export function createMarbleTexture(width = 9.6, length = 300): { diffuse: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Refined French Warm Grey / Taupe Limestone Stone Base
  const baseGrad = ctx.createLinearGradient(0, 0, size, size);
  baseGrad.addColorStop(0, '#989289');    // French limestone warm dove-grey
  baseGrad.addColorStop(0.28, '#aca59c'); // Luminous warm greige tone
  baseGrad.addColorStop(0.60, '#8f8980'); // Deep taupe-slate undertone
  baseGrad.addColorStop(0.85, '#a59f96'); // Soft limestone highlight
  baseGrad.addColorStop(1, '#878178');    // Rich earth boundary
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Soft atmospheric mineral clouds (natural French limestone breccia)
  for (let i = 0; i < 11; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rad = 180 + Math.random() * 260;
    const radGrad = ctx.createRadialGradient(rx, ry, 20, rx, ry, rad);
    radGrad.addColorStop(0, 'rgba(140, 132, 122, 0.48)');
    radGrad.addColorStop(0.45, 'rgba(165, 156, 145, 0.30)');
    radGrad.addColorStop(1, 'rgba(152, 144, 134, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, size, size);
  }

  // High-Definition Organic Marble Vein Drawer
  const drawVein = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    lineWidth: number,
    branches: number
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let curX = startX;
    let curY = startY;
    const steps = 38;
    const dx = (endX - startX) / steps;
    const dy = (endY - startY) / steps;

    for (let i = 0; i < steps; i++) {
      curX += dx + (Math.random() - 0.5) * 26;
      curY += dy + (Math.random() - 0.5) * 20;
      ctx.lineTo(curX, curY);

      if (branches > 0 && Math.random() < 0.35) {
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * 0.52;
        ctx.moveTo(curX, curY);
        const bx = curX + (Math.random() - 0.5) * 160;
        const by = curY + (Math.random() - 0.5) * 160;
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(curX, curY);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  // 3. Signature Creamy Ivory & Chalk-White Flowing Veins
  for (let i = 0; i < 9; i++) {
    const sx = Math.random() * size;
    const ex = (sx + (Math.random() - 0.5) * 600 + size) % size;
    drawVein(sx, 0, ex, size, 'rgba(250, 247, 240, 0.94)', 5.0, 3);
  }

  // 4. Secondary Pale Calcite & Silk Feather Threads
  for (let i = 0; i < 7; i++) {
    const sy = Math.random() * size;
    const ey = (sy + (Math.random() - 0.5) * 500 + size) % size;
    drawVein(0, sy, size, ey, 'rgba(235, 230, 222, 0.82)', 3.4, 2);
  }

  // 5. Supporting Warm Charcoal-Taupe Mineral Veins
  for (let i = 0; i < 6; i++) {
    const sy = Math.random() * size;
    const ey = (sy + (Math.random() - 0.5) * 500 + size) % size;
    drawVein(0, sy, size, ey, 'rgba(115, 106, 96, 0.75)', 2.5, 2);
  }

  // 6. Hairline Micro-fracture mineral needles
  for (let i = 0; i < 15; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    drawVein(sx, sy, sx + 250, sy + 190, 'rgba(175, 165, 155, 0.58)', 1.5, 1);
  }

  // 7. Grand European Monumental Marble Slab Grout Seams (Large format ~1.6m x 1.6m square slabs)
  const tileSize = 512; // 2x2 grand slabs per 1024px texture canvas
  ctx.strokeStyle = 'rgba(105, 98, 92, 0.94)';
  ctx.lineWidth = 4.0;
  for (let x = 0; x <= size; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Each 512px slab is 1.6m x 1.6m (whole 1024px texture is 3.2m x 3.2m)
  // Across 9.6m hall width: exactly 6 grand luxury marble squares (large format)
  const repeatX = Math.max(1, Math.round(width / 3.2));
  const repeatY = Math.max(5, Math.round(length / 3.2));

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(repeatX, repeatY);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.anisotropy = 8;

  // Polished specular reflection roughness map (High gloss French limestone polish)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#222222'; // Satiny polished stone sheen (~0.14 specular roughness)
  rctx.fillRect(0, 0, 256, 256);

  // Grout lines roughness (matte grout in joints for 2x2 grand slabs)
  rctx.strokeStyle = '#606060';
  rctx.lineWidth = 4;
  for (let x = 0; x <= 256; x += 128) {
    rctx.beginPath();
    rctx.moveTo(x, 0);
    rctx.lineTo(x, 256);
    rctx.stroke();
  }
  for (let y = 0; y <= 256; y += 128) {
    rctx.beginPath();
    rctx.moveTo(0, y);
    rctx.lineTo(256, y);
    rctx.stroke();
  }

  const roughness = new THREE.CanvasTexture(roughCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(repeatX, repeatY);
  roughness.anisotropy = 8;

  return { diffuse, roughness };
}
