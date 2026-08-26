/*
 * CAREPATH Clinical Instrument direction: the shell is a persistent workbench.
 * Navigation, status, and explanation surfaces stay calm while decision state moves.
 */
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileSearch,
  GitCompareArrows,
  History,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  Settings2,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useCarePath } from "@/contexts/CarePathContext";
import { decisionLabel, formatINR, hospitalById, roomById, stages } from "@/lib/carepath";

export const navItems: { label: string; href: string; icon: LucideIcon; section?: string }[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard, section: "Workspace" },
  { label: "Scenario", href: "/scenario", icon: ClipboardList },
  { label: "Pathways", href: "/pathways", icon: Activity },
  { label: "Simulator", href: "/simulator", icon: BrainCircuit, section: "Decision lab" },
  { label: "Decision Replay", href: "/replay", icon: History },
  { label: "Compare", href: "/compare", icon: GitCompareArrows },
  { label: "Data & Sources", href: "/sources", icon: FileSearch, section: "Reference" },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

export function BrandLogo({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className={`brand-lockup brand-lockup--${size}`}>
      <img src="/manus-storage/carepath-mark_735903ed.png" alt="" className="brand-mark" />
      <div>
        <div className="brand-name">CARE<span>PATH</span></div>
        <div className="brand-subtitle">Decision support system</div>
      </div>
    </div>
  );
}

export function StatusPill({ status, label }: { status: "feasible" | "infeasible" | "affected" | "passed" | "failed" | "low" | "medium" | "high"; label?: string }) {
  const icon = status === "feasible" || status === "passed" ? <Check size={12} /> : status === "infeasible" || status === "failed" ? <X size={12} /> : <span className="status-dot" />;
  return <span className={`status-pill status-pill--${status}`}>{icon}{label ?? status[0].toUpperCase() + status.slice(1)}</span>;
}

export function SectionLabel({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return <div className="section-label"><span>{children}</span>{trailing}</div>;
}

export function Panel({ children, className = "", accent = false, id }: { children: ReactNode; className?: string; accent?: boolean; id?: string }) {
  return <section id={id} className={`panel ${accent ? "panel--accent" : ""} ${className}`}>{children}</section>;
}

export function MetricCard({ label, value, change, tone = "neutral", icon: Icon }: { label: string; value: string; change?: string; tone?: "neutral" | "cyan" | "violet" | "amber" | "red"; icon: LucideIcon }) {
  return <div className={`metric-card metric-card--${tone}`}>
    <div className="metric-card__top"><span className="metric-card__label">{label}</span><span className="metric-card__icon"><Icon size={16} /></span></div>
    <div className="metric-card__value">{value}</div>
    {change && <div className="metric-card__change">{change}</div>}
  </div>;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="page-header-wrap">
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
    <div className="page-trace" aria-label="CAREPATH decision trace">
      <div className="page-trace__route"><span className="page-trace__line page-trace__line--violet" /><span className="page-trace__node page-trace__node--violet">01</span><span className="page-trace__line page-trace__line--cyan" /><span className="page-trace__node page-trace__node--cyan">02</span><span className="page-trace__line page-trace__line--amber" /><span className="page-trace__node page-trace__node--amber">03</span><span className="page-trace__line page-trace__line--coral" /><span className="page-trace__node page-trace__node--coral">04</span></div>
      <div className="page-trace__labels"><span>Baseline</span><span>Decision</span><span>Impact</span><span>Recovery</span></div>
    </div>
  </div>;
}

export function Button({ children, variant = "primary", icon: Icon, onClick, type = "button", className = "", disabled = false }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: LucideIcon; onClick?: () => void; type?: "button" | "submit"; className?: string; disabled?: boolean }) {
  return <button type={type} className={`cp-button cp-button--${variant} ${className}`} onClick={onClick} disabled={disabled}>{children}{Icon && <Icon size={15} />}</button>;
}

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <label className="field-wrap"><span className="field-label">{label}</span><span className="select-wrap"><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={15} /></span></label>;
}

export function PathwayTrace({ affectedStages = [], compact = false }: { affectedStages?: string[]; compact?: boolean }) {
  return <div className={`pathway-trace ${compact ? "pathway-trace--compact" : ""}`}>
    {stages.map((stage, index) => {
      const affected = affectedStages.includes(stage);
      return <div className="pathway-trace__item" key={stage}>
        <div className={`pathway-node ${affected ? "pathway-node--affected" : "pathway-node--stable"}`}><span>{String(index + 1).padStart(2, "0")}</span></div>
        <div className="pathway-trace__copy"><strong>{stage}</strong>{!compact && <small>{affected ? "Downstream impact" : "Unaffected"}</small>}</div>
        {index < stages.length - 1 && <div className={`pathway-line ${affected || affectedStages.includes(stages[index + 1]) ? "pathway-line--affected" : ""}`}><ArrowRight size={14} /></div>}
      </div>;
    })}
  </div>;
}

export function ImpactDial({ affected = 0, total = 4, severity = "Low" }: { affected: number; total?: number; severity: "Low" | "Medium" | "High" }) {
  const degree = Math.max(0, Math.min(180, (affected / total) * 180));
  return <div className={`impact-dial impact-dial--${severity.toLowerCase()}`}>
    <div className="impact-dial__arc" style={{ "--dial-degree": `${degree}deg` } as React.CSSProperties}>
      <div className="impact-dial__inner"><strong>{affected} / {total}</strong><span>Stages affected</span></div>
    </div>
    <div className="impact-dial__legend"><span>0</span><span>HIGH IMPACT</span><span>{total}</span></div>
  </div>;
}

