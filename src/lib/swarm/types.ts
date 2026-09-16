export type Role = "explorer" | "worker" | "coordinator" | "scout" | "carrier";

export type AgentState =
  | "idle"
  | "moving"
  | "communicating"
  | "working"
  | "alert"
  | "fleeing"
  | "building"
  | "thinking";

export type Behavior =
  | "flocking"
  | "search_rescue"
  | "resource_gathering"
  | "formation"
  | "patrol"
  | "consensus"
  | "predator_prey"
  | "neural_evolution"
  | "stigmergy";

export type ResourceType = "energy" | "data" | "material";

export interface Vec {
  x: number;
  y: number;
}

export interface NeuralNet {
  w1: number[][];
  w2: number[][];
  b1: number[];
  b2: number[];
}

export interface Traits {
  curiosity: number;
  sociability: number;
  aggression: number;
  caution: number;
  efficiency: number;
}

export interface Agent {
  id: string;
  role: Role;
  name: string;
  position: Vec;
  velocity: Vec;
  acc: Vec;
  maxSpeed: number;
  maxForce: number;
  radius: number;
  state: AgentState;
  energy: number;
  perception: number;
  trail: Vec[];
  color: string;
  pulse: number;
  fitness: number;
  age: number;
  traits: Traits;
  brain: NeuralNet;
  connections: string[];
  clusterId: number;
  generation: number;
}

export interface Resource {
  id: string;
  position: Vec;
  amount: number;
  type: ResourceType;
  discovered: boolean;
  discoveredBy?: string;
  deplete: number;
}

export interface Threat {
  id: string;
  position: Vec;
  radius: number;
  severity: number;
  type: "predator" | "hazard";
}

export interface Structure {
  id: string;
  type: "wall" | "tower" | "beacon" | "shelter";
  position: Vec;
  size: number;
  progress: number;
  completed: boolean;
}

export interface SwarmConfig {
  agentCount: number;
  perceptionRadius: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  explorationWeight: number;
  communicationRange: number;
  maxSpeed: number;
  behavior: Behavior;
  showTrails: boolean;
  showConnections: boolean;
  showPerception: boolean;
  showHeatmap: boolean;
  speed: number;
  pheromoneEnabled: boolean;
  neuralNetEnabled: boolean;
  evolutionEnabled: boolean;
  evolutionRate: number;
  memoryEnabled: boolean;
  environmentEnabled: boolean;
  windStrength: number;
  windDirection: number;
  constructionEnabled: boolean;
  qLearningEnabled: boolean;
  lifecycleEnabled: boolean;
  obstacleMode: boolean;
}

export interface WorldClock {
  time: number;
  day: number;
  timeOfDay: "dawn" | "day" | "dusk" | "night";
  season: "spring" | "summer" | "autumn" | "winter";
  weather: "clear" | "rain" | "storm" | "fog" | "wind";
  temperature: number;
  visibility: number;
}

export interface Metrics {
  avgSpeed: number;
  avgEnergy: number;
  coherence: number;
  connections: number;
  resourcesFound: number;
  resourcesTotal: number;
  avgFitness: number;
  generation: number;
  messages: number;
  clusters: number;
  structures: number;
  threats: number;
  pheromone: number;
  qExplore: number;
  hiveSize: number;
  eventRate: number;
  coverage: number;
}

export interface HiveEvent {
  id: string;
  at: number;
  kind: "system" | "discovery" | "threat" | "evolution" | "build" | "ai" | "message" | "browse";
  text: string;
  severity: "info" | "ok" | "warn" | "critical";
}

export interface HiveNote {
  id: string;
  text: string;
  at: number;
}

export interface Artifact {
  id: string;
  title: string;
  body: string;
  by: string;
  at: number;
}

export interface Cluster {
  id: number;
  agentIds: string[];
  center: Vec;
  purpose: string;
}

export const ROLE_COLOR: Record<Role, string> = {
  explorer: "#7eb8c9",
  worker: "#8cba9a",
  coordinator: "#d8dee6",
  scout: "#c9897a",
  carrier: "#9aa3c4",
};

export const ROLE_DUTY: Record<Role, string> = {
  coordinator: "Decomposes missions, assigns work, holds the thread.",
  explorer: "Kepler — live internet research. Search, map sources, find leverage.",
  worker: "Produces the deliverable — drafts, specs, plans.",
  scout: "Vesper — live page reads. Stress-tests claims against the wire.",
  carrier: "Packages, compresses, and hands the brief over.",
};

export const ROLE_TITLE: Record<Role, string> = {
  coordinator: "Coordinator",
  explorer: "Explorer",
  worker: "Worker",
  scout: "Scout",
  carrier: "Carrier",
};

export const ROLES: Role[] = [
  "explorer",
  "worker",
  "coordinator",
  "scout",
  "carrier",
];

export const BEHAVIORS: { id: Behavior; label: string; blurb: string }[] = [
  { id: "flocking", label: "Flocking", blurb: "Classic boids: separate, align, cohere." },
  { id: "search_rescue", label: "Search & rescue", blurb: "Explorers spread; workers converge on finds." },
  { id: "resource_gathering", label: "Gathering", blurb: "Locate and collect scattered resources." },
  { id: "formation", label: "V-formation", blurb: "Hold an aerodynamic wedge behind a leader." },
  { id: "patrol", label: "Grid patrol", blurb: "Systematic coverage of the field." },
  { id: "consensus", label: "Consensus", blurb: "The swarm converges on a moving decision point." },
  { id: "predator_prey", label: "Predator / prey", blurb: "Scouts hunt; the rest flee and regroup." },
  { id: "neural_evolution", label: "Neural evolution", blurb: "Each agent’s 6–8–4 net evolves by fitness." },
  { id: "stigmergy", label: "Stigmergy", blurb: "Pheromone trails — ant-colony foraging." },
];

export const DEFAULT_CONFIG: SwarmConfig = {
  agentCount: 40,
  perceptionRadius: 80,
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  explorationWeight: 0.5,
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
  evolutionRate: 0.05,
  memoryEnabled: true,
  environmentEnabled: false,
  windStrength: 0.5,
  windDirection: 0,
  constructionEnabled: false,
  qLearningEnabled: false,
  lifecycleEnabled: false,
  obstacleMode: false,
};

export const SAMPLE_MISSIONS = [
  "Research live sources and brief: what changed in agent-swarm tooling this month? Cite URLs.",
  "Draft a 7-day launch plan for a neighborhood tool library, including roles, risks, and a one-page pitch.",
  "Treat murmuration as an algorithm a robot fleet could steal. Spec the control loop, failure modes, and a first experiment — check the web for prior art.",
  "Write a hiring scorecard and first-week plan for a staff engineer joining a 6-person startup.",
];
