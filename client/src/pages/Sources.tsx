/*
 * CAREPATH Clinical Instrument direction: source panels make assumptions
 * visible so simulation confidence is earned through provenance.
 */
import { useState } from "react";
import { ArrowUpRight, BookOpen, Check, Database, FileCheck2, Search, ShieldCheck } from "lucide-react";
import { AppShell, Button, PageHeader, Panel, SectionLabel } from "@/components/CarePathShell";

const sources = [
  { type: "Policy rule", title: "Demo Policy A · Network eligibility", detail: "Demo rule set · v1.4", updated: "Updated today", icon: ShieldCheck, tone: "cyan" },
  { type: "Coverage table", title: "Procedure & room benefit bands", detail: "Demo policy model · v1.1", updated: "Updated yesterday", icon: FileCheck2, tone: "violet" },
  { type: "Facility index", title: "Bangalore pathway directory", detail: "Demo facility registry · v0.8", updated: "Updated 2 days ago", icon: Database, tone: "amber" },
  { type: "Method note", title: "Counterfactual cascade logic", detail: "CarePath methodology · v0.3", updated: "Updated 2 days ago", icon: BookOpen, tone: "neutral" },
];

export default function Sources() {
  const [query, setQuery] = useState("");
  const filtered = sources.filter((source) => `${source.title} ${source.type}`.toLowerCase().includes(query.toLowerCase()));
  return <AppShell title="Data & Sources"><PageHeader eyebrow="Reference / Provenance" title="Make the assumptions visible." subtitle="CarePath keeps the demo data, rules, and methodology close to every simulation." actions={<Button variant="secondary" icon={BookOpen} onClick={() => window.open("#methodology", "_self")}>Read methodology</Button>} />
    <div className="sources-hero"><div><span className="eyebrow">Data confidence</span><h2>Every result has a traceable starting point.</h2><p>These records are intentionally demo values. The production architecture is ready to replace them with connected policy, facility, and coverage feeds.</p></div><div className="sources-hero__score"><span>Source coverage</span><strong>100%</strong><span className="text-cyan"><Check size={14} /> Demo-set mapped</span></div></div>
    <Panel className="sources-panel"><div className="sources-toolbar"><div><SectionLabel trailing={<span className="table-caption">{filtered.length} records</span>}>Source registry</SectionLabel><h2>Inputs behind the simulator.</h2></div><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a source" aria-label="Find a source" /></label></div><div className="source-grid">{filtered.map((source) => <div className={`source-card source-card--${source.tone}`} key={source.title}><div className="source-card__top"><div className="source-card__icon"><source.icon size={17} /></div><span>{source.type}</span><ArrowUpRight size={15} /></div><strong>{source.title}</strong><p>{source.detail}</p><div className="source-card__footer"><span>{source.updated}</span><span className="source-card__status"><span className="pulse-dot" /> Active</span></div></div>)}</div></Panel><Panel className="method-panel" id="methodology"><div className="method-panel__title"><span className="eyebrow">Methodology note</span><h2>From one decision to a visible cascade.</h2></div><div className="method-panel__body"><p>CarePath evaluates a selected hospital and room against five demo constraints. Any failed constraint can affect one or more downstream care stages, while the baseline remains locked as a comparison anchor.</p><div className="method-steps"><span><b>01</b> Evaluate</span><span><b>02</b> Trace</span><span><b>03</b> Explain</span><span><b>04</b> Repair</span></div></div></Panel>
  </AppShell>;
}
