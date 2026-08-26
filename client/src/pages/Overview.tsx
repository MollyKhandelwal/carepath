/*
 * CAREPATH Clinical Instrument direction: overview is a calm system readout,
 * not a marketing dashboard; metrics point toward decisions and recovery.
 */

import {
  ArrowRight,
  CheckCircle2,
  GitCompareArrows,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";

import { Link } from "wouter";

import {
  AppShell,
  Button,
  MetricCard,
  PageHeader,
  Panel,
  SectionLabel,
} from "@/components/CarePathShell";

import { useCarePath } from "@/contexts/CarePathContext";

export default function Overview() {
  const { replay } = useCarePath();

  const simulations = 24 + replay.length;

  return (
    <AppShell title="Overview">
      <PageHeader
        eyebrow="Workspace / Overview"
        title="Decision intelligence, in one place."
        subtitle="A clear read on the simulations, pathways, and recovery options in your workspace."
        actions={
          <Link href="/simulator">
            <Button variant="primary" icon={ArrowRight}>
              Open simulator
            </Button>
          </Link>
        }
      />

      <div className="metric-grid">
        <MetricCard
          label="Total simulations"
          value={String(simulations)}
          change="+6 this week"
          tone="violet"
          icon={Sparkles}
        />

        <MetricCard
          label="Feasible pathways"
          value="18"
          change="75% of runs"
          tone="cyan"
          icon={CheckCircle2}
        />

        <MetricCard
          label="High impact decisions"
          value="04"
          change="Needs review"
          tone="amber"
          icon={Target}
        />

        <MetricCard
          label="Repairs applied"
          value="09"
          change="82% resolved"
          tone="neutral"
          icon={Layers3}
        />
      </div>

      <Panel className="how-panel">
        <div className="panel-heading">
          <div>
            <SectionLabel>How CarePath works</SectionLabel>

            <h2>Four moves from choice to clarity.</h2>
          </div>

          <div className="how-panel__tag">
            <span className="pulse-dot" />
            Ready for next simulation
          </div>
        </div>

        <div className="how-steps">
          <HowStep
            number="01"
            icon={Target}
            title="Choose"
            text="Start from the locked baseline and select one counterfactual."
          />

          <HowStep
            number="02"
            icon={Sparkles}
            title="Simulate"
            text="Run the pathway against network, room, and coverage rules."
          />

          <HowStep
            number="03"
            icon={GitCompareArrows}
            title="Understand"
            text="Follow the cascade and see what changes downstream."
          />

          <HowStep
            number="04"
            icon={CheckCircle2}
            title="Recover"
            text="Apply the smallest repair that returns the pathway to feasible."
          />
        </div>
      </Panel>
    </AppShell>
  );
}

function HowStep({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: string;
  icon: typeof Target;
  title: string;
  text: string;
}) {
  return (
    <div className="how-step">
      <div className="how-step__top">
        <span>{number}</span>
        <Icon size={17} />
      </div>

      <strong>{title}</strong>

      <p>{text}</p>
    </div>
  );
}