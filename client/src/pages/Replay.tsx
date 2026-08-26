/*
 * CAREPATH Clinical Instrument direction: replay is an audit-friendly timeline
 * that makes prior decisions retrievable without losing the baseline.
 */

import { useEffect, useState } from "react";

import {
  ArrowRight,
  Check,
  Clock3,
  History,
  RotateCcw,
} from "lucide-react";

import { Link } from "wouter";
import { toast } from "sonner";

import {
  AppShell,
  Button,
  PageHeader,
  Panel,
  SectionLabel,
  StatusPill,
} from "@/components/CarePathShell";

import { useCarePath } from "@/contexts/CarePathContext";

import {
  decisionLabel,
  hospitalById,
  roomById,
  type Decision,
  type ReplayEntry,
  type SimulationResult,
} from "@/lib/carepath";

import { getSimulations } from "@/services/api";

export default function Replay() {
  const {
    replay,
    scenarioId,
    applyReplay,
  } = useCarePath();

  const [backendReplay, setBackendReplay] = useState<ReplayEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!scenarioId) {
      setBackendReplay([]);
      return;
    }

    let cancelled = false;

    const loadReplay = async () => {
      setIsLoading(true);

      try {
        const simulations = await getSimulations(scenarioId);

        const mapped: ReplayEntry[] = simulations
          .map((simulation) => {
            try {
              const input = JSON.parse(simulation.input);
              const result = JSON.parse(
                simulation.result,
              ) as SimulationResult;

              const decision = input.decision as Decision;

              if (
                !decision?.hospital ||
                !decision?.room ||
                !result
              ) {
                return null;
              }

              return {
                id: `simulation-${simulation.id}`,
                timestamp: formatTimestamp(
                  simulation.createdAt,
                ),
                from: {
                  hospital: "A",
                  room: "private",
                } as Decision,
                to: decision,
                result,
              };
            } catch (error) {
              console.error(
                "Failed to parse simulation:",
                simulation.id,
                error,
              );

              return null;
            }
          })
          .filter(
            (entry): entry is ReplayEntry =>
              entry !== null,
          )
          .reverse();

        if (!cancelled) {
          setBackendReplay(mapped);
        }
      } catch (error) {
        console.error(
          "Failed to load replay history:",
          error,
        );

        if (!cancelled) {
          setBackendReplay([]);
          toast.error("Replay history could not be loaded", {
            description:
              "Please make sure the CarePath backend is running on localhost:3000.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadReplay();

    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  /*
   * Prefer real backend history.
   * If backend history is unavailable/empty, keep the existing
   * local replay so the UI does not become blank.
   */
  const displayedReplay =
    backendReplay.length > 0
      ? backendReplay
      : replay;

  const handleReplay = (
    entry: ReplayEntry,
  ) => {
    applyReplay(entry);

    toast.success("Decision replayed", {
      description: `${decisionLabel(entry.to)} is active in the simulator.`,
    });
  };

  const feasibleRuns = displayedReplay.filter(
    (entry) => entry.result.feasible,
  ).length;

  const repairRuns = displayedReplay.filter(
    (entry) => !entry.result.feasible,
  ).length;

  const replayProgress = Math.min(
    100,
    displayedReplay.length * 15,
  );

  return (
    <AppShell title="Decision Replay">
      <PageHeader
        eyebrow="Decision lab / Replay"
        title="Revisit the decisions that shaped the path."
        subtitle="A lightweight audit trail for exploring what changed, what held, and what recovered."
        actions={
          <Link href="/simulator">
            <Button
              variant="primary"
              icon={ArrowRight}
            >
              Back to simulator
            </Button>
          </Link>
        }
      />

      <div className="replay-layout">
        <Panel className="replay-panel">
          <div className="panel-heading">
            <div>
              <SectionLabel
                trailing={
                  <span className="table-caption">
                    {isLoading
                      ? "Loading..."
                      : `${displayedReplay.length} saved runs`}
                  </span>
                }
              >
                Decision replay
              </SectionLabel>

              <h2>Recent counterfactuals.</h2>

              <p>
                Click any row to restore its exact state
                into the simulator.
              </p>
            </div>

            <History
              size={21}
              className="panel-heading__watermark"
            />
          </div>

          {displayedReplay.length > 0 ? (
            <div className="replay-list">
              {displayedReplay.map(
                (entry, index) => (
                  <div
                    className="replay-row"
                    key={entry.id}
                    onClick={() =>
                      handleReplay(entry)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        handleReplay(entry);
                      }
                    }}
                  >
                    <div className="replay-row__marker">
                      <span>
                        {String(index + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </div>

                    <div className="replay-row__body">
                      <div className="replay-row__top">
                        <strong>
                          {
                            hospitalById(
                              entry.from.hospital,
                            ).name
                          }

                          <ArrowRight size={14} />

                          {
                            hospitalById(
                              entry.to.hospital,
                            ).name
                          }
                        </strong>

                        <span>
                          <Clock3 size={13} />
                          {entry.timestamp}
                        </span>
                      </div>

                      <div className="replay-row__details">
                        <span>
                          {
                            roomById(
                              entry.to.room,
                            ).label
                          }
                        </span>

                        <span className="replay-dot" />

                        <span>
                          {
                            entry.result
                              .affectedStages
                              .length
                          }
                          /4 affected
                        </span>

                        <StatusPill
                          status={
                            entry.result.feasible
                              ? "feasible"
                              : "infeasible"
                          }
                          label={
                            entry.result.severity
                          }
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      icon={RotateCcw}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleReplay(entry);
                      }}
                    >
                      Replay
                    </Button>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="empty-state">
              <History size={20} />

              <strong>
                No saved decisions yet
              </strong>

              <span>
                Run a counterfactual in the simulator
                and it will appear here.
              </span>

              <Link href="/simulator">
                <Button
                  variant="secondary"
                  icon={ArrowRight}
                >
                  Open simulator
                </Button>
              </Link>
            </div>
          )}
        </Panel>

        <aside className="replay-aside">
          <Panel className="replay-summary">
            <SectionLabel>
              Replay ledger
            </SectionLabel>

            <div className="replay-summary__metric">
              <strong>
                {displayedReplay.length}
              </strong>

              <span>runs retained</span>
            </div>

            <div className="replay-summary__bar">
              <span
                style={{
                  width: `${replayProgress}%`,
                }}
              />
            </div>

            <div className="replay-summary__stats">
              <div>
                <span>Feasible</span>
                <strong>{feasibleRuns}</strong>
              </div>

              <div>
                <span>Needs repair</span>
                <strong>{repairRuns}</strong>
              </div>
            </div>
          </Panel>

          <Panel className="replay-tip">
            <div className="replay-tip__icon">
              <Check size={15} />
            </div>

            <div>
              <span className="eyebrow">
                Audit cue
              </span>

              <strong>
                Replay keeps the baseline separate.
              </strong>

              <p>
                Every run starts from Hospital A +
                Private Room, even after a repair is
                applied.
              </p>
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}

function formatTimestamp(
  createdAt: string,
): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Saved run";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}