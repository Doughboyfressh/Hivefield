import {
  DEFAULT_CONFIG,
  ROLE_COLOR,
  ROLES,
  type Agent,
  type Behavior,
  type Cluster,
  type HiveEvent,
  type HiveNote,
  type Metrics,
  type Resource,
  type Role,
  type Structure,
  type SwarmConfig,
  type Threat,
  type Vec,
  type WorldClock,
} from "./types";
import { add, dist, limit, mag, mul, norm, randDir, sub, vec } from "./vec";
import { createNet, crossover, forward, mixTraits, randomTraits } from "./neural";
import {
  createGrid,
  decay,
  deposit,
  diffuse,
  gradient,
  strength,
  total,
  type PheromoneGrid,
} from "./pheromone";

const TRAIL = 18;
const Q_ACTIONS = ["explore", "seek", "flee", "talk", "rest", "follow"] as const;
type QAction = (typeof Q_ACTIONS)[number];

const NAMES: Record<Role, string[]> = {
  coordinator: ["Meridian", "Axon", "Helix-0", "Prime"],
  explorer: ["Kepler", "Vela", "Rift", "Iota", "Nadir"],
  worker: ["Anvil", "Loom", "Forge", "Hearth", "Quern"],
  scout: ["Vesper", "Pike", "Wraith", "Ash"],
  carrier: ["Helix", "Porter", "Vessel", "Ark"],
};

export class SwarmEngine {
  w = 960;
  h = 640;
  config: SwarmConfig = { ...DEFAULT_CONFIG };
  agents: Agent[] = [];
  resources: Resource[] = [];
  threats: Threat[] = [];
  structures: Structure[] = [];
  events: HiveEvent[] = [];
  hive: HiveNote[] = [];
  clusters: Cluster[] = [];
  pheromone: PheromoneGrid = createGrid(960, 640);
  world: WorldClock = {
    time: 8,
    day: 1,
    timeOfDay: "day",
    season: "spring",
    weather: "clear",
    temperature: 18,
    visibility: 1,
  };
  generation = 1;
  messages = 0;
  tick = 0;
  time = 0;
  eventCounter = 0;
  idCounter = 0;
  private qtable = new Map<string, Record<string, number>>();
  private qExplore = 0.3;
  private lastEvolve = 0;
  private lastCluster = 0;

  constructor() {
    this.reset();
  }

  resize(w: number, h: number) {
    this.w = Math.max(360, w);
    this.h = Math.max(280, h);
    this.pheromone = createGrid(this.w, this.h, 12);
  }

  reset(cfg?: Partial<SwarmConfig>) {
    if (cfg) this.config = { ...this.config, ...cfg };
    this.agents = [];
    this.resources = [];
    this.threats = [];
    this.structures = [];
    this.events = [];
    this.hive = [];
    this.clusters = [];
    this.messages = 0;
    this.tick = 0;
    this.time = 0;
    this.generation = 1;
    this.idCounter = 0;
    this.qtable.clear();
    this.qExplore = 0.3;
    this.pheromone = createGrid(this.w, this.h, 12);
    this.spawnAgents(this.config.agentCount);
    this.seedResources(10);
    this.log("system", "Swarm reconstituted.", "ok");
  }

  private nid(prefix: string) {
    return `${prefix}-${this.idCounter++}`;
  }

  log(
    kind: HiveEvent["kind"],
    text: string,
    severity: HiveEvent["severity"] = "info",
  ) {
    this.events.unshift({
      id: this.nid("evt"),
      at: Date.now(),
      kind,
      text,
      severity,
    });
    if (this.events.length > 80) this.events.length = 80;
  }

  remember(text: string) {
    this.hive.unshift({ id: this.nid("mem"), text, at: Date.now() });
    if (this.hive.length > 40) this.hive.length = 40;
  }

  private spawnAgents(n: number) {
    const nameIdx: Record<Role, number> = {
      explorer: 0,
      worker: 0,
      coordinator: 0,
      scout: 0,
      carrier: 0,
    };
    for (let i = 0; i < n; i++) {
      const role = ROLES[i % ROLES.length];
      const names = NAMES[role];
      const name = names[nameIdx[role]++ % names.length] + (i >= 5 ? `-${i}` : "");
      const a = (i / n) * Math.PI * 2;
      const r = Math.min(this.w, this.h) * (0.12 + Math.random() * 0.18);
      this.agents.push(this.makeAgent(role, name, {
        x: this.w * 0.5 + Math.cos(a) * r,
        y: this.h * 0.5 + Math.sin(a) * r,
      }));
    }
  }

