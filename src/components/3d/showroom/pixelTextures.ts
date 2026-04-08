"use client";

import * as THREE from "three";

/**
 * 90'lar DOOM tarzi pixelated texture generator
 * 64x64 veya 128x128 canvas, NearestFilter ile chunky pixel
 */

function makePixelTexture(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

/**
 * DOOM brown brick wall - Wall texture #1
 */
export function createBrickWallTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Base brown
  ctx.fillStyle = "#4a2818";
  ctx.fillRect(0, 0, 64, 64);

  // Brick rows
  const brickH = 8;
  const brickW = 16;
  for (let y = 0; y < 64; y += brickH) {
    const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
    for (let x = -brickW; x < 64 + brickW; x += brickW) {
      const px = x + offset;
      // Brick color (slightly varied)
      const shade = 20 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${70 + shade}, ${40 + shade / 2}, ${20})`;
      ctx.fillRect(px + 1, y + 1, brickW - 2, brickH - 2);
      // Highlight top edge
      ctx.fillStyle = `rgba(255, 200, 100, 0.2)`;
      ctx.fillRect(px + 1, y + 1, brickW - 2, 1);
      // Dark bottom edge
      ctx.fillStyle = `rgba(0, 0, 0, 0.4)`;
      ctx.fillRect(px + 1, y + brickH - 2, brickW - 2, 1);
    }
  }

  // Stains
  ctx.fillStyle = "rgba(40, 10, 0, 0.5)";
  for (let i = 0; i < 8; i++) {
    const x = Math.floor(Math.random() * 64);
    const y = Math.floor(Math.random() * 64);
    ctx.fillRect(x, y, 2, 2);
  }

  return canvas;
}

/**
 * DOOM metal panel wall - Wall texture #2
 */
export function createMetalPanelTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Base dark metal
  ctx.fillStyle = "#2a2620";
  ctx.fillRect(0, 0, 64, 64);

  // Large panels divided into 2 or 4
  ctx.fillStyle = "#3a342a";
  ctx.fillRect(2, 2, 30, 60);
  ctx.fillRect(34, 2, 28, 60);

  // Panel highlight
  ctx.fillStyle = "rgba(200, 180, 120, 0.15)";
  ctx.fillRect(2, 2, 30, 1);
  ctx.fillRect(2, 2, 1, 60);
  ctx.fillRect(34, 2, 28, 1);
  ctx.fillRect(34, 2, 1, 60);

  // Panel shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(2, 61, 30, 1);
  ctx.fillRect(31, 2, 1, 60);
  ctx.fillRect(34, 61, 28, 1);
  ctx.fillRect(61, 2, 1, 60);

  // Rivets in corners
  ctx.fillStyle = "#4a3828";
  const rivets = [
    [5, 5], [29, 5], [5, 58], [29, 58],
    [37, 5], [59, 5], [37, 58], [59, 58],
    [17, 32], [48, 32],
  ];
  for (const [rx, ry] of rivets) {
    ctx.fillRect(rx, ry, 2, 2);
    ctx.fillStyle = "#2a1810";
    ctx.fillRect(rx + 1, ry + 1, 1, 1);
    ctx.fillStyle = "#4a3828";
  }

  // Scratches
  ctx.fillStyle = "rgba(100, 60, 20, 0.3)";
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(Math.random() * 60);
    const y = Math.floor(Math.random() * 60);
    ctx.fillRect(x, y, 3 + Math.floor(Math.random() * 4), 1);
  }

  return canvas;
}

/**
 * DOOM stone floor
 */
export function createFloorTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Base gray
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(0, 0, 64, 64);

  // Stone tiles
  const tileSize = 32;
  for (let y = 0; y < 64; y += tileSize) {
    for (let x = 0; x < 64; x += tileSize) {
      // Tile base with variation
      const shade = 30 + Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgb(${shade + 10}, ${shade + 10}, ${shade + 10})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
      // Tile edge
      ctx.fillStyle = "rgba(20, 20, 20, 0.6)";
      ctx.fillRect(x, y + tileSize - 1, tileSize, 1);
      ctx.fillRect(x + tileSize - 1, y, 1, tileSize);
    }
  }

  // Cracks & stains
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  for (let i = 0; i < 15; i++) {
    const x = Math.floor(Math.random() * 64);
    const y = Math.floor(Math.random() * 64);
    ctx.fillRect(x, y, 1, 2);
  }
  // Blood stain
  ctx.fillStyle = "rgba(80, 10, 0, 0.4)";
  ctx.fillRect(20, 30, 4, 3);
  ctx.fillRect(22, 34, 2, 2);

  return canvas;
}

/**
 * DOOM ceiling (dark concrete with support beams)
 */
export function createCeilingTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 64, 64);

  // Support grid
  ctx.fillStyle = "#2a2520";
  ctx.fillRect(0, 0, 64, 4);
  ctx.fillRect(0, 60, 64, 4);
  ctx.fillRect(0, 0, 4, 64);
  ctx.fillRect(60, 0, 4, 64);
  ctx.fillRect(30, 0, 4, 64);
  ctx.fillRect(0, 30, 64, 4);

  // Rivets
  ctx.fillStyle = "#4a3828";
  const rivets = [[2, 2], [62, 2], [2, 62], [62, 62], [32, 2], [32, 62], [2, 32], [62, 32], [32, 32]];
  for (const [rx, ry] of rivets) {
    ctx.fillRect(rx - 1, ry - 1, 2, 2);
  }

  return canvas;
}

/**
 * Wooden crate with metal bands
 */
export function createCrateTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Wood base
  ctx.fillStyle = "#6a3a18";
  ctx.fillRect(0, 0, 64, 64);

  // Wood planks (horizontal)
  for (let y = 0; y < 64; y += 8) {
    const shade = Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgb(${100 + shade}, ${50 + shade / 2}, ${20})`;
    ctx.fillRect(0, y + 1, 64, 6);
    // Plank line
    ctx.fillStyle = "rgba(20, 5, 0, 0.7)";
    ctx.fillRect(0, y + 7, 64, 1);
  }

  // Metal corner brackets
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(0, 0, 6, 64);
  ctx.fillRect(58, 0, 6, 64);
  ctx.fillRect(0, 0, 64, 6);
  ctx.fillRect(0, 58, 64, 6);

  // Metal band rivets
  ctx.fillStyle = "#5a4838";
  const rivets = [
    [2, 2], [2, 14], [2, 28], [2, 42], [2, 56],
    [60, 2], [60, 14], [60, 28], [60, 42], [60, 56],
    [14, 2], [28, 2], [42, 2],
    [14, 60], [28, 60], [42, 60],
  ];
  for (const [rx, ry] of rivets) {
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Wood grain
  ctx.fillStyle = "rgba(40, 15, 0, 0.4)";
  for (let i = 0; i < 10; i++) {
    const x = 8 + Math.floor(Math.random() * 48);
    const y = Math.floor(Math.random() * 64);
    ctx.fillRect(x, y, 3, 1);
  }

  return canvas;
}

/**
 * Red toxic barrel (DOOM iconic)
 */
export function createBarrelTexture(variant: "red" | "green" = "red"): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const main = variant === "red" ? "#aa2010" : "#20aa30";
  const dark = variant === "red" ? "#601008" : "#106020";
  const light = variant === "red" ? "#cc3020" : "#40cc50";

  // Base
  ctx.fillStyle = main;
  ctx.fillRect(0, 0, 64, 64);

  // Metal bands (top, middle, bottom)
  ctx.fillStyle = "#3a3028";
  ctx.fillRect(0, 4, 64, 5);
  ctx.fillRect(0, 30, 64, 5);
  ctx.fillRect(0, 55, 64, 5);

  // Band highlight
  ctx.fillStyle = "rgba(200, 180, 120, 0.3)";
  ctx.fillRect(0, 4, 64, 1);
  ctx.fillRect(0, 30, 64, 1);
  ctx.fillRect(0, 55, 64, 1);

  // Vertical highlight (cylinder look)
  ctx.fillStyle = light;
  ctx.fillRect(10, 10, 3, 44);

  // Vertical shadow
  ctx.fillStyle = dark;
  ctx.fillRect(52, 10, 3, 44);

  // Warning symbols (yellow triangle)
  ctx.fillStyle = "#e0c020";
  ctx.beginPath();
  ctx.moveTo(28, 14);
  ctx.lineTo(36, 14);
  ctx.lineTo(32, 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.fillRect(31, 16, 2, 4);
  ctx.fillRect(31, 21, 2, 1);

  // Warning label below (yellow stripe)
  ctx.fillStyle = "#e0c020";
  ctx.fillRect(8, 38, 48, 4);
  ctx.fillStyle = "#000";
  for (let i = 8; i < 56; i += 6) {
    ctx.fillRect(i, 38, 3, 4);
  }

  // Rust stains
  ctx.fillStyle = "rgba(40, 10, 0, 0.5)";
  for (let i = 0; i < 8; i++) {
    const x = Math.floor(Math.random() * 64);
    const y = 10 + Math.floor(Math.random() * 44);
    ctx.fillRect(x, y, 2, 1);
  }

  return canvas;
}

// Exported texture factory functions using pixel canvas + nearest filter
export const pixelTextures = {
  brickWall: (rx = 1, ry = 1) => makePixelTexture(createBrickWallTexture(), rx, ry),
  metalPanel: (rx = 1, ry = 1) => makePixelTexture(createMetalPanelTexture(), rx, ry),
  floor: (rx = 1, ry = 1) => makePixelTexture(createFloorTexture(), rx, ry),
  ceiling: (rx = 1, ry = 1) => makePixelTexture(createCeilingTexture(), rx, ry),
  crate: () => makePixelTexture(createCrateTexture(), 1, 1),
  barrel: (variant: "red" | "green" = "red") =>
    makePixelTexture(createBarrelTexture(variant), 1, 1),
};
