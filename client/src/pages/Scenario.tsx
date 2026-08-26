import { useState } from "react";

import {
  ArrowRight,
  CalendarClock,
  Check,
  MapPin,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

import { toast } from "sonner";

import {
  AppShell,
  Button,
  PageHeader,
  Panel,
  SectionLabel,
  SelectField,
  StatusPill,
} from "@/components/CarePathShell";

import { useCarePath } from "@/contexts/CarePathContext";
import { createScenario } from "@/services/api";

export default function Scenario() {
  const {
    decision,
    setDecision,
    setScenarioContext,
  } = useCarePath();

  const [policy, setPolicy] = useState("demo-a");
  const [location, setLocation] = useState("bangalore");
  const [careStage, setCareStage] = useState("procedure");
  const [coverage, setCoverage] = useState("comprehensive");

  const [saved, setSaved] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const policyLabels: Record<string, string> = {
    "demo-a": "Demo Policy A",
    "demo-b": "Demo Policy B",
    employer: "Employer Cover · Demo",
  };

  const locationLabels: Record<string, string> = {
    bangalore: "Bangalore",
    mumbai: "Mumbai · demo",
    delhi: "Delhi · demo",
  };

  const careStageLabels: Record<string, string> = {
    admission: "Admission",
    investigation: "Investigation",
    procedure: "Procedure",
    recovery: "Recovery",
  };

  const coverageLabels: Record<string, string> = {
    comprehensive: "Comprehensive",
    standard: "Standard",
    limited: "Limited · demo",
  };

  const handleRun = async () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setSaved(false);

    try {
      const scenario = await createScenario({
        name: policyLabels[policy] ?? policy,
        location: locationLabels[location] ?? location,
        careStage: careStageLabels[careStage] ?? careStage,
        status: "feasible",
      });

      // Store the complete scenario context so every
      // downstream decision surface uses the same context.
      setScenarioContext({
        id: scenario.id,
        policy: policyLabels[policy] ?? policy,
        location: locationLabels[location] ?? location,
        careStage: careStageLabels[careStage] ?? careStage,
        coverage: coverageLabels[coverage] ?? coverage,
      });

      // Keep the current decision behaviour.
      setDecision(decision);

      setSaved(true);

      toast.success("Scenario run complete", {
        description: `Scenario #${scenario.id} is saved and ready for the decision lab.`,
      });
    } catch (error) {
      console.error("Failed to create scenario:", error);

      setSaved(false);

      toast.error("Scenario could not be saved", {
        description:
          "Please make sure the CarePath backend is running on localhost:3000.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AppShell title="Scenario">
      <PageHeader
        eyebrow="Workspace / Scenario"
        title="Set the context before you simulate."
        subtitle="A scenario keeps every counterfactual decision grounded in the same policy and care stage."
        actions={
          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run scenario"}
          </Button>
        }
      />

      <div className="scenario-layout">
        <Panel className="scenario-form-panel" accent>
          <div className="panel-heading">
            <div>
              <SectionLabel
                trailing={
                  <StatusPill
                    status={saved ? "feasible" : "affected"}
                    label={saved ? "Synced" : "Unsaved"}
                  />
                }
              >
                Scenario configuration
              </SectionLabel>

              <h2>{policyLabels[policy]}</h2>

              <p>
                Change the context, then run it into the decision lab.
              </p>
            </div>

            <div className="scenario-form-panel__number">
              01
            </div>
          </div>

          <div className="scenario-fields">
            <SelectField
              label="Policy"
              value={policy}
              onChange={(value) => {
                setPolicy(value);
                setSaved(false);
              }}
              options={[
                {
                  value: "demo-a",
                  label: "Demo Policy A",
                },
                {
                  value: "demo-b",
                  label: "Demo Policy B",
                },
                {
                  value: "employer",
                  label: "Employer Cover · Demo",
                },
              ]}
            />

            <SelectField
              label="Location"
              value={location}
              onChange={(value) => {
                setLocation(value);
                setSaved(false);
              }}
              options={[
                {
                  value: "bangalore",
                  label: "Bangalore",
                },
                {
                  value: "mumbai",
                  label: "Mumbai · demo",
                },
                {
                  value: "delhi",
                  label: "Delhi · demo",
                },
              ]}
            />

            <SelectField
              label="Care stage"
              value={careStage}
              onChange={(value) => {
                setCareStage(value);
                setSaved(false);
              }}
              options={[
                {
                  value: "admission",
                  label: "Admission",
                },
                {
                  value: "investigation",
                  label: "Investigation",
                },
                {
                  value: "procedure",
                  label: "Procedure",
                },
                {
                  value: "recovery",
                  label: "Recovery",
                },
              ]}
            />

            <SelectField
              label="Coverage"
              value={coverage}
              onChange={(value) => {
                setCoverage(value);
                setSaved(false);
              }}
              options={[
                {
                  value: "comprehensive",
                  label: "Comprehensive",
                },
                {
                  value: "standard",
                  label: "Standard",
                },
                {
                  value: "limited",
                  label: "Limited · demo",
                },
              ]}
            />
          </div>

          <div className="scenario-form-panel__footer">
            <div>
              <Check size={14} />

              {saved
                ? "Scenario is ready to run"
                : "Changes waiting to be run"}
            </div>

            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? "Running..." : "Run scenario"}
            </Button>
          </div>
        </Panel>

        <aside className="scenario-side">
          <Panel className="context-panel">
            <SectionLabel>
              Scenario context
            </SectionLabel>

            <div className="context-list">
              <ContextLine
                icon={Shield}
                label="Policy"
                value={policyLabels[policy]}
              />

              <ContextLine
                icon={MapPin}
                label="Location"
                value={locationLabels[location]}
              />

              <ContextLine
                icon={SlidersHorizontal}
                label="Coverage"
                value={coverageLabels[coverage]}
              />

              <ContextLine
                icon={CalendarClock}
                label="Care stage"
                value={careStageLabels[careStage]}
              />
            </div>
          </Panel>

          <Panel className="scenario-note">
            <span className="eyebrow">
              Design principle
            </span>

            <strong>
              One context. Many possible paths.
            </strong>

            <p>
              Keep policy assumptions stable so the impact of one decision
              stays visible.
            </p>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}

function ContextLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
}) {
  return (
    <div className="context-line">
      <div className="context-line__icon">
        <Icon size={15} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}