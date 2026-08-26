/*
 * CAREPATH Clinical Instrument direction: settings are quiet, explicit, and
 * operational, with no decorative controls that pretend to do work.
 */
import { useState } from "react";
import { Bell, Check, ChevronRight, Database, LockKeyhole, Moon, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Button, PageHeader, Panel, SectionLabel, StatusPill } from "@/components/CarePathShell";

export default function Settings() {
  const [alerts, setAlerts] = useState(true);
  const [compact, setCompact] = useState(false);
  const [motion, setMotion] = useState(true);
  const [saved, setSaved] = useState(true);
  const update = (setter: (value: boolean) => void) => (value: boolean) => { setter(value); setSaved(false); };
  const handleSave = () => { setSaved(true); toast.success("Preferences saved", { description: "Your CAREPATH workspace preferences are up to date." }); };
  return <AppShell title="Settings"><PageHeader eyebrow="Workspace / Settings" title="Tune the workbench to your practice." subtitle="Control the signal density, notification cues, and explanation preferences for this workspace." actions={<Button variant="primary" icon={Save} onClick={handleSave} disabled={saved}>Save preferences</Button>} />
    <div className="settings-layout"><div className="settings-main"><Panel className="settings-panel"><div className="panel-heading"><div><SectionLabel trailing={<StatusPill status={saved ? "feasible" : "affected"} label={saved ? "Saved" : "Unsaved"} />}>Workspace preferences</SectionLabel><h2>How CarePath behaves.</h2><p>These controls affect the local demo experience and are ready to map to user preferences later.</p></div></div><div className="settings-rows"><SettingRow icon={Bell} title="Simulation alerts" description="Show a small confirmation after every simulation or repair." checked={alerts} onChange={update(setAlerts)} /><SettingRow icon={SlidersHorizontal} title="Compact information density" description="Tighten table rows and metadata spacing for larger reviews." checked={compact} onChange={update(setCompact)} /><SettingRow icon={Moon} title="Motion cues" description="Keep short stage and dial transitions when a result changes." checked={motion} onChange={update(setMotion)} /></div></Panel><Panel className="settings-panel"><div className="panel-heading"><div><SectionLabel>Workspace access</SectionLabel><h2>Clinical strategy workspace.</h2><p>Manage who can view the current simulation context.</p></div></div><div className="access-row"><div className="access-avatars"><span>AR</span><span>NP</span><span>SK</span><button onClick={() => toast.info("Invite flow will be connected to workspace access.")}>+</button></div><div><strong>3 workspace members</strong><span>All members can view and replay simulations.</span></div><Button variant="secondary" icon={ChevronRight} onClick={() => toast.info("Member management is ready for backend wiring.")}>Manage access</Button></div></Panel></div><aside className="settings-side"><Panel className="settings-status"><SectionLabel>Environment status</SectionLabel><div className="environment-state"><span className="environment-state__icon"><Check size={16} /></span><div><strong>Demo environment ready</strong><span>All local simulation services are online.</span></div></div><div className="settings-meta"><div><span>Policy set</span><strong>Demo Policy A</strong></div><div><span>Data mode</span><strong>Local demo records</strong></div><div><span>Release</span><strong>0.9.4 · preview</strong></div></div></Panel><Panel className="settings-security"><div className="settings-security__icon"><LockKeyhole size={17} /></div><div><span className="eyebrow">Security note</span><strong>No API keys in the browser.</strong><p>Future AI explanations should flow through a backend API boundary, keeping secrets and policy logic protected.</p></div></Panel><Panel className="settings-links"><SectionLabel>System links</SectionLabel><SystemLink icon={Database} label="Data & Sources" onClick={() => toast.info("Use the Data & Sources section to review demo inputs.")} /><SystemLink icon={ShieldCheck} label="Policy controls" onClick={() => toast.info("Policy controls are part of the next workspace release.")} /></Panel></aside></div>
  </AppShell>;
}

function SettingRow({ icon: Icon, title, description, checked, onChange }: { icon: typeof Bell; title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="setting-row"><div className="setting-row__icon"><Icon size={16} /></div><div className="setting-row__copy"><strong>{title}</strong><span>{description}</span></div><button className={`toggle ${checked ? "toggle--on" : ""}`} aria-pressed={checked} onClick={() => onChange(!checked)}><span /></button></div>;
}

function SystemLink({ icon: Icon, label, onClick }: { icon: typeof Database; label: string; onClick: () => void }) {
  return <button className="system-link" onClick={onClick}><span><Icon size={15} />{label}</span><ChevronRight size={15} /></button>;
}
