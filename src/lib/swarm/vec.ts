import type { Vec } from "./types";

export function vec(x = 0, y = 0): Vec {
  return { x, y };
}

export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function mul(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s };
}

export function mag(a: Vec): number {
  return Math.hypot(a.x, a.y);
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function norm(a: Vec): Vec {
  const m = mag(a);
  return m > 1e-6 ? { x: a.x / m, y: a.y / m } : { x: 0, y: 0 };
}

export function limit(a: Vec, max: number): Vec {
  const m = mag(a);
  return m > max ? mul(norm(a), max) : a;
}

export function angleOf(a: Vec): number {
  return Math.atan2(a.y, a.x);
}

export function randDir(): Vec {
  const a = Math.random() * Math.PI * 2;
  return { x: Math.cos(a), y: Math.sin(a) };
}
