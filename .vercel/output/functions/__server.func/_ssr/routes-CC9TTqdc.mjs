import { i as __toESM } from "../_runtime.mjs";
import { R as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Radio, c as Hexagon, i as RotateCcw, l as Brain, n as Square, o as Play, r as Send, s as Pause, u as Activity } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CC9TTqdc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.96] [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-raised text-fg shadow-[var(--shadow-border)] hover:bg-surface",
			ghost: "bg-transparent text-muted hover:text-fg hover:bg-raised",
			danger: "bg-danger/15 text-danger hover:bg-danger/25"
		},
		size: {
			sm: "h-8 rounded-sm px-3 text-sm",
			md: "h-10 rounded-md px-4 text-sm",
			lg: "h-11 rounded-md px-5 text-base",
			icon: "size-10 rounded-md"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
var ROLE_COLOR = {
	explorer: "#7eb8c9",
	worker: "#8cba9a",
	coordinator: "#d8dee6",
	scout: "#c9897a",
	carrier: "#9aa3c4"
};
var ROLE_DUTY = {
	coordinator: "Decomposes missions, assigns work, holds the thread.",
	explorer: "Maps territory, researches options, finds leverage.",
	worker: "Produces the deliverable — drafts, specs, plans.",
	scout: "Stress-tests the work. Finds gaps, risks, and lies.",
	carrier: "Packages, compresses, and hands the brief over."
};
var ROLE_TITLE = {
	coordinator: "Coordinator",
	explorer: "Explorer",
	worker: "Worker",
	scout: "Scout",
	carrier: "Carrier"
};
var ROLES = [
	"explorer",
	"worker",
	"coordinator",
	"scout",
	"carrier"
];
var BEHAVIORS = [
	{
		id: "flocking",
		label: "Flocking",
		blurb: "Classic boids: separate, align, cohere."
	},
	{
		id: "search_rescue",
		label: "Search & rescue",
		blurb: "Explorers spread; workers converge on finds."
	},
	{
		id: "resource_gathering",
		label: "Gathering",
		blurb: "Locate and collect scattered resources."
	},
	{
		id: "formation",
		label: "V-formation",
		blurb: "Hold an aerodynamic wedge behind a leader."
	},
	{
		id: "patrol",
		label: "Grid patrol",
		blurb: "Systematic coverage of the field."
	},
	{
		id: "consensus",
		label: "Consensus",
		blurb: "The swarm converges on a moving decision point."
	},
	{
		id: "predator_prey",
		label: "Predator / prey",
		blurb: "Scouts hunt; the rest flee and regroup."
	},
	{
		id: "neural_evolution",
		label: "Neural evolution",
		blurb: "Each agent’s 6–8–4 net evolves by fitness."
	},
	{
		id: "stigmergy",
		label: "Stigmergy",
		blurb: "Pheromone trails — ant-colony foraging."
	}
];
var DEFAULT_CONFIG = {
	agentCount: 40,
	perceptionRadius: 80,
	separationWeight: 1.5,
	alignmentWeight: 1,
	cohesionWeight: 1,
	explorationWeight: .5,
	communicationRange: 120,
	maxSpeed: 3,
	behavior: "flocking",
	showTrails: true,
	showConnections: true,
	showPerception: false,
	showHeatmap: false,
	speed: 1,
	pheromoneEnabled: false,
	neuralNetEnabled: false,
	evolutionEnabled: false,
	evolutionRate: .05,
	memoryEnabled: true,
	environmentEnabled: false,
	windStrength: .5,
	windDirection: 0,
	constructionEnabled: false,
	qLearningEnabled: false,
	lifecycleEnabled: false,
	obstacleMode: false
};
var SAMPLE_MISSIONS = [
	"Draft a 7-day launch plan for a neighborhood tool library, including roles, risks, and a one-page pitch.",
	"Treat murmuration as an algorithm a robot fleet could steal. Spec the control loop, failure modes, and a first experiment.",
	"Write a hiring scorecard and first-week plan for a staff engineer joining a 6-person startup."
];
function vec(x = 0, y = 0) {
	return {
		x,
		y
	};
}
function add(a, b) {
	return {
		x: a.x + b.x,
		y: a.y + b.y
	};
}
function sub(a, b) {
	return {
		x: a.x - b.x,
		y: a.y - b.y
	};
}
function mul(a, s) {
	return {
		x: a.x * s,
		y: a.y * s
	};
}
function mag(a) {
	return Math.hypot(a.x, a.y);
}
function dist(a, b) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}
function norm(a) {
	const m = mag(a);
	return m > 1e-6 ? {
		x: a.x / m,
		y: a.y / m
	} : {
		x: 0,
		y: 0
	};
}
function limit(a, max) {
	return mag(a) > max ? mul(norm(a), max) : a;
}
function angleOf(a) {
	return Math.atan2(a.y, a.x);
}
function randDir() {
	const a = Math.random() * Math.PI * 2;
	return {
		x: Math.cos(a),
		y: Math.sin(a)
	};
}
function createNet() {
	return {
		w1: Array.from({ length: 8 }, () => Array.from({ length: 6 }, () => Math.random() * 2 - 1)),
		w2: Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => Math.random() * 2 - 1)),
		b1: Array.from({ length: 8 }, () => Math.random() * 2 - 1),
		b2: Array.from({ length: 4 }, () => Math.random() * 2 - 1)
	};
}
function forward(net, inputs) {
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
function mixRow(a, b, rate, amp) {
	return a.map((v, i) => {
		const base = Math.random() < .5 ? v : b[i] ?? v;
		return Math.random() < rate ? base + (Math.random() * 2 - 1) * amp : base;
	});
}
function crossover(p1, p2, rate) {
	return {
		w1: p1.w1.map((row, i) => mixRow(row, p2.w1[i], rate, .3)),
		w2: p1.w2.map((row, i) => mixRow(row, p2.w2[i], rate, .3)),
		b1: mixRow(p1.b1, p2.b1, rate, .2),
		b2: mixRow(p1.b2, p2.b2, rate, .2)
	};
}
function randomTraits() {
	return {
		curiosity: Math.random(),
		sociability: Math.random(),
		aggression: Math.random(),
		caution: Math.random(),
		efficiency: .35 + Math.random() * .65
	};
}
function mixTraits(a, b, rate) {
	const mix = (x, y) => {
		const base = Math.random() < .5 ? x : y;
		const v = Math.random() < rate ? base + (Math.random() * 2 - 1) * .2 : base;
		return Math.max(0, Math.min(1, v));
	};
	return {
		curiosity: mix(a.curiosity, b.curiosity),
		sociability: mix(a.sociability, b.sociability),
		aggression: mix(a.aggression, b.aggression),
		caution: mix(a.caution, b.caution),
		efficiency: mix(a.efficiency, b.efficiency)
	};
}
function createGrid(width, height, cell = 12) {
	const w = Math.max(1, Math.ceil(width / cell));
	const h = Math.max(1, Math.ceil(height / cell));
	return {
		data: new Float32Array(w * h),
		w,
		h,
		cell
	};
}
function deposit(grid, pos, amount) {
	const gx = Math.floor(pos.x / grid.cell);
	const gy = Math.floor(pos.y / grid.cell);
	if (gx < 0 || gy < 0 || gx >= grid.w || gy >= grid.h) return;
	const i = gy * grid.w + gx;
	grid.data[i] = Math.min(1, grid.data[i] + amount);
}
function strength(grid, pos) {
	const gx = Math.floor(pos.x / grid.cell);
	const gy = Math.floor(pos.y / grid.cell);
	if (gx < 0 || gy < 0 || gx >= grid.w || gy >= grid.h) return 0;
	return grid.data[gy * grid.w + gx];
}
function gradient(grid, pos) {
	const gx = Math.floor(pos.x / grid.cell);
	const gy = Math.floor(pos.y / grid.cell);
	if (gx <= 0 || gy <= 0 || gx >= grid.w - 1 || gy >= grid.h - 1) return {
		x: 0,
		y: 0
	};
	const left = grid.data[gy * grid.w + (gx - 1)];
	const right = grid.data[gy * grid.w + (gx + 1)];
	const up = grid.data[(gy - 1) * grid.w + gx];
	const down = grid.data[(gy + 1) * grid.w + gx];
	return {
		x: (right - left) * 2,
		y: (down - up) * 2
	};
}
function decay(grid, rate) {
	for (let i = 0; i < grid.data.length; i++) {
		grid.data[i] *= 1 - rate;
		if (grid.data[i] < .001) grid.data[i] = 0;
	}
}
function diffuse(grid, rate) {
	const next = new Float32Array(grid.data.length);
	for (let y = 1; y < grid.h - 1; y++) for (let x = 1; x < grid.w - 1; x++) {
		const i = y * grid.w + x;
		const n = (grid.data[(y - 1) * grid.w + x] + grid.data[(y + 1) * grid.w + x] + grid.data[y * grid.w + (x - 1)] + grid.data[y * grid.w + (x + 1)]) / 4;
		next[i] = grid.data[i] * (1 - rate) + n * rate;
	}
	grid.data = next;
}
function total(grid) {
	let s = 0;
	for (let i = 0; i < grid.data.length; i++) s += grid.data[i];
	return s;
}
var TRAIL = 18;
var Q_ACTIONS = [
	"explore",
	"seek",
	"flee",
	"talk",
	"rest",
	"follow"
];
var NAMES = {
	coordinator: [
		"Meridian",
		"Axon",
		"Helix-0",
		"Prime"
	],
	explorer: [
		"Kepler",
		"Vela",
		"Rift",
		"Iota",
		"Nadir"
	],
	worker: [
		"Anvil",
		"Loom",
		"Forge",
		"Hearth",
		"Quern"
	],
	scout: [
		"Vesper",
		"Pike",
		"Wraith",
		"Ash"
	],
	carrier: [
		"Helix",
		"Porter",
		"Vessel",
		"Ark"
	]
};
var SwarmEngine = class {
	w = 960;
	h = 640;
	config = { ...DEFAULT_CONFIG };
	agents = [];
	resources = [];
	threats = [];
	structures = [];
	events = [];
	hive = [];
	clusters = [];
	pheromone = createGrid(960, 640);
	world = {
		time: 8,
		day: 1,
		timeOfDay: "day",
		season: "spring",
		weather: "clear",
		temperature: 18,
		visibility: 1
	};
	generation = 1;
	messages = 0;
	tick = 0;
	time = 0;
	eventCounter = 0;
	idCounter = 0;
	qtable = /* @__PURE__ */ new Map();
	qExplore = .3;
	lastEvolve = 0;
	lastCluster = 0;
	resize(w, h) {
		const nw = Math.max(360, w);
		const nh = Math.max(280, h);
		if (nw === this.w && nh === this.h) return;
		this.w = nw;
		this.h = nh;
		this.pheromone = createGrid(this.w, this.h, 12);
	}
	reset(cfg) {
		if (cfg) this.config = {
			...this.config,
			...cfg
		};
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
		this.qExplore = .3;
		this.pheromone = createGrid(this.w, this.h, 12);
		this.spawnAgents(this.config.agentCount);
		this.seedResources(10);
		this.log("system", "Swarm reconstituted.", "ok");
	}
	nid(prefix) {
		return `${prefix}-${this.idCounter++}`;
	}
	log(kind, text, severity = "info") {
		this.events.unshift({
			id: this.nid("evt"),
			at: Date.now(),
			kind,
			text,
			severity
		});
		if (this.events.length > 80) this.events.length = 80;
	}
	remember(text) {
		this.hive.unshift({
			id: this.nid("mem"),
			text,
			at: Date.now()
		});
		if (this.hive.length > 40) this.hive.length = 40;
	}
	spawnAgents(n) {
		const nameIdx = {
			explorer: 0,
			worker: 0,
			coordinator: 0,
			scout: 0,
			carrier: 0
		};
		for (let i = 0; i < n; i++) {
			const role = ROLES[i % ROLES.length];
			const names = NAMES[role];
			const name = names[nameIdx[role]++ % names.length] + (i >= 5 ? `-${i}` : "");
			const a = i / n * Math.PI * 2;
			const r = Math.min(this.w, this.h) * (.12 + Math.random() * .18);
			this.agents.push(this.makeAgent(role, name, {
				x: this.w * .5 + Math.cos(a) * r,
				y: this.h * .5 + Math.sin(a) * r
			}));
		}
	}
	makeAgent(role, name, position) {
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
			perception: this.config.perceptionRadius * (.85 + Math.random() * .3),
			trail: [],
			color: ROLE_COLOR[role],
			pulse: Math.random() * Math.PI * 2,
			fitness: 0,
			age: 0,
			traits: randomTraits(),
			brain: createNet(),
			connections: [],
			clusterId: -1,
			generation: this.generation
		};
	}
	setCount(n) {
		n = Math.max(5, Math.min(80, Math.round(n)));
		this.config.agentCount = n;
		while (this.agents.length < n) {
			const role = ROLES[this.agents.length % ROLES.length];
			this.agents.push(this.makeAgent(role, `${role}-${this.agents.length}`, {
				x: this.w * .3 + Math.random() * this.w * .4,
				y: this.h * .3 + Math.random() * this.h * .4
			}));
		}
		while (this.agents.length > n) this.agents.pop();
	}
	seedResources(count) {
		const types = [
			"energy",
			"data",
			"material"
		];
		for (let i = 0; i < count; i++) this.resources.push({
			id: this.nid("r"),
			position: {
				x: 50 + Math.random() * (this.w - 100),
				y: 50 + Math.random() * (this.h - 100)
			},
			amount: 40 + Math.random() * 60,
			type: types[i % 3],
			discovered: false,
			deplete: 8 + Math.random() * 10
		});
	}
	addResource(x, y) {
		this.resources.push({
			id: this.nid("r"),
			position: {
				x,
				y
			},
			amount: 60 + Math.random() * 40,
			type: [
				"energy",
				"data",
				"material"
			][Math.floor(Math.random() * 3)],
			discovered: false,
			deplete: 10
		});
		this.log("system", "Resource dropped into the field.", "info");
	}
	addThreat(x, y) {
		this.threats.push({
			id: this.nid("t"),
			position: {
				x,
				y
			},
			radius: 34,
			severity: .7,
			type: "hazard"
		});
		this.log("threat", "Hazard placed.", "warn");
	}
	addStructure(x, y) {
		const types = [
			"wall",
			"tower",
			"beacon",
			"shelter"
		];
		this.structures.push({
			id: this.nid("s"),
			type: types[Math.floor(Math.random() * types.length)],
			position: {
				x,
				y
			},
			size: 22,
			progress: 0,
			completed: false
		});
		this.log("build", "Construction site opened.", "info");
	}
	setBehavior(b) {
		this.config.behavior = b;
		this.config.pheromoneEnabled = b === "stigmergy" || this.config.pheromoneEnabled;
		this.config.neuralNetEnabled = b === "neural_evolution" || this.config.neuralNetEnabled;
		this.config.evolutionEnabled = b === "neural_evolution" || this.config.evolutionEnabled;
		this.log("system", `Behavior set to ${b.replace("_", " ")}.`, "info");
	}
	applyAction(action) {
		switch (action.type) {
			case "set_behavior":
				if (action.behavior) this.setBehavior(action.behavior);
				return `Behavior → ${action.behavior}`;
			case "adjust_param": {
				const key = action.param;
				if (key && typeof this.config[key] === "number" && action.value != null) {
					this.config[key] = action.value;
					return `${key} → ${action.value}`;
				}
				return "Unknown parameter";
			}
			case "toggle_feature": {
				const f = action.feature;
				if (f && typeof this.config[f] === "boolean") {
					this.config[f] = action.enabled ?? !this.config[f];
					return `${f} ${this.config[f] ? "on" : "off"}`;
				}
				return "Unknown feature";
			}
			case "spawn_resource":
				this.seedResources(3);
				return "Seeded 3 resources";
			default: return `Ignored ${action.type}`;
		}
	}
	neighbors(agent, radius, hash) {
		const cell = 80;
		const gx = Math.floor(agent.position.x / cell);
		const gy = Math.floor(agent.position.y / cell);
		const r = Math.ceil(radius / cell);
		const out = [];
		const r2 = radius * radius;
		for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
			const bucket = hash.get(gx + dx & 65535 | gy + dy << 16);
			if (!bucket) continue;
			for (const o of bucket) {
				if (o.id === agent.id) continue;
				const ddx = o.position.x - agent.position.x;
				const ddy = o.position.y - agent.position.y;
				if (ddx * ddx + ddy * ddy <= r2) out.push(o);
			}
		}
		return out;
	}
	hashAgents() {
		const cell = 80;
		const map = /* @__PURE__ */ new Map();
		for (const a of this.agents) {
			const gx = Math.floor(a.position.x / cell);
			const gy = Math.floor(a.position.y / cell);
			const key = gx & 65535 | gy << 16;
			const b = map.get(key);
			if (b) b.push(a);
			else map.set(key, [a]);
		}
		return map;
	}
	step(dt) {
		const cfg = this.config;
		const scaled = dt * cfg.speed;
		this.tick++;
		this.time += scaled;
		if (cfg.environmentEnabled) this.tickWorld(scaled);
		const hash = this.hashAgents();
		const perc = cfg.perceptionRadius * (cfg.environmentEnabled ? this.world.visibility : 1);
		if (cfg.pheromoneEnabled) {
			decay(this.pheromone, .012);
			if (this.tick % 4 === 0) diffuse(this.pheromone, .08);
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
		if (cfg.qLearningEnabled && this.tick % 20 === 0) this.qExplore = Math.max(.05, this.qExplore * .999);
		if (cfg.evolutionEnabled && this.time - this.lastEvolve > 18) {
			this.evolve();
			this.lastEvolve = this.time;
		}
		if (this.time - this.lastCluster > 2.5) {
			this.recluster();
			this.lastCluster = this.time;
		}
		if (cfg.lifecycleEnabled) this.lifecycle();
		if (cfg.environmentEnabled && cfg.windStrength > 0) {
			const wx = Math.cos(cfg.windDirection) * cfg.windStrength * 18;
			const wy = Math.sin(cfg.windDirection) * cfg.windStrength * 18;
			for (const a of this.agents) {
				a.velocity.x += wx * scaled;
				a.velocity.y += wy * scaled;
			}
		}
	}
	tickWorld(dt) {
		this.world.time += dt * .15;
		if (this.world.time >= 24) {
			this.world.time -= 24;
			this.world.day++;
			if (this.world.day % 8 === 0) {
				const seasons = [
					"spring",
					"summer",
					"autumn",
					"winter"
				];
				this.world.season = seasons[(seasons.indexOf(this.world.season) + 1) % 4];
			}
		}
		const t = this.world.time;
		this.world.timeOfDay = t >= 5 && t < 8 ? "dawn" : t >= 8 && t < 18 ? "day" : t >= 18 && t < 21 ? "dusk" : "night";
		if (Math.random() < 8e-4 * dt * 60) {
			const w = [
				"clear",
				"rain",
				"storm",
				"fog",
				"wind"
			];
			this.world.weather = w[Math.floor(Math.random() * w.length)];
			this.log("system", `Weather shifted to ${this.world.weather}.`, "info");
		}
		const visW = {
			clear: 1,
			rain: .72,
			storm: .45,
			fog: .32,
			wind: .88
		};
		const visT = this.world.timeOfDay === "night" ? .4 : this.world.timeOfDay === "dusk" ? .7 : 1;
		this.world.visibility = visW[this.world.weather] * visT;
		const base = {
			spring: 14,
			summer: 24,
			autumn: 10,
			winter: 1
		};
		this.world.temperature = base[this.world.season] + (t > 12 && t < 16 ? 4 : -2);
	}
	steer(agent, desired) {
		return limit(sub(desired, agent.velocity), agent.maxForce);
	}
	seek(agent, target) {
		return this.steer(agent, mul(norm(sub(target, agent.position)), agent.maxSpeed));
	}
	updateAgent(agent, nb, dt, perc) {
		const cfg = this.config;
		let force = vec();
		let sep = vec();
		let ali = vec();
		let coh = vec();
		let sepN = 0;
		let aliN = 0;
		const sepR = perc * .45;
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
			force = add(force, mul(this.steer(agent, mul(norm(divSafe(ali, aliN)), agent.maxSpeed)), cfg.alignmentWeight * 70 * agent.traits.sociability));
			const center = divSafe(coh, aliN);
			force = add(force, mul(this.seek(agent, center), cfg.cohesionWeight * 55 * agent.traits.sociability));
		}
		const m = 42;
		const edge = vec();
		if (agent.position.x < m) edge.x = agent.maxSpeed;
		if (agent.position.x > this.w - m) edge.x = -agent.maxSpeed;
		if (agent.position.y < m) edge.y = agent.maxSpeed;
		if (agent.position.y > this.h - m) edge.y = -agent.maxSpeed;
		if (edge.x || edge.y) force = add(force, this.steer(agent, mul(norm(edge), agent.maxSpeed * 1.4)));
		for (const th of this.threats) if (dist(agent.position, th.position) < th.radius + perc * .6) {
			force = add(force, mul(norm(sub(agent.position, th.position)), agent.maxForce * 1.6 * agent.traits.caution));
			agent.state = "fleeing";
		}
		force = add(force, this.behaviorForce(agent, nb, dt));
		if (cfg.qLearningEnabled) force = add(force, this.qForce(agent, nb));
		if (cfg.pheromoneEnabled && (cfg.behavior === "stigmergy" || cfg.behavior === "resource_gathering")) {
			const g = gradient(this.pheromone, agent.position);
			force = add(force, mul(g, 80));
		}
		if (cfg.constructionEnabled) for (const s of this.structures) {
			if (s.completed) continue;
			if (dist(agent.position, s.position) < s.size + 28) {
				s.progress = Math.min(1, s.progress + dt * .12 * agent.traits.efficiency);
				agent.state = "building";
				if (s.progress >= 1 && !s.completed) {
					s.completed = true;
					this.log("build", `${s.type} completed.`, "ok");
				}
			}
		}
		agent.acc = force;
		agent.velocity = limit(add(agent.velocity, mul(force, dt)), agent.maxSpeed * cfg.maxSpeed * .45);
		agent.position = add(agent.position, mul(agent.velocity, dt));
		agent.pulse += dt * (agent.state === "thinking" ? 5 : 2);
		agent.age += dt;
		agent.energy = Math.max(0, Math.min(100, agent.energy - dt * 1.6 * (1 - agent.traits.efficiency * .5) + (agent.state === "idle" ? dt * 4 : 0)));
		if (mag(agent.velocity) > 8) {
			agent.trail.push({ ...agent.position });
			if (agent.trail.length > TRAIL) agent.trail.shift();
		} else if (agent.trail.length) agent.trail.shift();
		this.forage(agent, perc);
		if (agent.connections.length && Math.random() < .01) {
			agent.state = "communicating";
			this.messages += 1;
		} else if (agent.state === "communicating" && Math.random() < .08) agent.state = "moving";
		if (cfg.pheromoneEnabled && (agent.state === "working" || agent.state === "alert")) deposit(this.pheromone, agent.position, .22);
	}
	forage(agent, perc) {
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
				const take = Math.min(r.amount, r.deplete * .016);
				r.amount -= take;
				agent.energy = Math.min(100, agent.energy + take * .8 * agent.traits.efficiency);
				agent.state = "working";
				agent.fitness += .4;
				if (r.amount <= 0) this.log("discovery", `${r.type} depleted.`, "info");
			}
		}
	}
	behaviorForce(agent, nb, dt) {
		const cfg = this.config;
		const w = this.w;
		const h = this.h;
		switch (cfg.behavior) {
			case "search_rescue": {
				if (agent.role === "explorer" || agent.role === "scout") return mul(randDir(), agent.maxForce * .25 * cfg.explorationWeight);
				const disc = this.resources.filter((r) => r.discovered && r.amount > 0);
				if (!disc.length) return vec();
				const nearest = disc.reduce((c, r) => dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c);
				return this.seek(agent, nearest.position);
			}
			case "resource_gathering": {
				const avail = this.resources.filter((r) => r.amount > 0);
				if (!avail.length) return mul(randDir(), agent.maxForce * .2);
				const nearest = avail.reduce((c, r) => dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c);
				return this.seek(agent, nearest.position);
			}
			case "formation": {
				const sorted = [...this.agents].sort((a, b) => a.id.localeCompare(b.id));
				const idx = sorted.findIndex((a) => a.id === agent.id);
				const leader = sorted[0];
				if (idx <= 0) return mul({
					x: Math.cos(this.time * .35),
					y: Math.sin(this.time * .35)
				}, agent.maxForce * .35);
				const side = idx % 2 === 0 ? 1 : -1;
				const row = Math.ceil(idx / 2);
				const heading = mag(leader.velocity) > 4 ? norm(leader.velocity) : {
					x: 1,
					y: 0
				};
				const perp = {
					x: -heading.y,
					y: heading.x
				};
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
					x: cw * (col + .5) + Math.sin(this.time * .6 + i) * cw * .28,
					y: ch * (row + .5) + Math.cos(this.time * .6 + i) * ch * .28
				});
			}
			case "consensus": return this.seek(agent, {
				x: w / 2 + Math.sin(this.time * .25) * w * .22,
				y: h / 2 + Math.cos(this.time * .32) * h * .18
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
				for (const p of preds) if (dist(agent.position, p.position) < agent.perception * 1.4) {
					flee = add(flee, mul(norm(sub(agent.position, p.position)), agent.maxSpeed * 1.6));
					agent.state = "fleeing";
				}
				return mag(flee) ? flee : vec();
			}
			case "neural_evolution": {
				const res = this.resources.filter((r) => r.amount > 0);
				const nearest = res.length ? res.reduce((c, r) => dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c) : null;
				const td = nearest ? dist(agent.position, nearest.position) : 250;
				const ang = nearest ? Math.atan2(nearest.position.y - agent.position.y, nearest.position.x - agent.position.x) : 0;
				const ph = cfg.pheromoneEnabled ? strength(this.pheromone, agent.position) : 0;
				const out = forward(agent.brain, [
					td / 500,
					ang / Math.PI,
					agent.energy / 100,
					nb.length / 10,
					ph,
					mag(agent.velocity) / 80
				]);
				const wander = mul(randDir(), (out[2] + 1) / 2 * 40);
				return add({
					x: out[0] * agent.maxForce,
					y: out[1] * agent.maxForce
				}, wander);
			}
			case "stigmergy": return add(mul(gradient(this.pheromone, agent.position), 110), mul(randDir(), agent.maxForce * .2 * cfg.explorationWeight));
			default: return mul(randDir(), agent.maxForce * .08 * cfg.explorationWeight);
		}
	}
	qForce(agent, nb) {
		const state = this.qState(agent, nb);
		const action = this.qChoose(agent.id, state);
		const avail = this.resources.filter((r) => r.amount > 0);
		switch (action) {
			case "explore": return mul(randDir(), 50);
			case "seek": {
				if (!avail.length) return vec();
				const n = avail.reduce((c, r) => dist(agent.position, r.position) < dist(agent.position, c.position) ? r : c);
				return this.seek(agent, n.position);
			}
			case "flee": {
				if (!this.threats.length) return vec();
				const th = this.threats.reduce((c, t) => dist(agent.position, t.position) < dist(agent.position, c.position) ? t : c);
				return mul(norm(sub(agent.position, th.position)), 70);
			}
			case "talk":
				agent.state = "communicating";
				return vec();
			case "rest":
				agent.energy = Math.min(100, agent.energy + .4);
				return mul(agent.velocity, -.4);
			case "follow": return mul(gradient(this.pheromone, agent.position), 90);
		}
	}
	qState(agent, nb) {
		if (agent.energy < 30) return "low";
		if (this.threats.some((t) => dist(agent.position, t.position) < agent.perception)) return "threat";
		if (nb.length === 0) return "iso";
		if (nb.length > 6) return "crowd";
		if (agent.energy > 70) return "high";
		return "mid";
	}
	qChoose(id, state) {
		if (Math.random() < this.qExplore) return Q_ACTIONS[Math.floor(Math.random() * Q_ACTIONS.length)];
		const table = this.qEnsure(id, state);
		let best = "explore";
		let v = -Infinity;
		for (const a of Q_ACTIONS) if (table[a] > v) {
			v = table[a];
			best = a;
		}
		return best;
	}
	qEnsure(id, state) {
		const key = `${id}:${state}`;
		let t = this.qtable.get(key);
		if (!t) {
			t = Object.fromEntries(Q_ACTIONS.map((a) => [a, 0]));
			this.qtable.set(key, t);
		}
		return t;
	}
	evolve() {
		if (this.agents.length < 6) return;
		const sorted = [...this.agents].sort((a, b) => b.fitness - a.fitness);
		const keep = sorted.slice(0, Math.ceil(sorted.length * .5));
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
	lifecycle() {
		for (const a of this.agents) if (a.energy <= 0 || this.config.lifecycleEnabled && a.age > 90 && a.energy < 15) {
			const parent = [...this.agents].sort((x, y) => y.fitness - x.fitness)[0] ?? a;
			a.brain = crossover(parent.brain, a.brain, .12);
			a.traits = mixTraits(parent.traits, a.traits, .12);
			a.energy = 70;
			a.age = 0;
			a.fitness = 0;
			a.position = {
				x: this.w * .5 + (Math.random() - .5) * 80,
				y: this.h * .5 + (Math.random() - .5) * 80
			};
			this.log("system", `${a.name} recycled through the hive.`, "warn");
		}
	}
	recluster() {
		const assigned = /* @__PURE__ */ new Set();
		const clusters = [];
		let id = 0;
		const thresh = 92;
		for (const agent of this.agents) {
			if (assigned.has(agent.id)) continue;
			const bag = [];
			const q = [agent];
			assigned.add(agent.id);
			while (q.length) {
				const cur = q.pop();
				bag.push(cur);
				for (const o of this.agents) if (!assigned.has(o.id) && dist(cur.position, o.position) < thresh) {
					assigned.add(o.id);
					q.push(o);
				}
			}
			if (bag.length < 3) {
				for (const a of bag) a.clusterId = -1;
				continue;
			}
			const center = divSafe(bag.reduce((s, a) => add(s, a.position), vec()), bag.length);
			const explorers = bag.filter((a) => a.role === "explorer" || a.role === "scout").length;
			const workers = bag.filter((a) => a.role === "worker" || a.role === "carrier").length;
			const purpose = explorers > workers ? "Exploration" : workers > explorers ? "Gathering" : "Mixed";
			for (const a of bag) a.clusterId = id;
			clusters.push({
				id,
				agentIds: bag.map((a) => a.id),
				center,
				purpose
			});
			id++;
		}
		this.clusters = clusters;
	}
	metrics() {
		const n = this.agents.length || 1;
		const avgSpeed = this.agents.reduce((s, a) => s + mag(a.velocity), 0) / n;
		const avgEnergy = this.agents.reduce((s, a) => s + a.energy, 0) / n;
		const avgFitness = this.agents.reduce((s, a) => s + a.fitness, 0) / n;
		const center = divSafe(this.agents.reduce((s, a) => add(s, a.position), vec()), n);
		const avgDist = this.agents.reduce((s, a) => s + dist(a.position, center), 0) / n;
		const xs = this.agents.map((a) => a.position.x);
		const ys = this.agents.map((a) => a.position.y);
		const coverage = (Math.max(...xs, 0) - Math.min(...xs, 0)) * (Math.max(...ys, 0) - Math.min(...ys, 0));
		let connections = 0;
		for (const a of this.agents) connections += a.connections.length;
		const now = Date.now();
		const eventRate = this.events.filter((e) => now - e.at < 5e3).length / 5;
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
			coverage
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
			clusterId: a.clusterId
		}));
	}
	exportState() {
		return {
			config: this.config,
			generation: this.generation,
			hive: this.hive,
			metrics: this.metrics(),
			at: Date.now()
		};
	}
};
function divSafe(v, n) {
	return n ? {
		x: v.x / n,
		y: v.y / n
	} : vec();
}
function rgba(hex, a) {
	const n = hex.replace("#", "");
	return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}
