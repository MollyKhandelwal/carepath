/*
 * CAREPATH Clinical Instrument direction: deterministic demo data lives here so
 * the UI can later swap this module for a backend simulation service.
 */

export type HospitalId = "A" | "B" | "C" | "D";
export type RoomId = "general" | "private" | "suite";
export type Severity = "Low" | "Medium" | "High";
export type ConstraintState = "Passed" | "Failed";

export interface Hospital {
  id: HospitalId;
  name: string;
  location: string;
  network: "In-network" | "Out-of-network";
  coverage: "High" | "Medium" | "Limited";
  cost: number;
  impact: "Low" | "Medium" | "High";
  convenience: "Low" | "Medium" | "High";
  detail: string;
}

export interface Decision {
  hospital: HospitalId;
  room: RoomId;
}

export interface ConstraintResult {
  name: string;
  description: string;
  status: ConstraintState;
}

export interface SimulationResult {
  decision: Decision;
  feasible: boolean;
  affectedStages: string[];
  severity: Severity;
  constraints: ConstraintResult[];
  explanation: string;
  nearestFeasible: string;
  estimatedCost: number;
}

export interface ReplayEntry {
  id: string;
  timestamp: string;
  from: Decision;
  to: Decision;
  result: SimulationResult;
}

export const stages = ["Admission", "Investigation", "Procedure", "Recovery"] as const;

export const hospitals: Hospital[] = [
  {
    id: "A",
    name: "Hospital A",
    location: "Bangalore · Indiranagar",
    network: "In-network",
    coverage: "High",
    cost: 180000,
    impact: "Low",
    convenience: "Medium",
    detail: "Balanced coverage with a stable procedure pathway.",
  },
  {
    id: "B",
    name: "Hospital B",
    location: "Bangalore · Whitefield",
    network: "Out-of-network",
    coverage: "Medium",
    cost: 160000,
    impact: "High",
    convenience: "High",
    detail: "Convenient access, but network eligibility creates downstream risk.",
  },
  {
    id: "C",
    name: "Hospital C",
    location: "Bangalore · Koramangala",
    network: "In-network",
    coverage: "High",
    cost: 200000,
    impact: "Medium",
    convenience: "High",
    detail: "Higher cost with strong continuity across every care stage.",
  },
  {
    id: "D",
    name: "Hospital D",
    location: "Bangalore · Jayanagar",
    network: "In-network",
    coverage: "Medium",
    cost: 150000,
    impact: "Low",
    convenience: "Low",
    detail: "Lower estimate with a narrower coverage fit and fewer conveniences.",
  },
];

export const roomOptions: { id: RoomId; label: string; delta: number; note: string }[] = [
  { id: "general", label: "General Ward", delta: -30000, note: "Shared room; lowest cost" },
  { id: "private", label: "Private Room", delta: 0, note: "Baseline room selection" },
  { id: "suite", label: "Suite Room", delta: 55000, note: "Premium room; extra eligibility checks" },
];

export const baselineDecision: Decision = { hospital: "A", room: "private" };

export function hospitalById(id: HospitalId) {
  return hospitals.find((hospital) => hospital.id === id) ?? hospitals[0];
}

export function roomById(id: RoomId) {
  return roomOptions.find((room) => room.id === id) ?? roomOptions[1];
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value).replace("₹", "₹");
}

export function decisionLabel(decision: Decision) {
  return `${hospitalById(decision.hospital).name} · ${roomById(decision.room).label}`;
}

export function getConstraintResults(decision: Decision): ConstraintResult[] {
  const networkFailed = decision.hospital === "B";
  const roomFailed = decision.room === "suite" && (decision.hospital === "B" || decision.hospital === "D");
  const coverageFailed = decision.room === "suite" && (decision.hospital === "B" || decision.hospital === "D");
  const facilityFailed = decision.hospital === "D" && decision.room === "suite";
  const stageFailed = decision.hospital === "B" && decision.room === "suite";

  return [
    {
      name: "Network Eligibility",
      description: networkFailed ? "Selected hospital is outside the policy network." : "Hospital is covered by the selected policy network.",
      status: networkFailed ? "Failed" : "Passed",
    },
    {
      name: "Room Eligibility",
      description: roomFailed ? "The requested room is not available under this pathway." : "Room selection is supported for this hospital.",
      status: roomFailed ? "Failed" : "Passed",
    },
    {
      name: "Coverage Limit",
      description: coverageFailed ? "Room upgrade crosses the policy coverage limit." : "Estimated room and procedure costs fit the coverage band.",
      status: coverageFailed ? "Failed" : "Passed",
    },
    {
      name: "Facility Availability",
      description: facilityFailed ? "The required facility slot is constrained for this combination." : "Required facility capacity is available.",
      status: facilityFailed ? "Failed" : "Passed",
    },
    {
      name: "Care Stage Eligibility",
      description: stageFailed ? "The full procedure sequence cannot continue under this combination." : "All care stages can continue under this combination.",
      status: stageFailed ? "Failed" : "Passed",
    },
  ];
}

