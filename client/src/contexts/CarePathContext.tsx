import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  baselineDecision,
  buildRepairs,
  defaultReplay,
  decisionLabel,
  simulateDecision,
  type Decision,
  type HospitalId,
  type ReplayEntry,
  type RoomId,
  type SimulationResult,
} from "@/lib/carepath";

export interface ScenarioContext {
  id: number | null;
  policy: string;
  location: string;
  careStage: string;
  coverage: string;
}

interface CarePathContextValue {
  baseline: Decision;
  decision: Decision;
  result: SimulationResult;
  replay: ReplayEntry[];

  scenarioId: number | null;
  scenarioContext: ScenarioContext;

  setScenarioId: (id: number | null) => void;
  setScenarioContext: (context: ScenarioContext) => void;

  setDecision: (decision: Decision) => void;
  simulate: () => void;
  applyRepair: (decision: Decision) => void;
  applyReplay: (entry: ReplayEntry) => void;

  setHospital: (hospital: HospitalId) => void;
  setRoom: (room: RoomId) => void;

  repairs: ReturnType<typeof buildRepairs>;
  baselineLabel: string;
  currentLabel: string;
}

const CarePathContext =
  createContext<CarePathContextValue | null>(null);

export function CarePathProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [decision, setDecisionState] =
    useState<Decision>(baselineDecision);

  const [result, setResult] =
    useState<SimulationResult>(() =>
      simulateDecision(baselineDecision),
    );

  const [replay, setReplay] =
    useState<ReplayEntry[]>(defaultReplay);

  const [scenarioId, setScenarioId] =
    useState<number | null>(null);

  const [scenarioContext, setScenarioContextState] =
    useState<ScenarioContext>({
      id: null,
      policy: "Demo Policy A",
      location: "Bangalore",
      careStage: "Procedure",
      coverage: "Comprehensive",
    });

  const setScenarioContext = (context: ScenarioContext) => {
    setScenarioContextState(context);
    setScenarioId(context.id);
  };

  const runSimulation = (nextDecision: Decision) => {
    const nextResult = simulateDecision(nextDecision);

    setDecisionState(nextDecision);
    setResult(nextResult);

    const isBaseline =
      nextDecision.hospital === baselineDecision.hospital &&
      nextDecision.room === baselineDecision.room;

    if (!isBaseline) {
      const entry: ReplayEntry = {
        id: `replay-${Date.now()}`,
        timestamp: "Just now",
        from: baselineDecision,
        to: nextDecision,
        result: nextResult,
      };

      setReplay((current) =>
        [
          entry,
          ...current.filter(
            (item) => item.id !== entry.id,
          ),
        ].slice(0, 8),
      );
    }
  };

  const value = useMemo<CarePathContextValue>(
    () => ({
      baseline: baselineDecision,
      decision,
      result,
      replay,

      scenarioId,
      scenarioContext,

      setScenarioId,
      setScenarioContext,

      setDecision: runSimulation,
      simulate: () => runSimulation(decision),
      applyRepair: runSimulation,
      applyReplay: (entry) =>
        runSimulation(entry.to),

      setHospital: (hospital) =>
        setDecisionState((current) => ({
          ...current,
          hospital,
        })),

      setRoom: (room) =>
        setDecisionState((current) => ({
          ...current,
          room,
        })),

      repairs: buildRepairs(decision),

      baselineLabel:
        decisionLabel(baselineDecision),

      currentLabel:
        decisionLabel(decision),
    }),
    [
      decision,
      replay,
      result,
      scenarioId,
      scenarioContext,
    ],
  );

  return (
    <CarePathContext.Provider value={value}>
      {children}
    </CarePathContext.Provider>
  );
}

export function useCarePath() {
  const context = useContext(CarePathContext);

  if (!context) {
    throw new Error(
      "useCarePath must be used inside CarePathProvider",
    );
  }

  return context;
}