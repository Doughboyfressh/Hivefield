import type { NeuralNet, Traits } from "./types";

export function createNet(): NeuralNet {
  return {
    w1: Array.from({ length: 8 }, () => Array.from({ length: 6 }, () => Math.random() * 2 - 1)),
    w2: Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => Math.random() * 2 - 1)),
    b1: Array.from({ length: 8 }, () => Math.random() * 2 - 1),
    b2: Array.from({ length: 4 }, () => Math.random() * 2 - 1),
  };
}

export function forward(net: NeuralNet, inputs: number[]): number[] {
  const hidden = net.b1.map((bias, i) => {
    let s = bias;
    for (let j = 0; j < 6; j++) s += inputs[j] * net.w1[i][j];
    return Math.tanh(s);
  });
  return net.b2.map((bias, i) => {
    let s = bias;
    for (let j = 0; j < 8; j++) s += hidden[j] * net.w2[i][j];
    return Math.tanh(s);
  });
}

function mixRow(a: number[], b: number[], rate: number, amp: number): number[] {
  return a.map((v, i) => {
    const base = Math.random() < 0.5 ? v : (b[i] ?? v);
    return Math.random() < rate ? base + (Math.random() * 2 - 1) * amp : base;
  });
}

export function crossover(p1: NeuralNet, p2: NeuralNet, rate: number): NeuralNet {
  return {
    w1: p1.w1.map((row, i) => mixRow(row, p2.w1[i], rate, 0.3)),
    w2: p1.w2.map((row, i) => mixRow(row, p2.w2[i], rate, 0.3)),
    b1: mixRow(p1.b1, p2.b1, rate, 0.2),
    b2: mixRow(p1.b2, p2.b2, rate, 0.2),
  };
}

export function randomTraits(): Traits {
  return {
    curiosity: Math.random(),
    sociability: Math.random(),
    aggression: Math.random(),
    caution: Math.random(),
    efficiency: 0.35 + Math.random() * 0.65,
  };
}

export function mixTraits(a: Traits, b: Traits, rate: number): Traits {
  const mix = (x: number, y: number) => {
    const base = Math.random() < 0.5 ? x : y;
    const v = Math.random() < rate ? base + (Math.random() * 2 - 1) * 0.2 : base;
    return Math.max(0, Math.min(1, v));
  };
  return {
    curiosity: mix(a.curiosity, b.curiosity),
    sociability: mix(a.sociability, b.sociability),
    aggression: mix(a.aggression, b.aggression),
    caution: mix(a.caution, b.caution),
    efficiency: mix(a.efficiency, b.efficiency),
  };
}