function worldTint(clock) {
	switch (clock.timeOfDay) {
		case "dawn": return "rgba(196,165,116,0.06)";
		case "dusk": return "rgba(201,137,122,0.08)";
		case "night": return "rgba(4,6,12,0.38)";
		default: return "rgba(0,0,0,0)";
	}
}
function renderSwarm(ctx, engine, selectedId) {
	const { w, h, agents, resources, threats, structures, config, world, pheromone } = engine;
	const cx = w * .5;
	const cy = h * .5;
	ctx.clearRect(0, 0, w, h);
	const bg = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(w, h) * .72);
	bg.addColorStop(0, "#12141a");
	bg.addColorStop(1, "#08090b");
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, w, h);
	ctx.save();
	ctx.strokeStyle = "rgba(232,234,238,0.035)";
	ctx.lineWidth = 1;
	const step = 40;
	for (let x = cx % step - step; x < w + step; x += step) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h);
		ctx.stroke();
	}
	for (let y = cy % step - step; y < h + step; y += step) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
		ctx.stroke();
	}
	ctx.restore();
	if (config.showHeatmap && config.pheromoneEnabled) {
		const cell = pheromone.cell;
		for (let gy = 0; gy < pheromone.h; gy++) for (let gx = 0; gx < pheromone.w; gx++) {
			const v = pheromone.data[gy * pheromone.w + gx];
			if (v < .04) continue;
			ctx.fillStyle = `rgba(140,186,154,${Math.min(.35, v * .45)})`;
			ctx.fillRect(gx * cell, gy * cell, cell, cell);
		}
	}
	if (config.environmentEnabled && config.showHeatmap === false && world.weather === "fog") {
		ctx.fillStyle = "rgba(180,186,196,0.05)";
		ctx.fillRect(0, 0, w, h);
	}
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
		const byId = new Map(agents.map((a) => [a.id, a]));
		ctx.lineWidth = .8;
		let drawn = 0;
		for (const a of agents) for (const id of a.connections) {
			if (drawn > 220) break;
			const o = byId.get(id);
			if (!o || o.id <= a.id) continue;
			const talking = a.state === "communicating" || o.state === "communicating";
			ctx.beginPath();
			ctx.moveTo(a.position.x, a.position.y);
			ctx.lineTo(o.position.x, o.position.y);
			ctx.strokeStyle = talking ? "rgba(197,206,216,0.28)" : "rgba(197,206,216,0.06)";
			ctx.stroke();
			drawn++;
		}
	}
	if (config.showTrails) for (const a of agents) drawTrail(ctx, a);
	for (const a of agents) drawAgent(ctx, a, selectedId === a.id, config.showPerception);
	ctx.fillStyle = worldTint(world);
	ctx.fillRect(0, 0, w, h);
}
function drawTrail(ctx, a) {
	if (a.trail.length < 2) return;
	ctx.beginPath();
	ctx.moveTo(a.trail[0].x, a.trail[0].y);
	for (let i = 1; i < a.trail.length; i++) ctx.lineTo(a.trail[i].x, a.trail[i].y);
	ctx.strokeStyle = rgba(a.color, .22);
	ctx.lineWidth = 1.3;
	ctx.lineCap = "round";
	ctx.stroke();
}
function drawAgent(ctx, a, selected, showPerc) {
	const { x, y } = a.position;
	const heading = mag(a.velocity) > 6 ? angleOf(a.velocity) : -Math.PI / 2;
	const hot = a.state === "thinking" || a.state === "working" || a.state === "alert";
	if (showPerc) {
		ctx.beginPath();
		ctx.arc(x, y, a.perception, 0, Math.PI * 2);
		ctx.strokeStyle = rgba(a.color, .08);
		ctx.stroke();
	}
	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.arc(0, 0, hot ? 14 : 10, 0, Math.PI * 2);
	ctx.fillStyle = rgba(a.color, .16 + Math.sin(a.pulse) * .04);
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
	ctx.fillStyle = rgba(a.color, .9);
	ctx.fillRect(x - bw / 2, y + 8, bw * (a.energy / 100), 2);
}
function drawResource(ctx, r, time) {
	if (r.amount <= 0) return;
	const { x, y } = r.position;
	const pulse = 6 + Math.sin(time * 2 + x) * 1.4;
	const col = r.type === "energy" ? "#8cba9a" : r.type === "data" ? "#7eb8c9" : "#c5ced8";
	ctx.beginPath();
	ctx.arc(x, y, pulse, 0, Math.PI * 2);
	ctx.fillStyle = rgba(col, r.discovered ? .22 : .08);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x, y, 3.2, 0, Math.PI * 2);
	ctx.fillStyle = rgba(col, r.discovered ? .95 : .4);
	ctx.fill();
}
function drawThreat(ctx, t) {
	ctx.beginPath();
	ctx.arc(t.position.x, t.position.y, t.radius, 0, Math.PI * 2);
	ctx.strokeStyle = "rgba(201,137,122,0.45)";
	ctx.fillStyle = "rgba(201,137,122,0.08)";
	ctx.fill();
	ctx.stroke();
}
function drawStructure(ctx, s) {
	const { x, y } = s.position;
	const size = s.size * (.35 + s.progress * .65);
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
var SCENARIOS = [
	{
		id: "basic_flocking",
		name: "Basic flocking",
		description: "Classic boids: separate, align, cohere.",
		config: {
			behavior: "flocking",
			agentCount: 48,
			separationWeight: 1.5,
			alignmentWeight: 1,
			cohesionWeight: 1,
			explorationWeight: .5,
			showTrails: true,
			showConnections: true,
			pheromoneEnabled: false
		}
	},
	{
		id: "resource_rush",
		name: "Resource rush",
		description: "Compete to gather scattered resources.",
		config: {
			behavior: "resource_gathering",
			agentCount: 40,
			separationWeight: 2,
			alignmentWeight: .5,
			cohesionWeight: .8,
			explorationWeight: 1.5,
			memoryEnabled: true,
			showTrails: true
		}
	},
	{
		id: "neural_evolution",
		name: "Neural evolution",
		description: "6–8–4 nets evolve by fitness.",
		config: {
			behavior: "neural_evolution",
			agentCount: 50,
			neuralNetEnabled: true,
			evolutionEnabled: true,
			evolutionRate: .08,
			showTrails: false,
			showConnections: true
		}
	},
	{
		id: "ant_colony",
		name: "Ant colony",
		description: "Stigmergy through pheromone trails.",
		config: {
			behavior: "stigmergy",
			agentCount: 64,
			pheromoneEnabled: true,
			showHeatmap: true,
			showTrails: true,
			separationWeight: 1.8,
			cohesionWeight: .5
		}
	},
	{
		id: "predator_prey",
		name: "Predator & prey",
		description: "Scouts hunt; workers evade.",
		config: {
			behavior: "predator_prey",
			agentCount: 46,
			separationWeight: 2.5,
			alignmentWeight: 1.5,
			cohesionWeight: 2,
			showTrails: true,
			showConnections: true
		}
	},
	{
		id: "v_formation",
		name: "V-formation",
		description: "Hold an aerodynamic wedge.",
		config: {
			behavior: "formation",
			agentCount: 28,
			separationWeight: 1.2,
			alignmentWeight: 2,
			cohesionWeight: 1.5,
			showTrails: true,
			showConnections: true
		}
	},
	{
		id: "search_rescue",
		name: "Search & rescue",
		description: "Explorers find, workers converge.",
		config: {
			behavior: "search_rescue",
			agentCount: 42,
			explorationWeight: 2,
			memoryEnabled: true,
			showTrails: true
		}
	},
	{
		id: "windy",
		name: "Windy field",
		description: "Navigate a live wind field.",
		config: {
			behavior: "flocking",
			agentCount: 40,
			environmentEnabled: true,
			windStrength: 1.4,
			windDirection: .5,
			separationWeight: 2,
			alignmentWeight: 1.2
		}
	},
	{
		id: "consensus",
		name: "Consensus",
		description: "Converge on a moving decision point.",
		config: {
			behavior: "consensus",
			agentCount: 52,
			cohesionWeight: 2.5,
			alignmentWeight: 1.5,
			showTrails: true,
			showConnections: true
		}
	},
	{
		id: "ecosystem",
		name: "Living ecosystem",
		description: "Energy, death, and recycling.",
		config: {
			behavior: "resource_gathering",
			agentCount: 32,
			lifecycleEnabled: true,
			memoryEnabled: true,
			showTrails: true
		}
	},
	{
		id: "grid_patrol",
		name: "Grid patrol",
		description: "Systematic coverage.",
		config: {
			behavior: "patrol",
			agentCount: 36,
			separationWeight: 2.5,
			alignmentWeight: .5,
			cohesionWeight: .3,
			showTrails: true
		}
	},
	{
		id: "mega",
		name: "Mega swarm",
		description: "Large field, spatial hash, no trails.",
		config: {
			behavior: "flocking",
			agentCount: 80,
			perceptionRadius: 60,
			communicationRange: 90,
			showTrails: false,
			showConnections: false,
			separationWeight: 1.8
		}
	}
];
var QWEN_MODEL = "unsloth/Qwen3.6-27B-GGUF:Q6_K_XL";
var QWEN_LABEL = "Qwen 3.6 27B";
var DEFAULT_LLAMA_ENDPOINT = "http://127.0.0.1:8088";
var LS_KEY = "hivefield.llama.v1";
function loadLlamaConfig() {
	try {
		const raw = localStorage.getItem(LS_KEY);
		if (raw) {
			const p = JSON.parse(raw);
			return {
				endpoint: p.endpoint || "http://127.0.0.1:8088",
				model: p.model || "unsloth/Qwen3.6-27B-GGUF:Q6_K_XL",
				temperature: p.temperature ?? .7,
				maxTokens: p.maxTokens ?? 512
			};
		}
	} catch {}
	return {
		endpoint: DEFAULT_LLAMA_ENDPOINT,
		model: QWEN_MODEL,
		temperature: .7,
		maxTokens: 512
	};
}
function saveLlamaConfig(cfg) {
	localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}
function base(endpoint) {
	return endpoint.replace(/\/$/, "");
}
async function probeLlama(endpoint) {
	try {
		if ((await fetch(`${base(endpoint)}/v1/models`, {
			method: "GET",
			signal: AbortSignal.timeout(4e3)
		})).ok) return true;
	} catch {}
	try {
		const { llamaProbe } = await import("./actions-BrhkgOKe.mjs");
		return (await llamaProbe({ data: { endpoint } })).ok;
	} catch {
		return false;
	}
}
async function llamaChat(cfg, messages, maxTokens = cfg.maxTokens) {
	const started = Date.now();
	const direct = await llamaDirect(cfg, messages, maxTokens, started);
	if (direct.ok) return direct;
	try {
		const { llamaComplete } = await import("./actions-BrhkgOKe.mjs");
		const r = await llamaComplete({ data: {
			endpoint: cfg.endpoint,
			model: cfg.model || "unsloth/Qwen3.6-27B-GGUF:Q6_K_XL",
			messages,
			temperature: cfg.temperature,
			maxTokens
		} });
		return {
			ok: r.ok,
			content: r.content,
			tokens: r.tokens,
			latency: Date.now() - started,
			error: r.ok ? void 0 : r.error
		};
	} catch (err) {
		return {
			ok: false,
			content: "",
			tokens: 0,
			latency: Date.now() - started,
			error: direct.error || (err instanceof Error ? err.message : "llama.cpp unreachable")
		};
	}
}
async function llamaDirect(cfg, messages, maxTokens, started) {
	try {
		const res = await fetch(`${base(cfg.endpoint)}/v1/chat/completions`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: cfg.model || "unsloth/Qwen3.6-27B-GGUF:Q6_K_XL",
				messages,
				temperature: cfg.temperature,
				max_tokens: maxTokens,
				stream: false
			}),
			signal: AbortSignal.timeout(9e4)
		});
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			return {
				ok: false,
				content: "",
				tokens: 0,
				latency: Date.now() - started,
				error: `llama.cpp ${res.status}${text ? `: ${text.slice(0, 180)}` : ""}`
			};
		}
		const data = await res.json();
		return {
			ok: true,
			content: data.choices?.[0]?.message?.content ?? "",
			tokens: data.usage?.total_tokens ?? 0,
			latency: Date.now() - started
		};
	} catch (err) {
		return {
			ok: false,
			content: "",
			tokens: 0,
			latency: Date.now() - started,
			error: err instanceof Error ? err.message : "llama.cpp unreachable"
		};
	}
}
function parseJsonObject(text) {
	const raw = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? text;
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		return JSON.parse(raw.slice(start, end + 1));
	} catch {
		return null;
	}
}
var SWARM_SYSTEM = `You are Qwen 3.6 27B running on llama.cpp — the actual brain of Hivefield, a live multi-agent operations system. This is not a toy or a game. The canvas is only the bodies. You are the mind.

You command autonomous specialists:
- coordinator — decompose work, assign, hold the thread
- explorer — research, map options, find leverage
- worker — produce the deliverable
- scout — critique, find gaps and lies
- carrier — package and hand off

The field also runs real swarm algorithms you can retune: boids, 6→8→4 neural nets, evolution, pheromone stigmergy, Q-learning, hive memory, construction, threats, world clock.

Be concise, technical, operational. Prefer concrete actions and artifacts over theory. Never claim you are a simulation.`;
async function runDirectorCycle(cfg, input) {
	const res = await llamaChat(cfg, [{
		role: "system",
		content: SWARM_SYSTEM
	}, {
		role: "user",
		content: `You are the autonomous director of a live agent swarm. Optimize operations.

Goal: ${input.goal || "Keep the swarm healthy and productive."}

State:
- agents: ${input.config.agentCount}
- behavior: ${input.config.behavior}
- energy: ${input.metrics.avgEnergy.toFixed(1)}
- coherence: ${(input.metrics.coherence * 100).toFixed(1)}%
- resources: ${input.metrics.resourcesFound}/${input.metrics.resourcesTotal}
- links: ${input.metrics.connections}
- generation: ${input.metrics.generation}
- clusters: ${input.metrics.clusters}
- pheromone: ${input.metrics.pheromone.toFixed(1)}

Parameters:
- separation ${input.config.separationWeight}
- alignment ${input.config.alignmentWeight}
- cohesion ${input.config.cohesionWeight}
- explore ${input.config.explorationWeight}
- perception ${input.config.perceptionRadius}
- speed ${input.config.maxSpeed}

Features: pheromone=${input.config.pheromoneEnabled} neural=${input.config.neuralNetEnabled} evolution=${input.config.evolutionEnabled} memory=${input.config.memoryEnabled} env=${input.config.environmentEnabled} qlearn=${input.config.qLearningEnabled} construct=${input.config.constructionEnabled} lifecycle=${input.config.lifecycleEnabled}

Recent: ${input.recent.slice(0, 6).join(" | ") || "none"}

Respond ONLY with JSON:
{"thought":"...","actions":[{"type":"set_behavior","behavior":"flocking"} | {"type":"adjust_param","param":"cohesionWeight","value":1.8} | {"type":"toggle_feature","feature":"pheromoneEnabled","enabled":true} | {"type":"spawn_resource"}],"nextCheckIn":10,"confidence":0.7}

Behaviors: flocking, search_rescue, resource_gathering, formation, patrol, consensus, predator_prey, neural_evolution, stigmergy
Params: separationWeight, alignmentWeight, cohesionWeight, explorationWeight, perceptionRadius, maxSpeed, speed, evolutionRate, windStrength
Features: pheromoneEnabled, neuralNetEnabled, evolutionEnabled, memoryEnabled, environmentEnabled, qLearningEnabled, constructionEnabled, lifecycleEnabled, showTrails, showConnections, showHeatmap`
	}], 500);
	if (!res.ok) return {
		ok: false,
		error: res.error || "Qwen did not answer"
	};
	const plan = parseJsonObject(res.content);
	if (!plan || !Array.isArray(plan.actions)) return {
		ok: false,
		error: "Qwen returned an unreadable plan"
	};
	return {
		ok: true,
		plan: {
			thought: plan.thought || "",
			actions: plan.actions,
			nextCheckIn: Math.max(6, Math.min(30, plan.nextCheckIn || 12)),
			confidence: Math.max(0, Math.min(1, plan.confidence || .5))
		},
		raw: res.content,
		tokens: res.tokens
	};
}
async function chatSwarm(cfg, history, user, metrics, config) {
	const res = await llamaChat(cfg, [
		{
			role: "system",
			content: SWARM_SYSTEM
		},
		...history.slice(-12),
		{
			role: "user",
			content: `[swarm energy ${metrics.avgEnergy.toFixed(0)} · coherence ${(metrics.coherence * 100).toFixed(0)}% · ${config.behavior} · gen ${metrics.generation} · ${metrics.resourcesFound} resources]\n\n${user}`
		}
	], Math.min(cfg.maxTokens, 700));
	if (!res.ok) return {
		ok: false,
		error: res.error || "Qwen silent"
	};
	return {
		ok: true,
		text: res.content,
		tokens: res.tokens
	};
}
async function runMissionRound(cfg, input) {
	const res = await llamaChat(cfg, [{
		role: "system",
		content: SWARM_SYSTEM
	}, {
		role: "user",
		content: `Execute swarm mission round ${input.round}/3. The five specialists (Meridian/coordinator, Kepler/explorer, Anvil/worker, Vesper/scout, Helix/carrier) actually do the work. This is live operations, not a rehearsal.

Mission:
${input.mission}

Hive memory:
${input.hive.slice(0, 12).join("\n") || "(empty)"}

Prior:
${input.prior || "(none)"}

Return JSON only:
{"brief":"what the swarm did this round","notes":["hive note"],"artifacts":[{"title":"...","body":"markdown deliverable","by":"Anvil"}]}

Round 1: plan and assign. Round 2: produce. Round 3: critique and package. Keep each artifact under 400 words.`
	}], 900);
	if (!res.ok) return {
		ok: false,
		error: res.error || "Qwen silent"
	};
	const parsed = parseJsonObject(res.content);
	if (!parsed) return {
		ok: false,
		error: "Qwen returned an unreadable round"
	};
	return {
		ok: true,
		brief: parsed.brief || "",
		notes: parsed.notes ?? [],
		artifacts: parsed.artifacts ?? [],
		tokens: res.tokens
	};
}
var SAVE_KEY = "hivefield.states.v1";
function HiveApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	if (!engineRef.current) {
		const created = new SwarmEngine();
		created.reset();
		engineRef.current = created;
	}
	const cfgRef = (0, import_react.useRef)({ ...DEFAULT_CONFIG });
	const pausedRef = (0, import_react.useRef)(false);
	const selectedRef = (0, import_react.useRef)(null);
	const [config, setConfig] = (0, import_react.useState)({ ...DEFAULT_CONFIG });
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [metrics, setMetrics] = (0, import_react.useState)(() => engineRef.current.metrics());
	const [events, setEvents] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [place, setPlace] = (0, import_react.useState)("resource");
	const [tab, setTab] = (0, import_react.useState)("qwen");
	const [history, setHistory] = (0, import_react.useState)({
		speed: [],
		coh: [],
		energy: []
	});
	const [llama, setLlama] = (0, import_react.useState)(() => ({
		endpoint: DEFAULT_LLAMA_ENDPOINT,
		model: QWEN_MODEL,
		temperature: .7,
		maxTokens: 512
	}));
	const [qwenOn, setQwenOn] = (0, import_react.useState)(false);
	const [chat, setChat] = (0, import_react.useState)([]);
	const [chatInput, setChatInput] = (0, import_react.useState)("");
	const [chatBusy, setChatBusy] = (0, import_react.useState)(false);
	const [goal, setGoal] = (0, import_react.useState)("");
	const [directing, setDirecting] = (0, import_react.useState)(false);
	const [planThought, setPlanThought] = (0, import_react.useState)("");
	const [actionLog, setActionLog] = (0, import_react.useState)([]);
	const [tokens, setTokens] = (0, import_react.useState)(0);
	const [mission, setMission] = (0, import_react.useState)("");
	const [missionBusy, setMissionBusy] = (0, import_react.useState)(false);
	const [round, setRound] = (0, import_react.useState)(0);
	const [artifacts, setArtifacts] = (0, import_react.useState)([]);
	const [mobilePane, setMobilePane] = (0, import_react.useState)("field");
	const chatHist = (0, import_react.useRef)([]);
	const directingRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		cfgRef.current = config;
		engineRef.current.config = config;
	}, [config]);
	(0, import_react.useEffect)(() => {
		pausedRef.current = paused;
	}, [paused]);
	(0, import_react.useEffect)(() => {
		selectedRef.current = selected;
	}, [selected]);
	(0, import_react.useEffect)(() => {
		directingRef.current = directing;
	}, [directing]);
	(0, import_react.useEffect)(() => {
		setLlama(loadLlamaConfig());
	}, []);
	const patch = (0, import_react.useCallback)((p) => {
		setConfig((c) => {
			const next = {
				...c,
				...p
			};
			engineRef.current.config = next;
			cfgRef.current = next;
			if (p.agentCount != null) engineRef.current.setCount(p.agentCount);
			return next;
		});
	}, []);
	const reset = (0, import_react.useCallback)(() => {
		engineRef.current.reset(cfgRef.current);
		setEvents([...engineRef.current.events]);
		setHistory({
			speed: [],
			coh: [],
			energy: []
		});
		setRound(0);
	}, []);
	(0, import_react.useEffect)(() => {
		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		if (!wrap || !canvas) return;
		const eng = engineRef.current;
		let lastW = 0;
		let lastH = 0;
		let ctx = null;
		const ro = new ResizeObserver(() => {
			const rect = wrap.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = Math.max(320, Math.floor(rect.width));
			const h = Math.max(280, Math.floor(rect.height));
			if (w === lastW && h === lastH) return;
			lastW = w;
			lastH = h;
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			eng.resize(w, h);
		});
		ro.observe(wrap);
		let raf = 0;
		let last = performance.now();
		let acc = 0;
		const STEP = 1 / 60;
		let snap = 0;
		let lastEvt = "";
		let alive = true;
		const loop = (now) => {
			if (!alive) return;
			const dt = Math.min((now - last) / 1e3, .05);
			last = now;
			if (!pausedRef.current) {
				acc += dt;
				let guard = 0;
				while (acc >= STEP && guard++ < 3) {
					eng.step(STEP);
					acc -= STEP;
				}
				if (acc > STEP * 3) acc = 0;
			}
			if (ctx) renderSwarm(ctx, eng, selectedRef.current);
			snap += dt;
			if (snap > .5) {
				snap = 0;
				const m = eng.metrics();
				setMetrics(m);
				const head = eng.events[0]?.id ?? "";
				if (head !== lastEvt) {
					lastEvt = head;
					setEvents([...eng.events]);
				}
				setHistory((h) => ({
					speed: [...h.speed, m.avgSpeed].slice(-48),
					coh: [...h.coh, m.coherence * 100].slice(-48),
					energy: [...h.energy, m.avgEnergy].slice(-48)
				}));
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => {
			alive = false;
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.code === "Space") {
				e.preventDefault();
				setPaused((p) => !p);
			}
			if (e.key === "r" || e.key === "R") reset();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [reset]);
	const onCanvasClick = (e) => {
		const canvas = canvasRef.current;
		const eng = engineRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width * eng.w;
		const y = (e.clientY - rect.top) / rect.height * eng.h;
		const hit = eng.agents.find((a) => Math.hypot(a.position.x - x, a.position.y - y) < 16);
		if (hit) {
			setSelected(hit.id);
			return;
		}
		if (config.obstacleMode || place === "threat") eng.addThreat(x, y);
		else if (config.constructionEnabled && place === "build") eng.addStructure(x, y);
		else eng.addResource(x, y);
		setEvents([...eng.events]);
	};
	const applyScenario = (id) => {
		const s = SCENARIOS.find((x) => x.id === id);
		if (!s) return;
		const next = {
			...cfgRef.current,
			...s.config
		};
		setConfig(next);
		cfgRef.current = next;
		engineRef.current.reset(next);
		setEvents([...engineRef.current.events]);
	};
	const selectedAgent = engineRef.current.agents.find((a) => a.id === selected) ?? null;
	const sendChat = async () => {
		const text = chatInput.trim();
		if (!text || chatBusy) return;
		setChatInput("");
		setChat((c) => [...c, {
			role: "user",
			content: text
		}]);
		setChatBusy(true);
		const res = await chatSwarm(llama, chatHist.current, text, engineRef.current.metrics(), cfgRef.current);
		setChatBusy(false);
		if (!res.ok) {
			setChat((c) => [...c, {
				role: "assistant",
				content: `Offline. ${res.error}`
			}]);
			setQwenOn(false);
			return;
		}
		chatHist.current = [
			...chatHist.current,
			{
				role: "user",
				content: text
			},
			{
				role: "assistant",
				content: res.text
			}
		].slice(-16);
		setChat((c) => [...c, {
			role: "assistant",
			content: res.text
		}]);
		setTokens((t) => t + res.tokens);
		setQwenOn(true);
	};
	const directorOnce = (0, import_react.useCallback)(async () => {
		if (!await probeLlama(llama.endpoint)) {
			setPlanThought("Qwen is offline. Start llama.cpp (Qwen 3.6 27B) and probe the endpoint.");
			setQwenOn(false);
			setDirecting(false);
			return;
		}
		const res = await runDirectorCycle(llama, {
			goal,
			metrics: engineRef.current.metrics(),
			config: cfgRef.current,
			recent: engineRef.current.events.slice(0, 6).map((e) => e.text)
		});
		if (!res.ok) {
			setPlanThought(res.error);
			setQwenOn(false);
			setDirecting(false);
			return;
		}
		setQwenOn(true);
		setPlanThought(res.plan.thought);
		setTokens((t) => t + res.tokens);
		const notes = [];
		for (const a of res.plan.actions) notes.push(engineRef.current.applyAction(a));
		setConfig({ ...engineRef.current.config });
		setActionLog((l) => [...notes, ...l].slice(0, 24));
		engineRef.current.log("ai", res.plan.thought, "info");
		return res.plan.nextCheckIn;
	}, [goal, llama]);
	(0, import_react.useEffect)(() => {
		if (!directing) return;
		let stop = false;
		const run = async () => {
			while (!stop && directingRef.current) {
				const wait = await directorOnce() ?? 12;
				await new Promise((r) => setTimeout(r, wait * 1e3));
			}
		};
		run();
		return () => {
			stop = true;
		};
	}, [directing, directorOnce]);
	const deployMission = async () => {
		if (!mission.trim() || missionBusy) return;
		setMissionBusy(true);
		setRound(0);
		setArtifacts([]);
		engineRef.current.log("ai", "Mission accepted by the hive.", "ok");
		let prior = "";
		for (let r = 1; r <= 3; r++) {
			setRound(r);
			engineRef.current.agents.forEach((a) => {
				if ([
					"coordinator",
					"explorer",
					"worker",
					"scout",
					"carrier"
				].includes(a.role)) a.state = "thinking";
			});
			const res = await runMissionRound(llama, {
				mission: mission.trim(),
				round: r,
				hive: engineRef.current.hive.map((h) => h.text),
				prior
			});
			if (!res.ok) {
				engineRef.current.log("ai", res.error, "critical");
				setQwenOn(false);
				break;
			}
			setQwenOn(true);
			setTokens((t) => t + res.tokens);
			prior += `\nR${r}: ${res.brief}`;
			res.notes.forEach((n) => engineRef.current.remember(n));
			setArtifacts((a) => [...a, ...res.artifacts.map((art, i) => ({
				id: `${r}-${i}-${art.title}`,
				title: art.title,
				body: art.body,
				by: art.by
			}))]);
			engineRef.current.log("ai", res.brief, "ok");
		}
		engineRef.current.agents.forEach((a) => {
			if (a.state === "thinking") a.state = "moving";
		});
		setMissionBusy(false);
	};
	const saveState = () => {
		const name = `hive-${(/* @__PURE__ */ new Date()).toISOString().slice(11, 19)}`;
		const bag = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
		bag.unshift({
			name,
			config
		});
		localStorage.setItem(SAVE_KEY, JSON.stringify(bag.slice(0, 12)));
		engineRef.current.log("system", `State saved as ${name}.`, "ok");
		setEvents([...engineRef.current.events]);
	};
	const saved = (0, import_react.useMemo)(() => {
		try {
			return JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
		} catch {
			return [];
		}
	}, [events.length]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh min-h-0 flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 shrink-0 items-center gap-3 border-b border-border px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hexagon, {
						className: "size-5 text-signal",
						strokeWidth: 1.75
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium tracking-tight",
							children: "Hivefield"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden text-xs text-muted sm:block",
							children: [
								"Operations · ",
								QWEN_LABEL,
								" is the brain"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDot, {
								on: qwenOn,
								label: qwenOn ? QWEN_LABEL : "Qwen offline"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": paused ? "Resume" : "Pause",
								onClick: () => setPaused((p) => !p),
								children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Reset swarm",
								onClick: reset,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex shrink-0 gap-1 border-b border-border px-2 py-1 md:hidden",
				children: [
					["field", "Field"],
					["controls", "Controls"],
					["intel", "Qwen"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: cn("h-11 flex-1 rounded-md text-sm", mobilePane === id ? "bg-raised text-fg" : "text-muted"),
					onClick: () => setMobilePane(id),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 md:grid-cols-[260px_minmax(0,1fr)_320px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: cn("min-h-0 overflow-y-auto border-border p-3 md:block md:border-r", mobilePane === "controls" ? "block" : "hidden"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
								title: "Behavior",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 gap-1",
									children: BEHAVIORS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											engineRef.current.setBehavior(b.id);
											patch({ behavior: b.id });
										},
										className: cn("rounded-sm px-3 py-2 text-left text-sm transition-colors duration-150", config.behavior === b.id ? "bg-raised text-fg" : "text-muted hover:text-fg"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium",
											children: b.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-subtle",
											children: b.blurb
										})]
									}, b.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
								title: "Scenarios",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col gap-1",
									children: SCENARIOS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => applyScenario(s.id),
										className: "rounded-sm px-3 py-2 text-left text-sm text-muted hover:bg-raised hover:text-fg",
										children: s.name
									}, s.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
								title: "Parameters",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Agents",
										value: config.agentCount,
										min: 5,
										max: 80,
										step: 1,
										onChange: (v) => patch({ agentCount: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Separation",
										value: config.separationWeight,
										min: 0,
										max: 4,
										step: .1,
										onChange: (v) => patch({ separationWeight: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Alignment",
										value: config.alignmentWeight,
										min: 0,
										max: 4,
										step: .1,
										onChange: (v) => patch({ alignmentWeight: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Cohesion",
										value: config.cohesionWeight,
										min: 0,
										max: 4,
										step: .1,
										onChange: (v) => patch({ cohesionWeight: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Explore",
										value: config.explorationWeight,
										min: 0,
										max: 3,
										step: .1,
										onChange: (v) => patch({ explorationWeight: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Perception",
										value: config.perceptionRadius,
										min: 30,
										max: 160,
										step: 2,
										onChange: (v) => patch({ perceptionRadius: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Max speed",
										value: config.maxSpeed,
										min: 1,
										max: 6,
										step: .1,
										onChange: (v) => patch({ maxSpeed: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Clock",
										value: config.speed,
										min: .2,
										max: 2.4,
										step: .1,
										onChange: (v) => patch({ speed: v })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
								title: "Systems",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Trails",
										value: config.showTrails,
										onChange: (v) => patch({ showTrails: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Links",
										value: config.showConnections,
										onChange: (v) => patch({ showConnections: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Perception",
										value: config.showPerception,
										onChange: (v) => patch({ showPerception: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Pheromone",
										value: config.pheromoneEnabled,
										onChange: (v) => patch({
											pheromoneEnabled: v,
											showHeatmap: v || config.showHeatmap
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Heatmap",
										value: config.showHeatmap,
										onChange: (v) => patch({ showHeatmap: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Neural nets",
										value: config.neuralNetEnabled,
										onChange: (v) => patch({ neuralNetEnabled: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Evolution",
										value: config.evolutionEnabled,
										onChange: (v) => patch({
											evolutionEnabled: v,
											neuralNetEnabled: v || config.neuralNetEnabled
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Q-learning",
										value: config.qLearningEnabled,
										onChange: (v) => patch({ qLearningEnabled: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Hive memory",
										value: config.memoryEnabled,
										onChange: (v) => patch({ memoryEnabled: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "World / wind",
										value: config.environmentEnabled,
										onChange: (v) => patch({ environmentEnabled: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Construction",
										value: config.constructionEnabled,
										onChange: (v) => patch({ constructionEnabled: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Lifecycle",
										value: config.lifecycleEnabled,
										onChange: (v) => patch({ lifecycleEnabled: v })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Hazard click",
										value: config.obstacleMode,
										onChange: (v) => patch({ obstacleMode: v })
									}),
									config.environmentEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Wind",
										value: config.windStrength,
										min: 0,
										max: 2.5,
										step: .1,
										onChange: (v) => patch({ windStrength: v })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										label: "Wind dir",
										value: config.windDirection,
										min: 0,
										max: 6.28,
										step: .05,
										onChange: (v) => patch({ windDirection: v })
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
								title: "Place on field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1",
									children: [
										"resource",
										"threat",
										"build"
									].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setPlace(m),
										className: cn("h-10 flex-1 rounded-sm text-xs capitalize", place === m ? "bg-raised text-fg" : "text-muted"),
										children: m
									}, m))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-subtle",
									children: "Click the field to drop. Click an agent to inspect. Space pauses, R resets."
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: cn("relative min-h-0 min-w-0", mobilePane === "field" ? "block" : "hidden md:block"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: wrapRef,
							className: "absolute inset-0 touch-none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
								ref: canvasRef,
								className: "block size-full",
								onClick: onCanvasClick,
								role: "img",
								"aria-label": "Live swarm field"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									label: "Speed",
									value: metrics.avgSpeed.toFixed(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									label: "Coherence",
									value: `${Math.round(metrics.coherence * 100)}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									label: "Energy",
									value: `${Math.round(metrics.avgEnergy)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									label: "Links",
									value: `${metrics.connections}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									label: "Gen",
									value: `${metrics.generation}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									label: "Res",
									value: `${metrics.resourcesFound}/${metrics.resourcesTotal}`
								}),
								config.environmentEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									label: "World",
									value: `${clock(engineRef.current.world.time)} ${engineRef.current.world.weather}`
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: cn("min-h-0 overflow-y-auto border-border p-3 md:block md:border-l", mobilePane === "intel" ? "block" : "hidden"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-3 flex gap-1 rounded-lg bg-surface p-1",
								children: [
									["qwen", "Qwen"],
									["analytics", "Stats"],
									["hive", "Hive"],
									["log", "Log"]
								].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setTab(id),
									className: cn("h-9 flex-1 rounded-md text-xs font-medium", tab === id ? "bg-raised text-fg" : "text-muted"),
									children: label
								}, id))
							}),
							tab === "qwen" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
										title: `Qwen 3.6 27B · llama.cpp`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs leading-relaxed text-muted",
													children: [
														"Qwen is the swarm's brain. The field is only the bodies. Point this at your llama.cpp OpenAI server — model stays locked to ",
														"unsloth/Qwen3.6-27B-GGUF:Q6_K_XL",
														"."
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "text-xs text-muted",
													children: "Endpoint"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "h-10 w-full rounded-md bg-raised px-3 font-mono text-xs text-fg outline-none ring-1 ring-border focus:ring-ring",
													value: llama.endpoint,
													onChange: (e) => setLlama((c) => ({
														...c,
														endpoint: e.target.value
													})),
													onBlur: () => saveLlamaConfig(llama),
													spellCheck: false
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "secondary",
														size: "sm",
														className: "flex-1",
														onClick: async () => {
															saveLlamaConfig(llama);
															setQwenOn(await probeLlama(llama.endpoint));
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {}), " Probe"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "secondary",
														size: "sm",
														onClick: saveState,
														children: "Save"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-subtle",
													children: "Same contract as your project: POST /v1/chat/completions. Default here is :8088 so it does not collide with this console. Your llama.cpp can stay on :8080 — just set the endpoint."
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
										title: "Director",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "mb-2 h-10 w-full rounded-md bg-raised px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-ring",
												placeholder: "Goal — maximize gather, hold formation…",
												value: goal,
												onChange: (e) => setGoal(e.target.value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: directing ? "danger" : "primary",
												size: "sm",
												className: "w-full",
												onClick: () => setDirecting((d) => !d),
												children: [directing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, {}), directing ? "Stop director" : "Start Qwen director"]
											}),
											planThought && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-xs leading-relaxed text-muted",
												children: planThought
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-2 space-y-1",
												children: actionLog.slice(0, 6).map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
													className: "font-mono text-xs text-subtle",
													children: a
												}, i))
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
										title: "Mission",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												className: "mb-2 min-h-24 w-full resize-y rounded-md bg-raised p-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-ring",
												placeholder: "Give the five specialists a real job.",
												value: mission,
												onChange: (e) => setMission(e.target.value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mb-2 flex flex-col gap-1",
												children: SAMPLE_MISSIONS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "rounded-sm px-2 py-2 text-left text-xs text-muted hover:bg-raised hover:text-fg",
													onClick: () => setMission(m),
													children: m
												}, m))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												className: "w-full",
												size: "sm",
												disabled: missionBusy || !mission.trim(),
												onClick: () => void deployMission(),
												children: missionBusy ? `Round ${round}/3` : "Deploy specialists"
											}),
											artifacts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
												className: "mt-2 rounded-md bg-raised p-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-xs text-muted",
														children: a.by
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
														className: "text-sm font-medium",
														children: a.title
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
														className: "mt-1 whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted",
														children: a.body
													})
												]
											}, a.id))
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
										title: "Chat",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-2 max-h-56 space-y-2 overflow-y-auto",
												children: [
													chat.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-subtle",
														children: "Ask Qwen about the live swarm."
													}),
													chat.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: cn("rounded-md px-3 py-2 text-xs leading-relaxed", m.role === "user" ? "ml-6 bg-raised" : "mr-4 bg-surface ring-1 ring-border"),
														children: m.content
													}, i)),
													chatBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-xs text-muted",
														children: "Qwen is thinking…"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "h-10 min-w-0 flex-1 rounded-md bg-raised px-3 text-sm outline-none ring-1 ring-border focus:ring-ring",
													value: chatInput,
													onChange: (e) => setChatInput(e.target.value),
													onKeyDown: (e) => e.key === "Enter" && void sendChat(),
													placeholder: "Ask the swarm…"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													"aria-label": "Send",
													onClick: () => void sendChat(),
													disabled: chatBusy,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 font-mono text-xs text-subtle",
												children: ["tokens ", tokens]
											})
										]
									})
								]
							}),
							tab === "analytics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
										label: "Speed",
										data: history.speed
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
										label: "Coherence",
										data: history.coh
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
										label: "Energy",
										data: history.energy
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												k: "Messages",
												v: metrics.messages
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												k: "Clusters",
												v: metrics.clusters
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												k: "Structures",
												v: metrics.structures
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												k: "Threats",
												v: metrics.threats
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												k: "Hive notes",
												v: metrics.hiveSize
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												k: "Q explore",
												v: metrics.qExplore.toFixed(2)
											})
										]
									}),
									selectedAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
										title: `${selectedAgent.name} · ${ROLE_TITLE[selectedAgent.role]}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: ROLE_DUTY[selectedAgent.role]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 grid grid-cols-2 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														k: "Energy",
														v: Math.round(selectedAgent.energy)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														k: "Fitness",
														v: Math.round(selectedAgent.fitness)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														k: "State",
														v: selectedAgent.state
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
														k: "Gen",
														v: selectedAgent.generation
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 space-y-1",
												children: Object.entries(selectedAgent.traits).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "w-24 capitalize text-muted",
														children: k
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-1 flex-1 rounded-full bg-raised",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "h-full rounded-full bg-accent",
															style: { width: `${v * 100}%` }
														})
													})]
												}, k))
											})
										]
									})
								]
							}),
							tab === "hive" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Shared memory the swarm has written."
									}),
									engineRef.current.hive.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-subtle",
										children: "Empty — discoveries land here."
									}),
									engineRef.current.hive.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-md bg-raised px-3 py-2 text-xs text-fg",
										children: n.text
									}, n.id)),
									saved.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
										title: "Saved configs",
										children: saved.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "block w-full rounded-sm px-2 py-2 text-left text-xs text-muted hover:bg-raised hover:text-fg",
											onClick: () => {
												setConfig(s.config);
												engineRef.current.reset(s.config);
											},
											children: s.name
										}, s.name))
									})
								]
							}),
							tab === "log" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-1",
								children: events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2 rounded-md px-2 py-2 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: cn("mt-0.5 size-3.5 shrink-0", e.severity === "ok" ? "text-signal" : e.severity === "warn" ? "text-warn" : e.severity === "critical" ? "text-danger" : "text-muted") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: e.text
									})]
								}, e.id))
							})
						]
					})
				]
			})
		]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-2 text-xs font-medium uppercase tracking-wider text-subtle",
			children: title
		}), children]
	});
}
function SliderRow({ label, value, min, max, step, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mb-2 block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex justify-between text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono tabular-nums text-subtle",
				children: Number.isInteger(step) ? value : value.toFixed(1)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min,
			max,
			step,
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "h-8 w-full accent-accent"
		})]
	});
}
function Toggle({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onChange(!value),
		className: "flex h-10 w-full items-center justify-between rounded-sm px-1 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("h-5 w-9 rounded-full p-0.5 transition-colors duration-150", value ? "bg-signal" : "bg-raised"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block size-4 rounded-full bg-bg transition-transform duration-150", value ? "translate-x-4" : "translate-x-0") })
		})]
	});
}
function Chip({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto rounded-md bg-surface/90 px-2.5 py-1.5 shadow-[var(--shadow-border)] backdrop-blur-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-sm tabular-nums",
			children: value
		})]
	});
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-raised p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-lg tabular-nums",
			children: v
		})]
	});
}
function Spark({ label, data }) {
	const max = Math.max(1, ...data);
	const pts = data.map((d, i) => {
		return `${data.length < 2 ? 0 : i / (data.length - 1) * 120},${28 - d / max * 26}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-raised p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 text-[10px] uppercase tracking-wider text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 120 28",
			className: "h-8 w-full",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4",
				className: "text-accent",
				points: pts
			})
		})]
	});
}
function StatusDot({ on, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden items-center gap-2 pr-2 sm:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", on ? "bg-signal" : "bg-danger") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted",
			children: label
		})]
	});
}
function clock(t) {
	const h = Math.floor(t) % 24;
	const m = Math.floor(t % 1 * 60);
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HiveApp, {});
}
//#endregion
export { Home as component };
