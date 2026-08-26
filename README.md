# CAREPATH

### Decision Support System for Counterfactual Care Decisions

CarePath is a decision support system designed to help users understand how a change in one care decision can affect downstream stages of a care pathway.

Instead of looking at a decision in isolation, CarePath establishes a baseline pathway and allows users to simulate alternative decisions and inspect the resulting constraints, affected stages, severity, and feasible alternatives.

---

## Core Workflow

CarePath follows a structured decision workflow:

1. **Scenario Configuration**
   - Select policy
   - Select location
   - Select care stage
   - Select coverage

2. **Baseline Pathway**
   - Establish the reference care pathway
   - Lock the baseline decision for comparison

3. **Counterfactual Simulation**
   - Change one decision variable
   - Simulate the downstream impact
   - Identify affected stages and constraints

4. **Decision Analysis**
   - Review feasibility
   - Inspect triggered constraints
   - Understand decision pressure
   - Identify a nearby feasible alternative

---

## Key Features

- Scenario-based decision configuration
- Baseline pathway locking
- Counterfactual decision simulation
- Constraint and eligibility analysis
- Affected-stage detection
- Decision pressure visualization
- Decision replay
- Pathway comparison
- Data and source reference section

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Framer Motion
- Recharts

### Backend
- Node.js
- Express
- TypeScript

### Data Layer
- PostgreSQL
- Drizzle ORM

### Tooling
- pnpm
- Vite
- esbuild
- TypeScript

---

## Project Structure

```text
carepath/
├── client/          # Frontend application
├── server/          # Backend and API routes
├── shared/          # Shared constants and types
├── patches/         # Dependency patches
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
