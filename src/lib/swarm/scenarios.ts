import type { SwarmConfig } from "./types";

export interface Scenario {
  id: string;
  name: string;
  description: string;
  config: Partial<SwarmConfig>;
}

export const SCENARIOS: Scenario[] = [
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
      explorationWeight: 0.5,
      showTrails: true,
      showConnections: true,
      pheromoneEnabled: false,
    },
  },
  {
    id: "resource_rush",
    name: "Resource rush",
    description: "Compete to gather scattered resources.",
    config: {
      behavior: "resource_gathering",
      agentCount: 40,
      separationWeight: 2,
      alignmentWeight: 0.5,
      cohesionWeight: 0.8,
      explorationWeight: 1.5,
      memoryEnabled: true,
      showTrails: true,
    },
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
      evolutionRate: 0.08,
      showTrails: false,
      showConnections: true,
    },
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
      cohesionWeight: 0.5,
    },
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
      showConnections: true,
    },
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
      showConnections: true,
    },
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
      showTrails: true,
    },
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
      windDirection: 0.5,
      separationWeight: 2,
      alignmentWeight: 1.2,
    },
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
      showConnections: true,
    },
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
      showTrails: true,
    },
  },
  {
    id: "grid_patrol",
    name: "Grid patrol",
    description: "Systematic coverage.",
    config: {
      behavior: "patrol",
      agentCount: 36,
      separationWeight: 2.5,
      alignmentWeight: 0.5,
      cohesionWeight: 0.3,
      showTrails: true,
    },
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
      separationWeight: 1.8,
    },
  },
];
