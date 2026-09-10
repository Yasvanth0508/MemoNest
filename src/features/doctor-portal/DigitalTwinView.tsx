"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Layers,
  LineChart as ChartIcon,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import clsx from "clsx";
import styles from "./DigitalTwinView.module.css";

export function DigitalTwinView() {
  const {
    digitalTwinState,
    selectedSnapshot,
    setSelectedSnapshot,
    digitalTwinTrends,
    baselineVsRecent,
    riskModelContext,
    selectedPatient,
  } = useDoctorStore();

  return (
    <div className={styles.container}>
      {/* Top Header Card with 3m/6m/12m Snapshot Switcher */}
      <section className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1 className={styles.heading}>
            <Brain size={22} color="#122544" />
            <span>Digital Twin / Patient State Engine</span>
          </h1>
          <p className={styles.subheading}>
            Longitudinal multi-signal trajectory, baseline deviations, and predictive dementia risk model for{" "}
            {selectedPatient.name}
          </p>
        </div>

        {/* Historical Snapshot Switcher: 3 Months / 6 Months / 12 Months */}
        <div className={styles.snapshotControls} role="group" aria-label="Historical Snapshot Timeframe">
          <button
            type="button"
            className={clsx(
              styles.snapshotBtn,
              selectedSnapshot === "3m" && styles.snapshotBtnActive
            )}
            onClick={() => setSelectedSnapshot("3m")}
          >
            3 Months
          </button>

          <button
            type="button"
            className={clsx(
              styles.snapshotBtn,
              selectedSnapshot === "6m" && styles.snapshotBtnActive
            )}
            onClick={() => setSelectedSnapshot("6m")}
          >
            6 Months
          </button>

          <button
            type="button"
            className={clsx(
              styles.snapshotBtn,
              selectedSnapshot === "12m" && styles.snapshotBtnActive
            )}
            onClick={() => setSelectedSnapshot("12m")}
          >
            12 Months
          </button>
        </div>
      </section>

      {/* Current State Banner */}
      <section className={styles.stateBanner} aria-label="Current Digital Twin State">
        <div className={styles.stateLeft}>
          <div className={styles.stateIconWrapper}>
            <AlertTriangle size={28} />
          </div>

          <div className={styles.stateTextGroup}>
            <h2 className={styles.stateBadgeTitle}>
              Current State: Significant Deviation
            </h2>
            <p className={styles.stateDescription}>
              Driven by acute mobility instability (2 falls within 24h), morning post-awakening dizziness,
              and cumulative sedative load from recently initiated Zolpidem 5mg.
            </p>
          </div>
        </div>

        <div className={styles.confidenceBox}>
          <span className={styles.confScore}>{riskModelContext.confidence}%</span>
          <span className={styles.confLabel}>Model Confidence</span>
        </div>
      </section>

      {/* Longitudinal Trends Interactive Chart */}
      <section className={styles.cardSection} aria-labelledby="trends-heading">
        <div className={styles.sectionHeader}>
          <h2 id="trends-heading" className={styles.sectionTitle}>
            <ChartIcon size={18} color="#122544" />
            <span>Longitudinal Trends ({selectedSnapshot.toUpperCase()} Snapshot)</span>
          </h2>

          <div className={styles.legendRow}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: "#122544" }} />
              <span>Cognitive Function</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: "#67B8BA" }} />
              <span>Functional Ability</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: "#4E8B72" }} />
              <span>Med Adherence</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: "#C5221F" }} />
              <span>Observed Deviations</span>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 320, marginTop: "8px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={digitalTwinTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F1" />
              <XAxis dataKey="month" stroke="#68717C" fontSize={12} tickLine={false} />
              <YAxis stroke="#68717C" fontSize={12} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #dde2e1",
                  boxShadow: "0 4px 12px rgba(18, 37, 68, 0.08)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="cognition"
                name="Cognitive Score"
                stroke="#122544"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="mobility"
                name="Functional Ability"
                stroke="#67B8BA"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="adherence"
                name="Adherence %"
                stroke="#4E8B72"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="deviations"
                name="Caregiver Deviations"
                stroke="#C5221F"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Baseline vs. Recent State Side-by-Side Comparison */}
      <section className={styles.cardSection} aria-labelledby="baseline-comparison-heading">
        <div className={styles.sectionHeader}>
          <h2 id="baseline-comparison-heading" className={styles.sectionTitle}>
            <Layers size={18} color="#122544" />
            <span>Baseline vs. Recent State Matrix</span>
          </h2>
          <span style={{ fontSize: "12px", color: "#68717C" }}>
            Side-by-side clinical observation delta
          </span>
        </div>

        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Signal Domain</th>
              <th>Historical Baseline</th>
              <th>Recent Observations</th>
              <th>Clinical Delta</th>
            </tr>
          </thead>
          <tbody>
            {baselineVsRecent.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 700, color: "#122544" }}>{row.metric}</td>
                <td style={{ color: "#4B5563" }}>{row.baseline}</td>
                <td
                  style={{
                    color: row.status === "alert" ? "#C5221F" : row.status === "warning" ? "#B06000" : "#122544",
                    fontWeight: 600,
                  }}
                >
                  {row.recent}
                </td>
                <td>
                  {row.status === "alert" ? (
                    <span className={styles.statusAlert}>⚠️ Significant Shift</span>
                  ) : row.status === "warning" ? (
                    <span className={styles.statusWarning}>⚡ Mild Deviation</span>
                  ) : (
                    <span style={{ color: "#4E8B72", fontWeight: 600 }}>✓ Within Baseline</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Risk Model Context: Dementia-Stage Aware */}
      <section className={styles.cardSection} aria-labelledby="risk-model-heading">
        <div className={styles.sectionHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 id="risk-model-heading" className={styles.sectionTitle}>
              <Sparkles size={18} color="#67B8BA" />
              <span>Dementia-Stage-Aware Predictive Risk Model</span>
            </h2>
          </div>

          <div className={styles.modelTagRow}>
            <span className={styles.modelBadgeGenerated}>🤖 Model-Generated Signal</span>
            <span className={styles.modelBadgeClinical}>✓ Confirmed Clinical Records</span>
          </div>
        </div>

        <div className={styles.riskModelContainer}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#68717C" }}>
                Current Staging
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#122544" }}>
                {riskModelContext.stage}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#68717C" }}>
                Risk Projection
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#C5221F" }}>
                {riskModelContext.riskLevel}
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#122544",
                marginBottom: "6px",
              }}
            >
              Contributing Multi-Source Signals:
            </div>
            <ul className={styles.signalsList}>
              {riskModelContext.contributingSignals.map((sig, sIdx) => (
                <li key={sIdx}>{sig}</li>
              ))}
            </ul>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#68717C",
              fontStyle: "italic",
              borderTop: "1px solid #eef2f1",
              paddingTop: "8px",
            }}
          >
            {riskModelContext.predictiveModelNote}
          </div>
        </div>
      </section>
    </div>
  );
}
