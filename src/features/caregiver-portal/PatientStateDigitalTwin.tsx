"use client";

import * as React from "react";
import { useCaregiver, DigitalTwinSignalComparison } from "./caregiver-store";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  HelpCircle,
  Stethoscope,
  Clock,
  Sparkles,
  PhoneCall,
  Info,
} from "lucide-react";
import clsx from "clsx";
import styles from "./PatientStateDigitalTwin.module.css";

export function PatientStateDigitalTwin() {
  const { activePatient, activePatientCare } = useCaregiver();
  const [liveTrendData, setLiveTrendData] = React.useState<any | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function loadTrends() {
      try {
        const query = activePatient?.email
          ? `email=${encodeURIComponent(activePatient.email)}`
          : `patientId=${activePatient?.id || "patient-001"}`;
        const res = await fetch(`/api/caregiver/trends?${query}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setLiveTrendData(data);
        }
      } catch (err) {
        console.warn("Could not load live caregiver trends:", err);
      }
    }
    loadTrends();
    return () => {
      isMounted = false;
    };
  }, [activePatient?.id, activePatient?.email]);

  const digitalTwin = React.useMemo(() => {
    if (!liveTrendData) return activePatientCare.digitalTwin;
    return {
      ...activePatientCare.digitalTwin,
      state: liveTrendData.state || activePatientCare.digitalTwin.state,
      label: liveTrendData.label || activePatientCare.digitalTwin.label,
      plainExplanation: liveTrendData.plainExplanation || activePatientCare.digitalTwin.plainExplanation,
      lastCalculated: liveTrendData.lastCalculated || activePatientCare.digitalTwin.lastCalculated,
      contributingFactors: liveTrendData.contributingFactors || activePatientCare.digitalTwin.contributingFactors,
      trendSignals: liveTrendData.trendSignals || activePatientCare.digitalTwin.trendSignals,
    };
  }, [liveTrendData, activePatientCare.digitalTwin]);

  const { escalationProtocol } = activePatientCare;

  const getStatusLabel = (status: DigitalTwinSignalComparison["status"]) => {
    switch (status) {
      case "significant_change":
        return "Needs Watch";
      case "mild_change":
        return "Mild Shift";
      default:
        return "Stable Baseline";
    }
  };

  return (
    <div className={styles.container} role="region" aria-label="Patient State and Digital Twin baseline comparison">
      {/* 1. Hero Summary Card */}
      <div className={clsx(styles.overviewHero, styles[`hero_${digitalTwin.state}`])}>
        <div className={styles.statePillRow}>
          <div className={clsx(styles.stateStatusBadge, styles[`badge_${digitalTwin.state}`])}>
            {digitalTwin.state === "significant_deviation" ? (
              <AlertTriangle size={18} />
            ) : digitalTwin.state === "mild_deviation" ? (
              <Info size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>Current State: {digitalTwin.label}</span>
          </div>

          <span className={styles.lastCalculated}>
            <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
            Updated {digitalTwin.lastCalculated}
          </span>
        </div>

        <p className={styles.explanationText}>{digitalTwin.plainExplanation}</p>

        <div className={styles.baselineBox}>
          <strong>Baseline Reference:</strong> {digitalTwin.baselineSummary}
        </div>
      </div>

      {/* 2. Contributing Factors Highlight */}
      <div className={styles.factorsSection}>
        <h3 className={styles.sectionTitle}>
          <AlertTriangle size={18} style={{ color: "var(--color-warning)" }} />
          Key Contributing Observations
        </h3>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px 0" }}>
          Recent caregiver logs and events influencing {activePatient.name}&apos;s current health deviation:
        </p>

        <div className={styles.factorGrid}>
          {digitalTwin.contributingFactors.map((factor: string, idx: number) => (
            <div key={idx} className={styles.factorCard}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#b58a43",
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <span className={styles.factorText}>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Trend: Normal Baseline vs Recent Observations */}
      <div className={styles.trendSection}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
            <TrendingUp size={18} style={{ color: "var(--color-secondary)" }} />
            Baseline vs Recent Signals
          </h3>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            Tracking 7 core elderly functional indicators
          </span>
        </div>

        <div className={styles.signalsGrid}>
          {digitalTwin.trendSignals.map((signal: any, idx: number) => (
            <div key={idx} className={styles.signalCard}>
              <div className={styles.signalCardHeader}>
                <span className={styles.signalName}>{signal.name}</span>
                <span className={clsx(styles.signalStatusTag, styles[`status_${signal.status}`])}>
                  {getStatusLabel(signal.status)}
                </span>
              </div>

              <div className={styles.signalRow}>
                <span className={styles.signalRowLabel}>Normal Baseline</span>
                <span className={styles.signalRowValue} style={{ color: "var(--color-text-secondary)" }}>
                  {signal.baseline}
                </span>
              </div>

              <div className={styles.signalRow} style={{ marginTop: 4 }}>
                <span className={styles.signalRowLabel}>Recent Observations</span>
                <span className={styles.signalRowValue} style={{ fontWeight: 600 }}>
                  {signal.current}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. What This Might Mean (Plain-Language Non-Diagnostic Guidance) */}
      <div className={styles.meaningCard}>
        <div className={styles.meaningHeader}>
          <Sparkles size={22} style={{ color: "var(--color-secondary)" }} />
          <div>
            <h3 className={styles.meaningTitle}>What This Might Mean</h3>
            <span style={{ fontSize: 13, color: "#1b4b4c" }}>
              Plain-language interpretation of recent patterns and guidance for caregiver safety
            </span>
          </div>
        </div>

        <div className={styles.meaningGrid}>
          <div className={styles.meaningItem}>
            <span className={styles.meaningLabel}>Observed Change Explanation</span>
            <p className={styles.meaningText}>{digitalTwin.whatThisMightMean.interpretation}</p>
          </div>

          <div className={styles.meaningItem}>
            <span className={styles.meaningLabel}>Clinical Context</span>
            <p className={styles.meaningText}>{digitalTwin.whatThisMightMean.clinicalContext}</p>
          </div>

          <div className={styles.meaningItem}>
            <span className={styles.meaningLabel}>What Caregivers Should Do Now</span>
            <p className={styles.meaningText}>{digitalTwin.whatThisMightMean.actionableAdvice}</p>
          </div>

          <div className={styles.meaningItem} style={{ borderLeft: "4px solid var(--color-warning)" }}>
            <span className={styles.meaningLabel} style={{ color: "#92400e" }}>
              When to Contact the Doctor
            </span>
            <p className={styles.meaningText} style={{ fontWeight: 600 }}>
              {digitalTwin.whatThisMightMean.whenToContactDoctor}
            </p>
            <div style={{ marginTop: 8 }}>
              <a
                href={`tel:${escalationProtocol.triagePhone}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#1a6b6d",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                <PhoneCall size={14} /> Call Dr. Sharma&apos;s Clinic Desk ({escalationProtocol.triagePhone})
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
