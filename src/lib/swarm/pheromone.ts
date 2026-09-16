import type { Vec } from "./types";

export interface PheromoneGrid {
  data: Float32Array;
  w: number;
  h: number;
  cell: number;
}

export function createGrid(width: number, height: number, cell = 12): PheromoneGrid {
  const w = Math.max(1, Math.ceil(width / cell));
  const h = Math.max(1, Math.ceil(height / cell));
  return { data: new Float32Array(w * h), w, h, cell };
}

export function deposit(grid: PheromoneGrid, pos: Vec, amount: number) {
  const gx = Math.floor(pos.x / grid.cell);
  const gy = Math.floor(pos.y / grid.cell);
  if (gx < 0 || gy < 0 || gx >= grid.w || gy >= grid.h) return;
  const i = gy * grid.w + gx;
  grid.data[i] = Math.min(1, grid.data[i] + amount);
}

export function strength(grid: PheromoneGrid, pos: Vec): number {
  const gx = Math.floor(pos.x / grid.cell);
  const gy = Math.floor(pos.y / grid.cell);
  if (gx < 0 || gy < 0 || gx >= grid.w || gy >= grid.h) return 0;
  return grid.data[gy * grid.w + gx];
}

export function gradient(grid: PheromoneGrid, pos: Vec): Vec {
  const gx = Math.floor(pos.x / grid.cell);
  const gy = Math.floor(pos.y / grid.cell);
  if (gx <= 0 || gy <= 0 || gx >= grid.w - 1 || gy >= grid.h - 1) return { x: 0, y: 0 };
  const left = grid.data[gy * grid.w + (gx - 1)];
  const right = grid.data[gy * grid.w + (gx + 1)];
  const up = grid.data[(gy - 1) * grid.w + gx];
  const down = grid.data[(gy + 1) * grid.w + gx];
  return { x: (right - left) * 2, y: (down - up) * 2 };
}

export function decay(grid: PheromoneGrid, rate: number) {
  for (let i = 0; i < grid.data.length; i++) {
    grid.data[i] *= 1 - rate;
    if (grid.data[i] < 0.001) grid.data[i] = 0;
  }
}

export function diffuse(grid: PheromoneGrid, rate: number) {
  const next = new Float32Array(grid.data.length);
  for (let y = 1; y < grid.h - 1; y++) {
    for (let x = 1; x < grid.w - 1; x++) {
      const i = y * grid.w + x;
      const n =
        (grid.data[(y - 1) * grid.w + x] +
          grid.data[(y + 1) * grid.w + x] +
          grid.data[y * grid.w + (x - 1)] +
          grid.data[y * grid.w + (x + 1)]) /
        4;
      next[i] = grid.data[i] * (1 - rate) + n * rate;
    }
  }
  grid.data = next;
}

export function total(grid: PheromoneGrid): number {
  let s = 0;
  for (let i = 0; i < grid.data.length; i++) s += grid.data[i];
  return s;
}