export function ConstraintList({ constraints }: { constraints: { name: string; description: string; status: "Passed" | "Failed" }[] }) {
  return <div className="constraint-list">{constraints.map((constraint) => <div className="constraint-row" key={constraint.name}>
    <div className={`constraint-icon constraint-icon--${constraint.status.toLowerCase()}`}>{constraint.status === "Passed" ? <Check size={13} /> : <AlertCircle size={14} />}</div>
    <div className="constraint-copy"><strong>{constraint.name}</strong><span>{constraint.description}</span></div>
    <StatusPill status={constraint.status === "Passed" ? "passed" : "failed"} />
  </div>)}</div>;
}

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { result, decision, currentLabel } = useCarePath();
  const currentNav = navItems.find((item) => item.href === location)?.label ?? title;
  const hospital = hospitalById(decision.hospital);
  const room = roomById(decision.room);

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
      <div className="sidebar__top"><Link href="/simulator" onClick={() => setMobileOpen(false)}><BrandLogo /></Link><button className="sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><PanelLeftClose size={18} /></button></div>
      <div className="sidebar__scenario"><div className="sidebar__scenario-dot" /><div><span>Active scenario</span><strong>Demo Policy A</strong></div><ChevronDown size={14} /></div>
      <nav className="sidebar__nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          const active = location === item.href;
          return <div key={item.href}>
            {item.section && <div className="nav-section">{item.section}</div>}
            <Link href={item.href} className={`nav-item ${active ? "nav-item--active" : ""}`} onClick={() => setMobileOpen(false)}><item.icon size={17} /><span>{item.label}</span>{active && <span className="nav-item__active-mark" />}</Link>
          </div>;
        })}
      </nav>
      <div className="sidebar__footer"><div className="sidebar__support"><CircleHelp size={16} /><div><strong>Need a read?</strong><span>View system guide</span></div><ArrowRight size={14} /></div><div className="sidebar__user"><div className="avatar">AR</div><div><strong>Arjun Rao</strong><span>Clinical strategy</span></div><button onClick={() => toast.info("Profile controls are available in Settings.")} aria-label="Open profile menu"><ChevronDown size={14} /></button></div></div>
    </aside>
    {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <main className="main-shell">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><Link href="/simulator" className="topbar__brand"><BrandLogo size="sm" /></Link><div className="topbar__crumbs"><span>WORKSPACE</span><ArrowRight size={13} /><strong>{currentNav}</strong></div><div className="topbar__actions"><div className="topbar__context"><span className="pulse-dot" /> Simulation synced <span className="topbar__divider" /> <span>{hospital.name.replace("Hospital ", "")}/{room.label.replace(" Room", "")}</span></div><Button variant="secondary" icon={Sparkles} onClick={() => setModalOpen(true)}>AI explanation</Button><div className="topbar__profile">AR</div></div></header>
      <div className="main-content">{children}</div>
    </main>
    {modalOpen && <ExplanationModal title={title} currentLabel={currentLabel} result={result} onClose={() => setModalOpen(false)} />}
  </div>;
}

function ExplanationModal({ title, currentLabel, result, onClose }: { title: string; currentLabel: string; result: ReturnType<typeof import("@/lib/carepath").simulateDecision>; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="explanation-modal" role="dialog" aria-modal="true" aria-labelledby="explanation-title">
    <div className="explanation-modal__top"><div className="modal-kicker"><Sparkles size={14} /> Local explanation layer</div><button className="icon-button" onClick={onClose} aria-label="Close explanation"><X size={18} /></button></div>
    <h2 id="explanation-title">A plain-language read on this decision</h2><p className="explanation-modal__intro">Based on <strong>{currentLabel}</strong> in {title.toLowerCase()}.</p>
    <div className={`explanation-callout explanation-callout--${result.feasible ? "feasible" : "risk"}`}><div className="explanation-callout__icon">{result.feasible ? <Check size={18} /> : <AlertCircle size={18} />}</div><div><strong>{result.feasible ? "This pathway stays feasible." : `${result.affectedStages.length} of 4 stages need attention.`}</strong><p>{result.explanation}</p></div></div>
    <div className="modal-step"><span>01</span><div><strong>What changed</strong><p>{decisionLabel(result.decision)} was evaluated against the Demo Policy A baseline.</p></div></div>
    <div className="modal-step"><span>02</span><div><strong>What to do next</strong><p>{result.feasible ? "You can continue with this pathway or compare its cost and convenience." : result.nearestFeasible}</p></div></div>
    <div className="explanation-modal__footer"><span>Model-ready interface · no external API called</span><Button variant="primary" onClick={onClose}>Back to simulation</Button></div>
  </div></div>;
}

export function CurrentPathwayCard() {
  const { baseline, result } = useCarePath();
  const hospital = hospitalById(baseline.hospital);
  const room = roomById(baseline.room);
  return <Panel className="baseline-card"><div className="panel-heading"><div><SectionLabel trailing={<StatusPill status="feasible" />}>Current pathway</SectionLabel><h2>Baseline pathway</h2><p>Locked reference point for every counterfactual decision.</p></div><div className="baseline-card__badge"><ShieldCheck size={16} /><span>Baseline locked</span></div></div><div className="baseline-card__body"><div className="baseline-card__identity"><div className="facility-glyph"><span>H</span></div><div><strong>{hospital.name}</strong><span>{room.label}</span></div></div><PathwayTrace affectedStages={result.decision.hospital === baseline.hospital && result.decision.room === baseline.room ? [] : []} compact /><div className="baseline-card__metrics"><div><span>Est. cost</span><strong>{formatINR(hospital.cost + room.delta)}</strong></div><div><span>Coverage fit</span><strong className="text-cyan">High</strong></div></div></div></Panel>;
}
