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
 * Generates high-res seamless marble slabs with rich, visible gold & charcoal veining and specular sheen
 */
export function createMarbleTexture(): { diffuse: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Warm ivory & soft beige Italian marble base tone (high contrast for veins)
  ctx.fillStyle = '#f0ece3';
  ctx.fillRect(0, 0, size, size);

  // Soft atmospheric mineral cloud variations
  for (let i = 0; i < 8; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rad = 200 + Math.random() * 250;
    const radGrad = ctx.createRadialGradient(rx, ry, 20, rx, ry, rad);
    radGrad.addColorStop(0, 'rgba(230, 224, 214, 0.7)');
    radGrad.addColorStop(0.5, 'rgba(245, 243, 238, 0.3)');
    radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, size, size);
  }

  // 2. High-Definition Organic Marble Vein Drawer
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
    const steps = 35;
    const dx = (endX - startX) / steps;
    const dy = (endY - startY) / steps;

    for (let i = 0; i < steps; i++) {
      curX += dx + (Math.random() - 0.5) * 26;
      curY += dy + (Math.random() - 0.5) * 20;
      ctx.lineTo(curX, curY);

      if (branches > 0 && Math.random() < 0.3) {
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width * 0.5;
        ctx.moveTo(curX, curY);
        const bx = curX + (Math.random() - 0.5) * 140;
        const by = curY + (Math.random() - 0.5) * 140;
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

  // 3. Pronounced Charcoal & Slate Grey Dramatic Veins
  for (let i = 0; i < 6; i++) {
    const sy = Math.random() * size;
    const ey = (sy + (Math.random() - 0.5) * 500 + size) % size;
    drawVein(0, sy, size, ey, 'rgba(110, 105, 98, 0.75)', 4.2, 3);
  }

  // 4. Distinct Golden Amber & Ocre Calacatta Veins
  for (let i = 0; i < 5; i++) {
    const sx = Math.random() * size;
    const ex = (sx + (Math.random() - 0.5) * 600 + size) % size;
    drawVein(sx, 0, ex, size, 'rgba(185, 142, 85, 0.65)', 3.2, 2);
  }

  // 5. Hairline Micro-fracture mineral threads
  for (let i = 0; i < 10; i++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    drawVein(sx, sy, sx + 280, sy + 220, 'rgba(140, 130, 120, 0.45)', 1.5, 1);
  }

  // 6. European Large Marble Slab Grout Seams (Crisp, dark contrast)
  const tileSize = 256;
  ctx.strokeStyle = 'rgba(170, 162, 150, 0.85)';
  ctx.lineWidth = 3.5;
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
  // Repeat 4x across corridor width, 40x along corridor length for crisp natural marble scale
  diffuse.repeat.set(4, 40);
  diffuse.colorSpace = THREE.SRGBColorSpace;

  // Polished specular reflection roughness map
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#303030'; // High-gloss polished museum marble (roughness ~0.19)
  rctx.fillRect(0, 0, 256, 256);

  // Grout lines roughness
  rctx.strokeStyle = '#757575';
  rctx.lineWidth = 4;
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
  roughness.repeat.set(4, 40);

  return { diffuse, roughness };
}