export function simulateDecision(decision: Decision): SimulationResult {
  const constraints = getConstraintResults(decision);
  const networkFailed = decision.hospital === "B";
  const roomFailed = constraints[1].status === "Failed";
  const coverageFailed = constraints[2].status === "Failed";
  const affectedStages = [
    ...(networkFailed || constraints[3].status === "Failed" ? ["Admission"] : []),
    ...(networkFailed || constraints[4].status === "Failed" ? ["Investigation"] : []),
    ...(networkFailed || roomFailed || coverageFailed ? ["Procedure"] : []),
  ];
  const feasible = affectedStages.length === 0 && constraints.every((constraint) => constraint.status === "Passed");
  const severity: Severity = affectedStages.length === 0 ? "Low" : affectedStages.length >= 3 ? "High" : "Medium";
  const hospital = hospitalById(decision.hospital);
  const room = roomById(decision.room);
  const failedConstraint = constraints.find((constraint) => constraint.status === "Failed");

  let explanation = "This selection preserves the baseline care sequence with no downstream stage changes.";
  let nearestFeasible = "Hospital A or Hospital C with a Private Room";
  if (networkFailed) {
    explanation = "Changing to Hospital B causes a network violation which affects downstream stages.";
    nearestFeasible = "Hospital C with the same room keeps the pathway in-network.";
  } else if (roomFailed || coverageFailed) {
    explanation = "The room upgrade introduces an eligibility or coverage constraint for this hospital.";
    nearestFeasible = `${hospital.name} with a Private Room is the smallest change back to feasible.`;
  } else if (decision.hospital === "D") {
    explanation = "Hospital D stays feasible, but its medium coverage and lower convenience create a different trade-off.";
    nearestFeasible = "Hospital A is the closest balanced option.";
  }

  return {
    decision,
    feasible,
    affectedStages,
    severity,
    constraints,
    explanation,
    nearestFeasible,
    estimatedCost: hospital.cost + room.delta,
  };
}

export function buildRepairs(decision: Decision) {
  const repairs: { id: string; label: string; helper: string; changeCount: number; decision: Decision }[] = [];
  if (decision.hospital === "B") {
    repairs.push({
      id: "hospital-c",
      label: "Hospital B → Hospital C",
      helper: "Keep the selected room, restore in-network continuity.",
      changeCount: 1,
      decision: { ...decision, hospital: "C" },
    });
  }
  if (decision.room === "suite") {
    repairs.push({
      id: "private-room",
      label: "Suite Room → Private Room",
      helper: "Remove the room-level coverage constraint.",
      changeCount: 1,
      decision: { ...decision, room: "private" },
    });
  }
  if (decision.hospital === "B" && decision.room === "suite") {
    repairs.push({
      id: "combined",
      label: "Hospital B → C + Room → Private",
      helper: "A two-step reset to the strongest feasible pathway.",
      changeCount: 2,
      decision: { hospital: "C", room: "private" },
    });
  }
  if (repairs.length === 0) {
    repairs.push({
      id: "explore-c",
      label: "Hospital A → Hospital C",
      helper: "Explore a higher-convenience in-network alternative.",
      changeCount: 1,
      decision: { hospital: "C", room: decision.room },
    });
  }
  return repairs;
}

export function defaultReplay(): ReplayEntry[] {
  const first = simulateDecision({ hospital: "B", room: "suite" });
  const second = simulateDecision({ hospital: "C", room: "private" });
  return [
    { id: "replay-1", timestamp: "Today, 10:42 AM", from: baselineDecision, to: first.decision, result: first },
    { id: "replay-2", timestamp: "Yesterday, 4:16 PM", from: baselineDecision, to: second.decision, result: second },
  ];
}

export function findClosestFeasible(decision: Decision) {
  if (decision.hospital === "B") return "Hospital C";
  if (decision.room === "suite") return `${hospitalById(decision.hospital).name} + Private Room`;
  return "Hospital A";
}
