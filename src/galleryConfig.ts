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
 * Procedural Calacatta Gold / Carrara Luxury Italian Marble Texture
 * Generates high-res seamless marble slabs with delicate gold & grey veining and specular sheen
 */
export function createMarbleTexture(): { diffuse: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Luxurious milky white & warm ivory base
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#f9f9f7');
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, '#f5f5f2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Multi-octave organic marble veins
  const drawVein = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    width: number,
    branches: number
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let curX = startX;
    let curY = startY;
    const steps = 30;
    const dx = (endX - startX) / steps;
    const dy = (endY - startY) / steps;

    for (let i = 0; i < steps; i++) {
      curX += dx + (Math.random() - 0.5) * 22;
      curY += dy + (Math.random() - 0.5) * 16;
      ctx.lineTo(curX, curY);

      // Sub-vein branch
      if (branches > 0 && Math.random() < 0.25) {
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(195, 185, 170, 0.25)';
        ctx.lineWidth = width * 0.45;
        ctx.moveTo(curX, curY);
        const bx = curX + (Math.random() - 0.5) * 120;
        const by = curY + (Math.random() - 0.5) * 120;
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(curX, curY);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  // Smoke clouds / soft tone variation across marble slabs
  for (let i = 0; i < 7; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rad = 150 + Math.random() * 250;
    const radGrad = ctx.createRadialGradient(rx, ry, 10, rx, ry, rad);
    radGrad.addColorStop(0, 'rgba(238, 236, 230, 0.4)');
    radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, size, size);
  }

  // Primary charcoal/grey delicate veins
  for (let i = 0; i < 5; i++) {
    const sy = Math.random() * size;
    const ey = (sy + (Math.random() - 0.5) * 400 + size) % size;
    drawVein(0, sy, size, ey, 'rgba(175, 172, 168, 0.45)', 2.8, 3);
  }

  // Warm golden amber veins (Calacatta Gold characteristic)
  for (let i = 0; i < 4; i++) {
    const sx = Math.random() * size;
    const ex = (sx + (Math.random() - 0.5) * 500 + size) % size;
    drawVein(sx, 0, ex, size, 'rgba(205, 178, 142, 0.35)', 2.0, 2);
  }

  // Fine hairline mineral threads
  for (let i = 0; i < 8; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    drawVein(sx, sy, sx + 250, sy + 180, 'rgba(160, 155, 150, 0.2)', 1.0, 1);
  }

  // 3. Tile grout seams (large 1.5m x 1.5m luxury slabs)
  const tileSize = 256;
  ctx.strokeStyle = 'rgba(225, 222, 218, 0.9)';
  ctx.lineWidth = 2.5;
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

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(6, 32);
  diffuse.colorSpace = THREE.SRGBColorSpace;

  // Roughness map for polished specular marble
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#262626'; // High gloss polished marble (roughness ~0.15)
  rctx.fillRect(0, 0, 256, 256);

  // Grout lines are slightly less reflective
  rctx.strokeStyle = '#666666';
  rctx.lineWidth = 3;
  for (let x = 0; x <= 256; x += 64) {
    rctx.beginPath();
    rctx.moveTo(x, 0);
    rctx.lineTo(x, 256);
    rctx.stroke();
  }
  for (let y = 0; y <= 256; y += 64) {
    rctx.beginPath();
    rctx.moveTo(0, y);
    rctx.lineTo(256, y);
    rctx.stroke();
  }

  const roughness = new THREE.CanvasTexture(roughCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(6, 32);

  return { diffuse, roughness };
}
