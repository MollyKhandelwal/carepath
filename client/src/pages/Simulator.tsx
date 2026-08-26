/*
 * CAREPATH Clinical Instrument direction: the simulator is a left-to-right
 * workbench where every control reveals causality, impact, and recovery.
 */

import { useEffect, useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  GitCompareArrows,
  Info,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  Button,
  ConstraintList,
  CurrentPathwayCard,
  ImpactDial,
  PageHeader,
  Panel,
  SectionLabel,
  SelectField,
  StatusPill,
} from "@/components/CarePathShell";

import { useCarePath } from "@/contexts/CarePathContext";

import {
  formatINR,
  hospitalById,
  hospitals,
  roomById,
  roomOptions,
  stages,
  simulateDecision,
  type HospitalId,
  type RoomId,
} from "@/lib/carepath";

import { createSimulation } from "@/services/api";

export default function Simulator() {
  const {
    decision,
    result,
    repairs,
    scenarioId,
    scenarioContext,
    setDecision,
    applyRepair,
  } = useCarePath();

  const [hospital, setHospital] = useState<HospitalId>(
    decision.hospital,
  );

  const [room, setRoom] = useState<RoomId>(
    decision.room,
  );

  const [isSimulating, setIsSimulating] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    setHospital(decision.hospital);
    setRoom(decision.room);
  }, [decision.hospital, decision.room]);

  const dirty =
    hospital !== result.decision.hospital ||
    room !== result.decision.room;

  const failedCount = result.constraints.filter(
    (constraint) => constraint.status === "Failed",
  ).length;

  const affectedSet = useMemo(
    () => new Set(result.affectedStages),
    [result.affectedStages],
  );

  const persistSimulation = async (
    nextDecision: {
      hospital: HospitalId;
      room: RoomId;
    },
    source: string,
  ) => {
    if (!scenarioId) {
      throw new Error(
        "No scenario is selected. Please run a scenario first.",
      );
    }

    const nextResult = simulateDecision(nextDecision);

    await createSimulation({
      scenarioId,
      input: JSON.stringify({
        source,
        decision: nextDecision,
        scenarioContext,
      }),
      result: JSON.stringify(nextResult),
    });

    return nextResult;
  };

  const handleSimulate = async () => {
    if (isSimulating || !dirty) {
      return;
    }

    if (!scenarioId) {
      toast.error("No active scenario", {
        description:
          "Please go to Scenario and run a scenario first.",
      });

      return;
    }

    setIsSimulating(true);

    const nextDecision = {
      hospital,
      room,
    };

    try {
      setDecision(nextDecision);

      const savedResult = await persistSimulation(
        nextDecision,
        "counterfactual",
      );

      toast.success("Simulation saved", {
        description: `Simulation saved for Scenario #${scenarioId}. ${savedResult.affectedStages.length} stage(s) affected.`,
      });
    } catch (error) {
      console.error(
        "Failed to save simulation:",
        error,
      );

      toast.error("Simulation could not be saved", {
        description:
          "The local simulation was updated, but the backend could not save it.",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRepair = async (
    repairDecision: {
      hospital: HospitalId;
      room: RoomId;
    },
    label: string,
  ) => {
    if (isRepairing) {
      return;
    }

    if (!scenarioId) {
      toast.error("No active scenario", {
        description:
          "Please run a scenario before applying a repair.",
      });

      return;
    }

    setIsRepairing(true);

    try {
      applyRepair(repairDecision);

      setHospital(repairDecision.hospital);
      setRoom(repairDecision.room);

      await persistSimulation(
        repairDecision,
        "repair",
      );

      toast.success("Repair applied and saved", {
        description: `${label} is now the active decision for Scenario #${scenarioId}.`,
      });
    } catch (error) {
      console.error(
        "Failed to save repair simulation:",
        error,
      );

      toast.error("Repair could not be saved", {
        description:
          "The decision was applied locally, but the backend save failed.",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleResetBaseline = () => {
    const baseline = {
      hospital: "A" as HospitalId,
      room: "private" as RoomId,
    };

    setHospital(baseline.hospital);
    setRoom(baseline.room);
    setDecision(baseline);

    toast.info("Returned to baseline");
  };

  return (
    <AppShell title="Simulator">
      <PageHeader
        eyebrow="Decision lab / Counterfactual simulation"
        title="What happens if you change your decision?"
        subtitle="Simulate. Understand. Recover."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={handleResetBaseline}
              disabled={isSimulating || isRepairing}
            >
              Reset baseline
            </Button>

            <Button
              variant="primary"
              icon={Sparkles}
              onClick={() =>
                toast.info(
                  "The local explanation layer is ready in the top bar.",
                )
              }
            >
              Explain result
            </Button>
          </>
        }
      />

      {/* =========================
          SCENARIO STATUS
      ========================= */}

      <div className="status-strip">
        <div className="status-strip__item">
          <span>Scenario</span>
          <strong>
            {scenarioContext.policy}
          </strong>
        </div>

        <div className="status-strip__item">
          <span>Status</span>

          <StatusPill
            status={
              result.feasible
                ? "feasible"
                : "infeasible"
            }
          />
        </div>

        <div className="status-strip__item">
          <span>Location</span>
          <strong>
            {scenarioContext.location}
          </strong>
        </div>

        <div className="status-strip__item">
          <span>Care stage</span>
          <strong>
            {scenarioContext.careStage}
          </strong>
        </div>

        <div className="status-strip__item">
          <span>Coverage</span>
          <strong>
            {scenarioContext.coverage}
          </strong>
        </div>

        <div className="status-strip__note">
          <Info size={15} />
          Baseline stays fixed while you explore.
        </div>
      </div>

      <div className="simulator-layout">
        <div className="simulator-main">
          <CurrentPathwayCard />

          {/* =========================
              COUNTERFACTUAL INPUT
          ========================= */}

          <Panel
            className="decision-panel"
            accent
          >
            <div className="panel-heading">
              <div>
                <SectionLabel>
                  Counterfactual input
                </SectionLabel>

                <h2>Change your decision</h2>

                <p>
                  Test one variable at a time,
                  then see the cascade.
                </p>
              </div>

              <span className="decision-panel__step">
                01 / 03
              </span>
            </div>

            <div className="decision-controls">
              <SelectField
                label="Change hospital"
                value={hospital}
                onChange={(value) =>
                  setHospital(
                    value as HospitalId,
                  )
                }
                options={hospitals.map(
                  (item) => ({
                    value: item.id,
                    label: item.name,
                  }),
                )}
              />

              <SelectField
                label="Change room"
                value={room}
                onChange={(value) =>
                  setRoom(value as RoomId)
                }
                options={roomOptions.map(
                  (item) => ({
                    value: item.id,
                    label: item.label,
                  }),
                )}
              />

              <Button
                variant="primary"
                icon={WandSparkles}
                onClick={handleSimulate}
                className="decision-submit"
                disabled={
                  !dirty ||
                  isSimulating ||
                  isRepairing
                }
              >
                {isSimulating
                  ? "Saving..."
                  : "Simulate impact"}
              </Button>
            </div>

            <div className="decision-panel__footer">
              <span>
                {dirty
                  ? "Unsaved decision ready to simulate"
                  : "Showing latest simulated decision"}
              </span>

              <span className="decision-panel__hint">
                Baseline: Hospital A · Private Room
              </span>
            </div>
          </Panel>

          {/* =========================
              SIMULATION RESULT
          ========================= */}

          <Panel className="simulation-panel">
            <div className="panel-heading">
              <div>
                <SectionLabel
                  trailing={
                    <StatusPill
                      status={
                        result.feasible
                          ? "feasible"
                          : "infeasible"
                      }
                    />
                  }
                >
                  Simulation result
                </SectionLabel>

                <h2>
                  {
                    hospitalById(
                      result.decision.hospital,
                    ).name
                  }

                  <span className="muted-separator">
                    +
                  </span>

                  {
                    roomById(
                      result.decision.room,
                    ).label
                  }
                </h2>

                <p>
                  {result.feasible
                    ? "The pathway remains feasible across all care stages."
                    : "The decision creates downstream constraints that need attention."}
                </p>
              </div>

              <div className="result-summary">
                <strong>
                  {result.affectedStages.length} / 4
                </strong>

                <span>affected</span>
              </div>
            </div>

            <div className="simulation-trace">
              <div className="simulation-trace__label">
                <span className="trace-arrow trace-arrow--violet" />
                Original decision
              </div>

              <div className="simulation-trace__decision">
                <span>Hospital A</span>

                <ArrowDown size={14} />

                <span className="trace-change">
                  {
                    hospitalById(
                      result.decision.hospital,
                    ).name
                  }
                </span>

                <ArrowDown size={14} />

                <span className="trace-failure">
                  {failedCount > 0
                    ? `${failedCount} constraint${
                        failedCount > 1
                          ? "s"
                          : ""
                      } failed`
                    : "No constraints failed"}
                </span>
              </div>

              <div className="cascade-grid">
                {stages.map(
                  (stage, index) => (
                    <div
                      key={stage}
                      className={`cascade-item ${
                        affectedSet.has(stage)
                          ? "cascade-item--affected"
                          : "cascade-item--stable"
                      }`}
                    >
                      <span className="cascade-item__index">
                        {String(
                          index + 1,
                        ).padStart(2, "0")}
                      </span>

                      <div>
                        <strong>
                          {stage}
                        </strong>

                        <span>
                          {affectedSet.has(
                            stage,
                          )
                            ? "Affected"
                            : "Unaffected"}
                        </span>
                      </div>

                      {index <
                        stages.length -
                          1 && (
                        <ChevronRight
                          className="cascade-item__arrow"
                          size={15}
                        />
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="simulation-panel__footer">
              <span>
                Impact logic is deterministic
                demo data, persisted through the
                backend API.
              </span>

              <span className="simulation-panel__legend">
                <i className="legend-dot legend-dot--cyan" />
                stable

                <i className="legend-dot legend-dot--amber" />
                affected
              </span>
            </div>
          </Panel>

          <RepairPanel
            repairs={repairs}
            onApply={handleRepair}
            disabled={
              isSimulating ||
              isRepairing
            }
          />

          <ComparisonPanel />

          <InsightPanel result={result} />
        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <aside className="simulator-side">
          <Panel className="impact-panel">
            <div className="panel-heading">
              <div>
                <SectionLabel>
                  Impact summary
                </SectionLabel>

                <h2>Decision pressure</h2>

                <p>
                  A compact read on pathway
                  stability.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  toast.info(
                    "Impact is the number of care stages changed by the decision.",
                  )
                }
                aria-label="Explain impact"
              >
                <Info size={16} />
              </button>
            </div>

            <ImpactDial
              affected={
                result.affectedStages.length
              }
              severity={result.severity}
            />

            <div className="impact-panel__severity">
              <span>Severity</span>

              <StatusPill
                status={
                  result.severity.toLowerCase() as
                    | "low"
                    | "medium"
                    | "high"
                }
                label={result.severity}
              />
            </div>

            <div className="impact-panel__divider" />

            <SectionLabel>
              Triggered constraints
            </SectionLabel>

            <ConstraintList
              constraints={
                result.constraints
              }
            />
          </Panel>

          <Panel className="side-note">
            <div className="side-note__icon">
              <ShieldMark />
            </div>

            <div>
              <strong>
                Why this matters
              </strong>

              <p>
                Care choices are linked. A
                small change upstream can alter
                coverage, access, and recovery
                downstream.
              </p>
            </div>
          </Panel>

          <Panel className="route-visual">
            <div
              className="pathway-visual-placeholder"
              aria-label="Abstract branching pathway trace"
            />

            <div className="route-visual__copy">
              <span className="eyebrow">
                Trace view
              </span>

              <strong>
                Follow the decision, not just
                the outcome.
              </strong>
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}

/* =========================================================
   REPAIR PANEL
========================================================= */

function RepairPanel({
  repairs,
  onApply,
  disabled,
}: {
  repairs: ReturnType<
    typeof import("@/lib/carepath").buildRepairs
  >;

  onApply: (
    decision: {
      hospital: HospitalId;
      room: RoomId;
    },
    label: string,
  ) => void;

  disabled?: boolean;
}) {
  return (
    <Panel className="repair-panel">
      <div className="panel-heading">
        <div>
          <SectionLabel
            trailing={
              <span className="count-badge">
                {repairs.length}
              </span>
            }
          >
            Minimum repair options
          </SectionLabel>

          <h2>
            Recover with the smallest
            change.
          </h2>

          <p>
            Smallest changes to make it
            feasible again.
          </p>
        </div>
      </div>

      <div className="repair-list">
        {repairs.map(
          (repair, index) => (
            <div
              className="repair-row"
              key={repair.id}
            >
              <span className="repair-index">
                0{index + 1}
              </span>

              <div className="repair-copy">
                <strong>
                  {repair.label}
                </strong>

                <span>
                  {repair.helper}
                </span>
              </div>

              <span className="change-count">
                {repair.changeCount} change
                {repair.changeCount > 1
                  ? "s"
                  : ""}
              </span>

              <Button
                variant="secondary"
                icon={ArrowRight}
                onClick={() =>
                  onApply(
                    repair.decision,
                    repair.label,
                  )
                }
                disabled={disabled}
              >
                Apply
              </Button>
            </div>
          ),
        )}
      </div>
    </Panel>
  );
}

/* =========================================================
   COMPARISON PANEL
========================================================= */

function ComparisonPanel() {
  return (
    <Panel className="comparison-panel">
      <div className="panel-heading">
        <div>
          <SectionLabel
            trailing={
              <span className="table-caption">
                4 feasible options
              </span>
            }
          >
            Pathway comparison
          </SectionLabel>

          <h2>
            Trade-offs at a glance.
          </h2>

          <p>
            Use the table for precision, then
            the field for pattern recognition.
          </p>
        </div>

        <Button
          variant="ghost"
          icon={GitCompareArrows}
          onClick={() =>
            toast.info(
              "Use Compare in the sidebar to pin 2–3 pathways.",
            )
          }
        >
          Open compare
        </Button>
      </div>

      <div className="comparison-content">
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Pathway</th>
                <th>Coverage fit</th>
                <th>Est. cost</th>
                <th>Impact</th>
                <th>Convenience</th>
              </tr>
            </thead>

            <tbody>
              {hospitals.map(
                (hospital) => (
                  <tr key={hospital.id}>
                    <td>
                      <div className="table-path">
                        <span
                          className={`table-path__dot table-path__dot--${hospital.id.toLowerCase()}`}
                        />

                        <strong>
                          {hospital.name}
                        </strong>

                        <span>
                          {hospital.network}
                        </span>
                      </div>
                    </td>

                    <td>
                      <StatusPill
                        status={
                          hospital.coverage ===
                          "Limited"
                            ? "affected"
                            : "feasible"
                        }
                        label={
                          hospital.coverage
                        }
                      />
                    </td>

                    <td className="table-number">
                      {formatINR(
                        hospital.cost,
                      )}
                    </td>

                    <td>
                      <span
                        className={`table-tone table-tone--${hospital.impact.toLowerCase()}`}
                      >
                        {hospital.impact}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`table-tone table-tone--${hospital.convenience.toLowerCase()}`}
                      >
                        {hospital.convenience}
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <TradeoffChart />
      </div>
    </Panel>
  );
}

/* =========================================================
   TRADEOFF CHART
========================================================= */

function TradeoffChart() {
  const points = [
    {
      id: "A",
      x: 26,
      y: 70,
      tone: "cyan",
    },
    {
      id: "B",
      x: 70,
      y: 55,
      tone: "red",
    },
    {
      id: "C",
      x: 48,
      y: 78,
      tone: "violet",
    },
    {
      id: "D",
      x: 18,
      y: 46,
      tone: "amber",
    },
  ];

  return (
    <div className="tradeoff-chart">
      <div className="tradeoff-chart__head">
        <span>Trade-off view</span>

        <span className="chart-legend">
          <i className="legend-dot legend-dot--cyan" />
          better fit
        </span>
      </div>

      <div className="tradeoff-chart__plot">
        <div className="chart-axis chart-axis--y">
          <span>High</span>
          <span>Coverage fit</span>
          <span>Low</span>
        </div>

        <div className="plot-area">
          <div className="plot-grid plot-grid--one" />
          <div className="plot-grid plot-grid--two" />
          <div className="plot-grid plot-grid--three" />

          {points.map(
            (point) => (
              <div
                key={point.id}
                className={`plot-point plot-point--${point.tone}`}
                style={{
                  left: `${point.x}%`,
                  bottom: `${point.y}%`,
                }}
              >
                <span>
                  {point.id}
                </span>
              </div>
            ),
          )}

          <span className="plot-label plot-label--x">
            Pathway impact →
          </span>
        </div>
      </div>

      <div className="chart-foot">
        <span>Lower impact</span>
        <span>Higher impact</span>
      </div>
    </div>
  );
}

/* =========================================================
   INSIGHT PANEL
========================================================= */

function InsightPanel({
  result,
}: {
  result: ReturnType<
    typeof import("@/lib/carepath").simulateDecision
  >;
}) {
  return (
    <Panel className="insight-panel">
      <div className="insight-panel__visual">
        <div className="insight-panel__orb">
          <Sparkles size={22} />
        </div>

        <span className="eyebrow">
          Decision insight
        </span>

        <strong>
          See the “why” behind the result.
        </strong>
      </div>

      <div className="insight-panel__copy">
        <p>
          “{result.explanation}”
        </p>

        <span>
          {result.feasible
            ? "No intervention needed. Compare options when you are ready."
            : `Closest feasible path: ${result.nearestFeasible}`}
        </span>
      </div>

      <div className="insight-panel__action">
        <Button
          variant="primary"
          icon={Sparkles}
          onClick={() =>
            toast.info(
              "Open AI explanation from the top bar to read this in simple terms.",
            )
          }
        >
          Explain this in simple terms
        </Button>
      </div>
    </Panel>
  );
}

/* =========================================================
   SHIELD MARK
========================================================= */

function ShieldMark() {
  return (
    <div className="shield-mark">
      <Check size={15} />
    </div>
  );
}