  private makeAgent(role: Role, name: string, position: Vec): Agent {
    return {
      id: this.nid("a"),
      role,
      name,
      position,
      velocity: mul(randDir(), 20 + Math.random() * 30),
      acc: vec(),
      maxSpeed: 55 + Math.random() * 25,
      maxForce: 180,
      radius: 6,
      state: "moving",
      energy: 70 + Math.random() * 30,
      perception: this.config.perceptionRadius * (0.85 + Math.random() * 0.3),
      trail: [],
      color: ROLE_COLOR[role],
      pulse: Math.random() * Math.PI * 2,
      fitness: 0,
      age: 0,
      traits: randomTraits(),
      brain: createNet(),
      connections: [],
      clusterId: -1,
      generation: this.generation,
    };
  }

  setCount(n: number) {
    n = Math.max(5, Math.min(80, Math.round(n)));
    this.config.agentCount = n;
    while (this.agents.length < n) {
      const role = ROLES[this.agents.length % ROLES.length];
      this.agents.push(
        this.makeAgent(role, `${role}-${this.agents.length}`, {
          x: this.w * 0.3 + Math.random() * this.w * 0.4,
          y: this.h * 0.3 + Math.random() * this.h * 0.4,
        }),
      );
    }
    while (this.agents.length > n) this.agents.pop();
  }

  seedResources(count: number) {
    const types: Resource["type"][] = ["energy", "data", "material"];
    for (let i = 0; i < count; i++) {
      this.resources.push({
        id: this.nid("r"),
        position: {
          x: 50 + Math.random() * (this.w - 100),
          y: 50 + Math.random() * (this.h - 100),
        },
        amount: 40 + Math.random() * 60,
        type: types[i % 3],
        discovered: false,
        deplete: 8 + Math.random() * 10,
      });
    }
  }

  addResource(x: number, y: number) {
    this.resources.push({
      id: this.nid("r"),
      position: { x, y },
      amount: 60 + Math.random() * 40,
      type: (["energy", "data", "material"] as const)[Math.floor(Math.random() * 3)],
      discovered: false,
      deplete: 10,
    });
    this.log("system", "Resource dropped into the field.", "info");
  }

  addThreat(x: number, y: number) {
    this.threats.push({
      id: this.nid("t"),
      position: { x, y },
      radius: 34,
      severity: 0.7,
      type: "hazard",
    });
    this.log("threat", "Hazard placed.", "warn");
  }

  addStructure(x: number, y: number) {
    const types: Structure["type"][] = ["wall", "tower", "beacon", "shelter"];
    this.structures.push({
      id: this.nid("s"),
      type: types[Math.floor(Math.random() * types.length)],
      position: { x, y },
      size: 22,
      progress: 0,
      completed: false,
    });
    this.log("build", "Construction site opened.", "info");
  }

  setBehavior(b: Behavior) {
    this.config.behavior = b;
    this.config.pheromoneEnabled = b === "stigmergy" || this.config.pheromoneEnabled;
    this.config.neuralNetEnabled = b === "neural_evolution" || this.config.neuralNetEnabled;
    this.config.evolutionEnabled = b === "neural_evolution" || this.config.evolutionEnabled;
    this.log("system", `Behavior set to ${b.replace("_", " ")}.`, "info");
  }

  applyAction(action: {
    type: string;
    param?: string;
    value?: number;
    behavior?: string;
    feature?: string;
    enabled?: boolean;
  }): string {
    switch (action.type) {
      case "set_behavior":
        if (action.behavior) this.setBehavior(action.behavior as Behavior);
        return `Behavior → ${action.behavior}`;
      case "adjust_param": {
        const key = action.param as keyof SwarmConfig | undefined;
        if (key && typeof this.config[key] === "number" && action.value != null) {
          (this.config as unknown as Record<string, number>)[key] = action.value;
          return `${key} → ${action.value}`;
        }
        return "Unknown parameter";
      }
      case "toggle_feature": {
        const f = action.feature as keyof SwarmConfig | undefined;
        if (f && typeof this.config[f] === "boolean") {
          (this.config as unknown as Record<string, boolean>)[f] =
            action.enabled ?? !this.config[f];
          return `${f} ${this.config[f] ? "on" : "off"}`;
        }
        return "Unknown feature";
      }
      case "spawn_resource":
        this.seedResources(3);
        return "Seeded 3 resources";
      default:
        return `Ignored ${action.type}`;
    }
  }

