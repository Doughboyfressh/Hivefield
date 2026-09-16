import type { Agent, Resource, Structure, Threat, WorldClock } from "./types";
import type { SwarmEngine } from "./engine";
import { angleOf, mag } from "./vec";

function rgba(hex: string, a: number) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function worldTint(clock: WorldClock): string {
  switch (clock.timeOfDay) {
    case "dawn":
      return "rgba(196,165,116,0.06)";
    case "dusk":
      return "rgba(201,137,122,0.08)";
    case "night":
      return "rgba(4,6,12,0.38)";
    default:
      return "rgba(0,0,0,0)";
  }
}

export function renderSwarm(ctx: CanvasRenderingContext2D, engine: SwarmEngine, selectedId: string | null) {
  const { w, h, agents, resources, threats, structures, config, world, pheromone } = engine;
  const cx = w * 0.5;
  const cy = h * 0.5;

  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(w, h) * 0.72);
  bg.addColorStop(0, "#12141a");
  bg.addColorStop(1, "#08090b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = "rgba(232,234,238,0.035)";
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = (cx % step) - step; x < w + step; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = (cy % step) - step; y < h + step; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  if (config.showHeatmap && config.pheromoneEnabled) {
    const cell = pheromone.cell;
    for (let gy = 0; gy < pheromone.h; gy++) {
      for (let gx = 0; gx < pheromone.w; gx++) {
        const v = pheromone.data[gy * pheromone.w + gx];
        if (v < 0.04) continue;
        ctx.fillStyle = `rgba(140,186,154,${Math.min(0.35, v * 0.45)})`;
        ctx.fillRect(gx * cell, gy * cell, cell, cell);
      }
    }
  }

  if (config.environmentEnabled && config.showHeatmap === false && world.weather === "fog") {
    ctx.fillStyle = "rgba(180,186,196,0.05)";
    ctx.fillRect(0, 0, w, h);
  }

  // Hive core
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(197,206,216,0.2)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 2.8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(197,206,216,0.65)";
  ctx.fill();

  for (const s of structures) drawStructure(ctx, s);
  for (const t of threats) drawThreat(ctx, t);
  for (const r of resources) drawResource(ctx, r, engine.time);

  if (config.showConnections) {
    ctx.lineWidth = 0.8;
    for (const a of agents) {
      for (const id of a.connections) {
        const o = agents.find((x) => x.id === id);
        if (!o || o.id <= a.id) continue;
        const talking = a.state === "communicating" || o.state === "communicating";
        ctx.beginPath();
        ctx.moveTo(a.position.x, a.position.y);
        ctx.lineTo(o.position.x, o.position.y);
        ctx.strokeStyle = talking ? "rgba(197,206,216,0.28)" : "rgba(197,206,216,0.06)";
        ctx.stroke();
      }
    }
  }

  if (config.showTrails) {
    for (const a of agents) drawTrail(ctx, a);
  }
  for (const a of agents) drawAgent(ctx, a, selectedId === a.id, config.showPerception);

  ctx.fillStyle = worldTint(world);
  ctx.fillRect(0, 0, w, h);
}

function drawTrail(ctx: CanvasRenderingContext2D, a: Agent) {
  if (a.trail.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(a.trail[0].x, a.trail[0].y);
  for (let i = 1; i < a.trail.length; i++) ctx.lineTo(a.trail[i].x, a.trail[i].y);
  ctx.strokeStyle = rgba(a.color, 0.22);
  ctx.lineWidth = 1.3;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  a: Agent,
  selected: boolean,
  showPerc: boolean,
) {
  const { x, y } = a.position;
  const heading = mag(a.velocity) > 6 ? angleOf(a.velocity) : -Math.PI / 2;
  const hot = a.state === "thinking" || a.state === "working" || a.state === "alert";

  if (showPerc) {
    ctx.beginPath();
    ctx.arc(x, y, a.perception, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(a.color, 0.08);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, hot ? 14 : 10, 0, Math.PI * 2);
  ctx.fillStyle = rgba(a.color, 0.16 + Math.sin(a.pulse) * 0.04);
  ctx.fill();
  if (selected) {
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(236,238,242,0.55)";
    ctx.stroke();
  }
  ctx.rotate(heading);
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, 5.5);
  ctx.lineTo(-3.5, 0);
  ctx.lineTo(-6, -5.5);
  ctx.closePath();
  ctx.fillStyle = a.color;
  ctx.fill();
  ctx.restore();

  const bw = 16;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x - bw / 2, y + 8, bw, 2);
  ctx.fillStyle = rgba(a.color, 0.9);
  ctx.fillRect(x - bw / 2, y + 8, bw * (a.energy / 100), 2);
}

function drawResource(ctx: CanvasRenderingContext2D, r: Resource, time: number) {
  if (r.amount <= 0) return;
  const { x, y } = r.position;
  const pulse = 6 + Math.sin(time * 2 + x) * 1.4;
  const col =
    r.type === "energy" ? "#8cba9a" : r.type === "data" ? "#7eb8c9" : "#c5ced8";
  ctx.beginPath();
  ctx.arc(x, y, pulse, 0, Math.PI * 2);
  ctx.fillStyle = rgba(col, r.discovered ? 0.22 : 0.08);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = rgba(col, r.discovered ? 0.95 : 0.4);
  ctx.fill();
}

function drawThreat(ctx: CanvasRenderingContext2D, t: Threat) {
  ctx.beginPath();
  ctx.arc(t.position.x, t.position.y, t.radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(201,137,122,0.45)";
  ctx.fillStyle = "rgba(201,137,122,0.08)";
  ctx.fill();
  ctx.stroke();
}

function drawStructure(ctx: CanvasRenderingContext2D, s: Structure) {
  const { x, y } = s.position;
  const size = s.size * (0.35 + s.progress * 0.65);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.rect(-size / 2, -size / 2, size, size);
  ctx.fillStyle = s.completed ? "rgba(197,206,216,0.18)" : "rgba(197,206,216,0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(197,206,216,0.4)";
  ctx.stroke();
  ctx.restore();
}
