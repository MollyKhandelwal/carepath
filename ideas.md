# CAREPATH Design Direction

## Three Stylistic Approaches

### Theme Name: Clinical Instrument
Very dark healthcare-tech software with calibrated cyan signals, plum actions, and a precise data-instrument feel. It should feel trustworthy, composed, and built for consequential decisions.
**Probability:** 0.07

### Theme Name: Quiet Ward
A softer midnight interface inspired by premium hospital wayfinding: low-contrast navy surfaces, warm white typography, and restrained mint highlights. The emotional intent is calm confidence during complex choices.
**Probability:** 0.03

### Theme Name: Signal Atlas
A high-density decision map with luminous route lines, modular panels, and a slightly editorial research-lab tone. It would make the system feel exploratory and intelligent without becoming a generic AI dashboard.
**Probability:** 0.09

## Selected Approach: Clinical Instrument

### Design Movement
Contemporary neo-brutalist clinical software: strong planar surfaces, instrument-panel density, crisp signal colors, and controlled radii, softened by premium typography and subtle depth.

### Core Principles
1. **Decisions before decoration:** every visual element supports a comparison, state change, or explanation.
2. **Clinical contrast:** navy surfaces create a calm base while cyan, plum, amber, and red are reserved for decision states.
3. **Visible causality:** route lines, stage markers, and cascade transitions make downstream effects easy to follow.
4. **Measured density:** information-rich layouts use clear grouping, deliberate whitespace, and typographic hierarchy rather than excessive ornament.

### Color Philosophy
Midnight navy is the cognitive workspace: quiet, focused, and legible over long sessions. Signal cyan means feasible and stable. Iris plum marks user agency and primary actions. Amber signals affected or consequential states. Coral-red is reserved for failed constraints so the user can separate risk from routine information. A cool off-white gives the interface the feel of medical instrumentation rather than a consumer app.

### Layout Paradigm
Use a persistent left navigation rail and a wide asymmetric workbench. The simulator is organized as a left-to-right decision trace: context and baseline on the left, intervention in the center, and impact/recovery on the right. Supporting pages use stacked editorial bands and split-pane tables instead of centered marketing grids.

### Signature Elements
- A thin **decision trace rail** that threads through pathway stages and changes color with simulation state.
- **Instrument labels** in small uppercase mono text for scenario metadata, constraints, and system state.
- A compact **impact dial** with a segmented arc and a numeric readout, used as a recurring visual anchor.

### Interaction Philosophy
Interactions should feel like operating a reliable clinical instrument. Selection changes are explicit, simulation is initiated by a clear action, and every result explains what moved. Hover states reveal context; active states lock in hierarchy; repair actions make the smallest safe change feel immediate and reversible.

### Animation
Use 180–260ms ease-out transitions for buttons, nav, dropdowns, and cards. On simulation, let the cascade markers reveal from top to bottom with 50ms staggered opacity/translate transitions. The impact dial should animate its arc and number together, never with a distracting bounce. Modal entry starts at 0.96 scale and opacity 0, then settles quickly. Respect reduced motion by removing stage reveals and dial interpolation.

### Typography System
Use **Space Grotesk** for display and interface headings: geometric, technical, and distinctive without feeling futuristic. Use **DM Sans** for body copy and controls: readable at dense sizes and warm enough for healthcare content. Use **IBM Plex Mono** for instrument labels, values, statuses, and data annotations. Headings are compact with slightly negative tracking; labels are uppercase with generous tracking; body copy stays between 13–15px for dense surfaces.

### Brand Essence
CAREPATH is a counterfactual healthcare decision-support workbench for people who need to understand the downstream effects of a care choice before committing. **Precise, humane, decisive.**

### Brand Voice
Headlines are direct and consequential. CTAs are verbs that describe the action, never vague promises. Microcopy names the system state in plain language and gives the user a next move.

Example lines:
- “What happens if you change your decision?”
- “Find the smallest change that restores feasibility.”

### Wordmark & Logo
The mark is a compact split-path symbol: two offset vertical strokes join through a single angled bridge, suggesting a care pathway and a counterfactual branch. It should be drawn as a bold geometric symbol without text, with a small cyan route node at the junction. The wordmark uses Space Grotesk Semibold with custom-tightened “CARE” and “PATH” spacing.

### Signature Brand Color
**Carepath Iris — #8B7CFF**, a cool plum-violet that signals agency and intelligent intervention without the generic electric-purple gradient treatment.

### Implementation Reminder
Every component should answer: “Does this choice make the decision trace easier to understand, or does it merely add dashboard decoration?”

## Style Decisions
- Use Carepath Iris as a solid signal color, not a full-surface gradient.
- Keep cyan for feasible/stable states and reserve coral for failed constraints.
- Prefer asymmetrical workbench layouts over centered dashboard grids.
- Keep motion brief, purposeful, and removable under reduced-motion preferences.