  private neighbors(agent: Agent, radius: number, hash: Map<number, Agent[]>): Agent[] {
    const cell = 80;
    const gx = Math.floor(agent.position.x / cell);
    const gy = Math.floor(agent.position.y / cell);
    const r = Math.ceil(radius / cell);
    const out: Agent[] = [];
    const r2 = radius * radius;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const bucket = hash.get(((gx + dx) & 0xffff) | ((gy + dy) << 16));
        if (!bucket) continue;
        for (const o of bucket) {
          if (o.id === agent.id) continue;
          const ddx = o.position.x - agent.position.x;
          const ddy = o.position.y - agent.position.y;
          if (ddx * ddx + ddy * ddy <= r2) out.push(o);
        }
      }
    }
    return out;
  }

  private hashAgents(): Map<number, Agent[]> {
    const cell = 80;
    const map = new Map<number, Agent[]>();
    for (const a of this.agents) {
      const gx = Math.floor(a.position.x / cell);
      const gy = Math.floor(a.position.y / cell);
      const key = (gx & 0xffff) | (gy << 16);
      const b = map.get(key);
      if (b) b.push(a);
      else map.set(key, [a]);
    }
    return map;
  }

  step(dt: number) {
    const cfg = this.config;
    const scaled = dt * cfg.speed;
    this.tick++;
    this.time += scaled;

    if (cfg.environmentEnabled) this.tickWorld(scaled);

    const hash = this.hashAgents();
    const perc = cfg.perceptionRadius * (cfg.environmentEnabled ? this.world.visibility : 1);

    if (cfg.pheromoneEnabled) {
      decay(this.pheromone, 0.012);
      if (this.tick % 4 === 0) diffuse(this.pheromone, 0.08);
    }

    let links = 0;
    for (const a of this.agents) {
      a.connections = [];
      const near = this.neighbors(a, cfg.communicationRange, hash);
      for (const o of near) {
        a.connections.push(o.id);
        links++;
      }
    }

    for (const a of this.agents) {
      const nb = this.neighbors(a, perc, hash);
      this.updateAgent(a, nb, scaled, perc);
    }

    if (cfg.qLearningEnabled && this.tick % 20 === 0) {
      this.qExplore = Math.max(0.05, this.qExplore * 0.999);
    }

    if (cfg.evolutionEnabled && this.time - this.lastEvolve > 18) {
      this.evolve();
      this.lastEvolve = this.time;
    }

    if (this.time - this.lastCluster > 2.5) {
      this.recluster();
      this.lastCluster = this.time;
    }

    if (cfg.lifecycleEnabled) this.lifecycle();

    // World wind
    if (cfg.environmentEnabled && cfg.windStrength > 0) {
      const wx = Math.cos(cfg.windDirection) * cfg.windStrength * 18;
      const wy = Math.sin(cfg.windDirection) * cfg.windStrength * 18;
      for (const a of this.agents) {
        a.velocity.x += wx * scaled;
        a.velocity.y += wy * scaled;
      }
    }

    void links;
  }

  private tickWorld(dt: number) {
    this.world.time += dt * 0.15;
    if (this.world.time >= 24) {
      this.world.time -= 24;
      this.world.day++;
      if (this.world.day % 8 === 0) {
        const seasons: WorldClock["season"][] = ["spring", "summer", "autumn", "winter"];
        this.world.season = seasons[(seasons.indexOf(this.world.season) + 1) % 4];
      }
    }
    const t = this.world.time;
    this.world.timeOfDay =
      t >= 5 && t < 8 ? "dawn" : t >= 8 && t < 18 ? "day" : t >= 18 && t < 21 ? "dusk" : "night";
    if (Math.random() < 0.0008 * dt * 60) {
      const w: WorldClock["weather"][] = ["clear", "rain", "storm", "fog", "wind"];
      this.world.weather = w[Math.floor(Math.random() * w.length)];
      this.log("system", `Weather shifted to ${this.world.weather}.`, "info");
    }
    const visW: Record<WorldClock["weather"], number> = {
      clear: 1,
      rain: 0.72,
      storm: 0.45,
      fog: 0.32,
      wind: 0.88,
    };
    const visT = this.world.timeOfDay === "night" ? 0.4 : this.world.timeOfDay === "dusk" ? 0.7 : 1;
    this.world.visibility = visW[this.world.weather] * visT;
    const base: Record<WorldClock["season"], number> = {
      spring: 14,
      summer: 24,
      autumn: 10,
      winter: 1,
    };
    this.world.temperature = base[this.world.season] + (t > 12 && t < 16 ? 4 : -2);
  }

  private steer(agent: Agent, desired: Vec): Vec {
    return limit(sub(desired, agent.velocity), agent.maxForce);
  }

  private seek(agent: Agent, target: Vec): Vec {
    return this.steer(agent, mul(norm(sub(target, agent.position)), agent.maxSpeed));
  }

  private updateAgent(agent: Agent, nb: Agent[], dt: number, perc: number) {
    const cfg = this.config;
    let force = vec();

    // Boids
    let sep = vec();
    let ali = vec();
    let coh = vec();
    let sepN = 0;
    let aliN = 0;
    const sepR = perc * 0.45;
    for (const o of nb) {
      const d = dist(agent.position, o.position);
      if (d > 0 && d < sepR) {
        sep = add(sep, mul(norm(sub(agent.position, o.position)), 1 / d));
        sepN++;
      }
      ali = add(ali, o.velocity);
      coh = add(coh, o.position);
      aliN++;
    }
    if (sepN) force = add(force, mul(this.steer(agent, mul(norm(sep), agent.maxSpeed)), cfg.separationWeight * 90));
    if (aliN) {
      force = add(
        force,
        mul(this.steer(agent, mul(norm(divSafe(ali, aliN)), agent.maxSpeed)), cfg.alignmentWeight * 70 * agent.traits.sociability),
      );
      const center = divSafe(coh, aliN);
      force = add(
        force,
        mul(this.seek(agent, center), cfg.cohesionWeight * 55 * agent.traits.sociability),
      );
    }

    // Edges
    const m = 42;
    const edge = vec();
    if (agent.position.x < m) edge.x = agent.maxSpeed;
    if (agent.position.x > this.w - m) edge.x = -agent.maxSpeed;
    if (agent.position.y < m) edge.y = agent.maxSpeed;
    if (agent.position.y > this.h - m) edge.y = -agent.maxSpeed;
    if (edge.x || edge.y) force = add(force, this.steer(agent, mul(norm(edge), agent.maxSpeed * 1.4)));

    // Threats
    for (const th of this.threats) {
      const d = dist(agent.position, th.position);
      if (d < th.radius + perc * 0.6) {
        force = add(force, mul(norm(sub(agent.position, th.position)), agent.maxForce * 1.6 * agent.traits.caution));
        agent.state = "fleeing";
      }
    }

    force = add(force, this.behaviorForce(agent, nb, dt));

    if (cfg.qLearningEnabled) {
      force = add(force, this.qForce(agent, nb));
    }

    if (cfg.pheromoneEnabled && (cfg.behavior === "stigmergy" || cfg.behavior === "resource_gathering")) {
      const g = gradient(this.pheromone, agent.position);
      force = add(force, mul(g, 80));
    }

    // Construction
    if (cfg.constructionEnabled) {
      for (const s of this.structures) {
        if (s.completed) continue;
        if (dist(agent.position, s.position) < s.size + 28) {
          s.progress = Math.min(1, s.progress + dt * 0.12 * agent.traits.efficiency);
          agent.state = "building";
          if (s.progress >= 1 && !s.completed) {
            s.completed = true;
            this.log("build", `${s.type} completed.`, "ok");
          }
        }
      }
    }

    agent.acc = force;
    agent.velocity = limit(add(agent.velocity, mul(force, dt)), agent.maxSpeed * cfg.maxSpeed * 0.45);
    agent.position = add(agent.position, mul(agent.velocity, dt));
    agent.pulse += dt * (agent.state === "thinking" ? 5 : 2);
    agent.age += dt;
    agent.energy = Math.max(
      0,
      Math.min(
        100,
        agent.energy - dt * 1.6 * (1 - agent.traits.efficiency * 0.5) + (agent.state === "idle" ? dt * 4 : 0),
      ),
    );

    if (mag(agent.velocity) > 8) {
      agent.trail.push({ ...agent.position });
      if (agent.trail.length > TRAIL) agent.trail.shift();
    } else if (agent.trail.length) agent.trail.shift();

    this.forage(agent, perc);

    if (agent.connections.length && Math.random() < 0.01) {
      agent.state = "communicating";
      this.messages += 1;
    } else if (agent.state === "communicating" && Math.random() < 0.08) {
      agent.state = "moving";
    }

    if (cfg.pheromoneEnabled && (agent.state === "working" || agent.state === "alert")) {
      deposit(this.pheromone, agent.position, 0.22);
    }
  }

  private forage(agent: Agent, perc: number) {
    for (const r of this.resources) {
      const d = dist(agent.position, r.position);
      if (!r.discovered && d < perc) {
        r.discovered = true;
        r.discoveredBy = agent.id;
        agent.state = "alert";
        agent.fitness += 10;
        this.log("discovery", `${agent.name} found ${r.type}.`, "ok");
        this.remember(`${r.type} at ${Math.round(r.position.x)},${Math.round(r.position.y)}`);
      }
      if (r.discovered && r.amount > 0 && d < 16) {
        const take = Math.min(r.amount, r.deplete * 0.016);
        r.amount -= take;
        agent.energy = Math.min(100, agent.energy + take * 0.8 * agent.traits.efficiency);
        agent.state = "working";
        agent.fitness += 0.4;
        if (r.amount <= 0) this.log("discovery", `${r.type} depleted.`, "info");
      }
    }
  }

  private behaviorForce(agent: Agent, nb: Agent[], dt: number): Vec {
    const cfg = this.config;
    const w = this.w;
    const h = this.h;
    switch (cfg.behavior) {
      case "search_rescue": {
        if (agent.role === "explorer" || agent.role === "scout") {
          return mul(randDir(), agent.maxForce * 0.25 * cfg.explorationWeight);
        }
        const disc = this.resources.filter((r) => r.discovered && r.amount > 0);
        if (!disc.length) return vec();
        const nearest = disc.reduce((c, r) =>
          dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c,
        );
        return this.seek(agent, nearest.position);
      }
      case "resource_gathering": {
        const avail = this.resources.filter((r) => r.amount > 0);
        if (!avail.length) return mul(randDir(), agent.maxForce * 0.2);
        const nearest = avail.reduce((c, r) =>
          dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c,
        );
        return this.seek(agent, nearest.position);
      }
      case "formation": {
        const sorted = [...this.agents].sort((a, b) => a.id.localeCompare(b.id));
        const idx = sorted.findIndex((a) => a.id === agent.id);
        const leader = sorted[0];
        if (idx <= 0) {
          return mul(
            { x: Math.cos(this.time * 0.35), y: Math.sin(this.time * 0.35) },
            agent.maxForce * 0.35,
          );
        }
        const side = idx % 2 === 0 ? 1 : -1;
        const row = Math.ceil(idx / 2);
        const heading = mag(leader.velocity) > 4 ? norm(leader.velocity) : { x: 1, y: 0 };
        const perp = { x: -heading.y, y: heading.x };
        const target = add(leader.position, add(mul(heading, -row * 26), mul(perp, side * 22)));
        return this.seek(agent, target);
      }
      case "patrol": {
        const gs = 6;
        const i = this.agents.indexOf(agent);
        const row = Math.floor(i / gs) % gs;
        const col = i % gs;
        const cw = w / gs;
        const ch = h / gs;
        return this.seek(agent, {
          x: cw * (col + 0.5) + Math.sin(this.time * 0.6 + i) * cw * 0.28,
          y: ch * (row + 0.5) + Math.cos(this.time * 0.6 + i) * ch * 0.28,
        });
      }
      case "consensus":
        return this.seek(agent, {
          x: w / 2 + Math.sin(this.time * 0.25) * w * 0.22,
          y: h / 2 + Math.cos(this.time * 0.32) * h * 0.18,
        });
      case "predator_prey": {
        if (agent.role === "scout") {
          const prey = this.agents.filter((o) => o.role !== "scout");
          if (!prey.length) return vec();
          const c = prey.reduce((s, o) => add(s, o.position), vec());
          return mul(this.seek(agent, divSafe(c, prey.length)), 1.35);
        }
        const preds = nb.filter((o) => o.role === "scout");
        let flee = vec();
        for (const p of preds) {
          if (dist(agent.position, p.position) < agent.perception * 1.4) {
            flee = add(flee, mul(norm(sub(agent.position, p.position)), agent.maxSpeed * 1.6));
            agent.state = "fleeing";
          }
        }
        return mag(flee) ? flee : vec();
      }
      case "neural_evolution": {
        const res = this.resources.filter((r) => r.amount > 0);
        const nearest = res.length
          ? res.reduce((c, r) => (dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c))
          : null;
        const td = nearest ? dist(agent.position, nearest.position) : 250;
        const ang = nearest
          ? Math.atan2(nearest.position.y - agent.position.y, nearest.position.x - agent.position.x)
          : 0;
        const ph = cfg.pheromoneEnabled ? strength(this.pheromone, agent.position) : 0;
        const out = forward(agent.brain, [
          td / 500,
          ang / Math.PI,
          agent.energy / 100,
          nb.length / 10,
          ph,
          mag(agent.velocity) / 80,
        ]);
        const wander = mul(randDir(), ((out[2] + 1) / 2) * 40);
        return add({ x: out[0] * agent.maxForce, y: out[1] * agent.maxForce }, wander);
      }
      case "stigmergy": {
        const g = gradient(this.pheromone, agent.position);
        const follow = mul(g, 110);
        const explore = mul(randDir(), agent.maxForce * 0.2 * cfg.explorationWeight);
        return add(follow, explore);
      }
      default:
        return mul(randDir(), agent.maxForce * 0.08 * cfg.explorationWeight);
    }
    void dt;
  }

  private qForce(agent: Agent, nb: Agent[]): Vec {
    const state = this.qState(agent, nb);
    const action = this.qChoose(agent.id, state);
    const avail = this.resources.filter((r) => r.amount > 0);
    switch (action) {
      case "explore":
        return mul(randDir(), 50);
      case "seek": {
        if (!avail.length) return vec();
        const n = avail.reduce((c, r) =>
          dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c,
        );
        return this.seek(agent, n.position);
      }
      case "flee": {
        if (!this.threats.length) return vec();
        const th = this.threats.reduce((c, t) =>
          dist(agent.position, t.position) < dist(agent.position, c.position) ? t : c,
        );
        return mul(norm(sub(agent.position, th.position)), 70);
      }
      case "talk":
        agent.state = "communicating";
        return vec();
      case "rest":
        agent.energy = Math.min(100, agent.energy + 0.4);
        return mul(agent.velocity, -0.4);
      case "follow":
        return mul(gradient(this.pheromone, agent.position), 90);
    }
  }

  private qState(agent: Agent, nb: Agent[]): string {
    if (agent.energy < 30) return "low";
    if (this.threats.some((t) => dist(agent.position, t.position) < agent.perception)) return "threat";
    if (nb.length === 0) return "iso";
    if (nb.length > 6) return "crowd";
    if (agent.energy > 70) return "high";
    return "mid";
  }

  private qChoose(id: string, state: string): QAction {
    if (Math.random() < this.qExplore) {
      return Q_ACTIONS[Math.floor(Math.random() * Q_ACTIONS.length)];
    }
    const table = this.qEnsure(id, state);
    let best: QAction = "explore";
    let v = -Infinity;
    for (const a of Q_ACTIONS) {
      if (table[a] > v) {
        v = table[a];
        best = a;
      }
    }
    return best;
  }

  private qEnsure(id: string, state: string): Record<string, number> {
    const key = `${id}:${state}`;
    let t = this.qtable.get(key);
    if (!t) {
      t = Object.fromEntries(Q_ACTIONS.map((a) => [a, 0]));
      this.qtable.set(key, t);
    }
    return t;
  }

  private evolve() {
    if (this.agents.length < 6) return;
    const sorted = [...this.agents].sort((a, b) => b.fitness - a.fitness);
    const keep = sorted.slice(0, Math.ceil(sorted.length * 0.5));
    const rate = this.config.evolutionRate;
    for (let i = keep.length; i < sorted.length; i++) {
      const p1 = keep[Math.floor(Math.random() * keep.length)];
      const p2 = keep[Math.floor(Math.random() * keep.length)];
      const child = sorted[i];
      child.brain = crossover(p1.brain, p2.brain, rate);
      child.traits = mixTraits(p1.traits, p2.traits, rate);
      child.fitness = 0;
      child.age = 0;
      child.generation = this.generation + 1;
      child.energy = 80;
    }
    this.generation += 1;
    this.log("evolution", `Generation ${this.generation} — fittest bred.`, "ok");
  }

  private lifecycle() {
    for (const a of this.agents) {
      if (a.energy <= 0 || (this.config.lifecycleEnabled && a.age > 90 && a.energy < 15)) {
        const parent = [...this.agents].sort((x, y) => y.fitness - x.fitness)[0] ?? a;
        a.brain = crossover(parent.brain, a.brain, 0.12);
        a.traits = mixTraits(parent.traits, a.traits, 0.12);
        a.energy = 70;
        a.age = 0;
        a.fitness = 0;
        a.position = {
          x: this.w * 0.5 + (Math.random() - 0.5) * 80,
          y: this.h * 0.5 + (Math.random() - 0.5) * 80,
        };
        this.log("system", `${a.name} recycled through the hive.`, "warn");
      }
    }
  }

  private recluster() {
    const assigned = new Set<string>();
    const clusters: Cluster[] = [];
    let id = 0;
    const thresh = 92;
    for (const agent of this.agents) {
      if (assigned.has(agent.id)) continue;
      const bag: Agent[] = [];
      const q = [agent];
      assigned.add(agent.id);
      while (q.length) {
        const cur = q.pop()!;
        bag.push(cur);
        for (const o of this.agents) {
          if (!assigned.has(o.id) && dist(cur.position, o.position) < thresh) {
            assigned.add(o.id);
            q.push(o);
          }
        }
      }
      if (bag.length < 3) {
        for (const a of bag) a.clusterId = -1;
        continue;
      }
      const center = divSafe(
        bag.reduce((s, a) => add(s, a.position), vec()),
        bag.length,
      );
      const explorers = bag.filter((a) => a.role === "explorer" || a.role === "scout").length;
      const workers = bag.filter((a) => a.role === "worker" || a.role === "carrier").length;
      const purpose = explorers > workers ? "Exploration" : workers > explorers ? "Gathering" : "Mixed";
      for (const a of bag) a.clusterId = id;
      clusters.push({ id, agentIds: bag.map((a) => a.id), center, purpose });
      id++;
    }
    this.clusters = clusters;
  }

  metrics(): Metrics {
    const n = this.agents.length || 1;
    const avgSpeed = this.agents.reduce((s, a) => s + mag(a.velocity), 0) / n;
    const avgEnergy = this.agents.reduce((s, a) => s + a.energy, 0) / n;
    const avgFitness = this.agents.reduce((s, a) => s + a.fitness, 0) / n;
    const center = divSafe(
      this.agents.reduce((s, a) => add(s, a.position), vec()),
      n,
    );
    const avgDist = this.agents.reduce((s, a) => s + dist(a.position, center), 0) / n;
    const xs = this.agents.map((a) => a.position.x);
    const ys = this.agents.map((a) => a.position.y);
    const coverage =
      (Math.max(...xs, 0) - Math.min(...xs, 0)) * (Math.max(...ys, 0) - Math.min(...ys, 0));
    let connections = 0;
    for (const a of this.agents) connections += a.connections.length;
    const now = Date.now();
    const eventRate = this.events.filter((e) => now - e.at < 5000).length / 5;
    return {
      avgSpeed: avgSpeed / 10,
      avgEnergy,
      coherence: Math.max(0, 1 - avgDist / 420),
      connections: Math.round(connections / 2),
      resourcesFound: this.resources.filter((r) => r.discovered).length,
      resourcesTotal: this.resources.length,
      avgFitness,
      generation: this.generation,
      messages: this.messages,
      clusters: this.clusters.length,
      structures: this.structures.filter((s) => s.completed).length,
      threats: this.threats.length,
      pheromone: total(this.pheromone),
      qExplore: this.qExplore,
      hiveSize: this.hive.length,
      eventRate,
      coverage,
    };
  }

  snapshot(limitN = 12) {
    return this.agents.slice(0, limitN).map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      energy: Math.round(a.energy),
      state: a.state,
      fitness: Math.round(a.fitness),
      clusterId: a.clusterId,
    }));
  }

  exportState() {
    return {
      config: this.config,
      generation: this.generation,
      hive: this.hive,
      metrics: this.metrics(),
      at: Date.now(),
    };
  }
}

function divSafe(v: Vec, n: number): Vec {
  return n ? { x: v.x / n, y: v.y / n } : vec();
}
