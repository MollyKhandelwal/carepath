/*
 * CAREPATH Clinical Instrument direction: pathway inventory reads like a
 * clinical reference board with fast filtering and explicit state labels.
 */

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "wouter";

import {
  AppShell,
  Button,
  PageHeader,
  Panel,
  SectionLabel,
  StatusPill,
} from "@/components/CarePathShell";

import { hospitals, formatINR } from "@/lib/carepath";

export default function Pathways() {
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState<"all" | "in" | "out">("all");

  const filtered = useMemo(
    () =>
      hospitals.filter((hospital) => {
        const matchesQuery = `${hospital.name} ${hospital.location}`
          .toLowerCase()
          .includes(query.toLowerCase());

        const matchesNetwork =
          network === "all" ||
          (network === "in"
            ? hospital.network === "In-network"
            : hospital.network === "Out-of-network");

        return matchesQuery && matchesNetwork;
      }),
    [network, query],
  );

  return (
    <AppShell title="Pathways">
      <PageHeader
        eyebrow="Reference / Pathways"
        title="Know the options before you compare."
        subtitle="A working inventory of demo facilities, network status, and pathway trade-offs."
        actions={
          <Link href="/simulator">
            <Button variant="primary" icon={ArrowRight}>
              Use in simulator
            </Button>
          </Link>
        }
      />

      <Panel className="pathways-panel">
        <div className="pathways-toolbar">
          <div>
            <SectionLabel
              trailing={
                <span className="table-caption">
                  {filtered.length} of 4 pathways
                </span>
              }
            >
              Pathway directory
            </SectionLabel>

            <h2>Facility options in Bangalore.</h2>
          </div>

          <div className="pathways-filters">
            <label className="search-field">
              <Search size={16} />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search hospitals"
                aria-label="Search hospitals"
              />
            </label>

            <div className="filter-pills">
              <button
                className={
                  network === "all"
                    ? "filter-pill filter-pill--active"
                    : "filter-pill"
                }
                onClick={() => setNetwork("all")}
              >
                <Filter size={14} />
                All
              </button>

              <button
                className={
                  network === "in"
                    ? "filter-pill filter-pill--active"
                    : "filter-pill"
                }
                onClick={() => setNetwork("in")}
              >
                <Check size={14} />
                In-network
              </button>

              <button
                className={
                  network === "out"
                    ? "filter-pill filter-pill--active"
                    : "filter-pill"
                }
                onClick={() => setNetwork("out")}
              >
                <SlidersHorizontal size={14} />
                Out-of-network
              </button>
            </div>
          </div>
        </div>

        <div className="directory-table-wrap">
          <table className="directory-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Location</th>
                <th>Network status</th>
                <th>Coverage fit</th>
                <th>Est. cost</th>
                <th>Pathway impact</th>
                <th>Convenience</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filtered.map((hospital) => (
                <tr key={hospital.id}>
                  <td>
                    <div className="directory-name">
                      <span
                        className={`facility-glyph facility-glyph--${hospital.id.toLowerCase()}`}
                      >
                        {hospital.id}
                      </span>

                      <div>
                        <strong>{hospital.name}</strong>
                        <span>{hospital.detail}</span>
                      </div>
                    </div>
                  </td>

                  <td>{hospital.location}</td>

                  <td>
                    <StatusPill
                      status={
                        hospital.network === "In-network"
                          ? "feasible"
                          : "infeasible"
                      }
                      label={hospital.network}
                    />
                  </td>

                  <td>
                    <StatusPill
                      status={
                        hospital.coverage === "Limited"
                          ? "affected"
                          : "feasible"
                      }
                      label={hospital.coverage}
                    />
                  </td>

                  <td className="table-number">
                    {formatINR(hospital.cost)}
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

                  <td>
                    <Link
                      href={`/simulator?hospital=${hospital.id}`}
                      className="row-arrow"
                      aria-label={`Explore ${hospital.name}`}
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Search size={18} />
              <strong>No pathways found</strong>
              <span>Try a different hospital or network filter.</span>
            </div>
          )}
        </div>
      </Panel>

      <div className="pathways-bottom-grid">
        <Panel className="pathway-footnote">
          <div className="footnote-number">04</div>

          <div>
            <span className="eyebrow">Pathway note</span>

            <strong>Network status is not the whole story.</strong>

            <p>
              CarePath keeps cost, coverage, convenience, and downstream
              impact visible together so a low estimate never hides a
              high-risk trade-off.
            </p>
          </div>
        </Panel>

        <Panel className="pathway-visual">
          <div
            className="pathway-visual-placeholder"
            aria-label="Abstract care pathway trace"
          />

          <div>
            <span className="eyebrow">System map</span>
            <strong>Every facility becomes a pathway.</strong>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}