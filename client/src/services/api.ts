const API_BASE_URL = "http://localhost:3000/api";

// =========================
// TYPES
// =========================

export interface Scenario {
  id: number;
  name: string;
  location: string;
  careStage: string;
  status: string;
  createdAt: string;
}

export interface Pathway {
  id: number;
  scenarioId: number;
  hospital: string;
  roomType: string;
  estimatedCost: string;
  coverageFit: string;
  baseline: boolean;
  createdAt: string;
}

export interface Simulation {
  id: number;
  scenarioId: number;
  input: string;
  result: string;
  createdAt: string;
}

// =========================
// SCENARIOS
// =========================

export async function getScenarios(): Promise<Scenario[]> {
  const response = await fetch(`${API_BASE_URL}/scenarios`);

  if (!response.ok) {
    throw new Error("Failed to fetch scenarios");
  }

  const json = await response.json();
  return json.data;
}

export async function createScenario(data: {
  name: string;
  location: string;
  careStage: string;
  status?: string;
}): Promise<Scenario> {
  const response = await fetch(`${API_BASE_URL}/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create scenario");
  }

  const json = await response.json();
  return json.data;
}

// =========================
// PATHWAYS
// =========================

export async function getPathways(
  scenarioId?: number,
): Promise<Pathway[]> {
  const url = scenarioId
    ? `${API_BASE_URL}/pathways?scenarioId=${scenarioId}`
    : `${API_BASE_URL}/pathways`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch pathways");
  }

  const json = await response.json();
  return json.data;
}

// =========================
// SIMULATIONS
// =========================

export async function getSimulations(
  scenarioId?: number,
): Promise<Simulation[]> {
  const url = scenarioId
    ? `${API_BASE_URL}/simulations?scenarioId=${scenarioId}`
    : `${API_BASE_URL}/simulations`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch simulations");
  }

  const json = await response.json();
  return json.data;
}

export async function createSimulation(data: {
  scenarioId: number;
  input: string;
  result: string;
}): Promise<Simulation> {
  const response = await fetch(`${API_BASE_URL}/simulations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create simulation");
  }

  const json = await response.json();
  return json.data;
}