"use client";

import * as React from "react";
import Link from "next/link";
import { useCaregiver } from "./caregiver-store";
import {
  Mic,
  AlertTriangle,
  HeartHandshake,
  Activity,
  ArrowRight,
  TrendingUp,
  Brain,
  Pill,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Phone,
  MessageSquarePlus,
} from "lucide-react";
import clsx from "clsx";
import styles from "./CaregiverDashboardOverview.module.css";

export function CaregiverDashboardOverview() {
  const {
    activePatient,
    activePatientCare,
    openObservationDrawer,
    openPatientStateModal,
    timelineEvents,
    followUpNotes,
    addFollowUpNote,
  } = useCaregiver();

  const { digitalTwin, watchList } = activePatientCare;

  // Recent observations for active patient
  const recentEvents = timelineEvents.slice(0, 5);

  const [openNoteEventId, setOpenNoteEventId] = React.useState<string | null>(null);
  const [noteDraft, setNoteDraft] = React.useState<string>("");

  const handleSaveNote = (eventId: string) => {
    if (!noteDraft.trim()) return;
    addFollowUpNote(eventId, noteDraft.trim());
    setNoteDraft("");
    setOpenNoteEventId(null);
  };

  return (
    <div className={styles.container} role="region" aria-label="Caregiver Dashboard Overview">
      {/* 1. Giant Primary Action Card: Log an Observation */}
      <div className={styles.heroActionCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}>
            <Mic size={14} />
            Voice-First Input
          </div>
          <h1 className={styles.heroTitle}>Log an Observation</h1>
          <p className={styles.heroSubtitle}>
            Tap to record a voice observation, incident note, or meal &amp; medication confirmation for <strong>{activePatient.name}</strong>.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.giantVoiceButton}
            onClick={() => openObservationDrawer()}
            aria-label="Tap to speak and log an observation"
          >
            <Mic size={24} />
            <span>Tap to Speak or Log Note</span>
          </button>

          <div className={styles.quickActionPills}>
            <button
              type="button"
              className={clsx(styles.quickPill, styles.quickPillFall)}
              onClick={() => openObservationDrawer("fall", "Fall")}
            >
              <AlertTriangle size={14} />
              <span>Report Fall</span>
            </button>

            <button
              type="button"
              className={styles.quickPill}
              onClick={() => openObservationDrawer("confusion", "Confusion Episode")}
            >
              <Brain size={14} />
              <span>Confusion</span>
            </button>

            <button
              type="button"
              className={styles.quickPill}
              onClick={() => openObservationDrawer("medication_adherence", "Missed Dose")}
            >
              <Pill size={14} />
              <span>Medication</span>
            </button>

            <button
              type="button"
              className={styles.quickPill}
              onClick={() => openObservationDrawer("mobility", "Transfer Instability")}
            >
              <Activity size={14} />
              <span>Mobility</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Middle Grid: Digital Twin Status & "What to Watch For" Preview */}
      <div className={styles.middleGrid}>
        {/* Digital Twin Snapshot */}
        <div className={styles.twinCard}>
          <div>
            <div className={styles.twinCardHeader}>
              <h2 className={styles.twinCardTitle}>
                <Sparkles size={18} style={{ color: "var(--color-secondary)" }} />
                Patient State / Digital Twin
              </h2>

              <span
                className={clsx(
                  styles.twinStatusIndicator,
                  digitalTwin.state === "significant_deviation"
                    ? "text-red-700 bg-red-100"
                    : digitalTwin.state === "mild_deviation"
                    ? "text-yellow-800 bg-yellow-100"
                    : "text-green-800 bg-green-100"
                )}
                style={{
                  background:
                    digitalTwin.state === "significant_deviation"
                      ? "#fee2e2"
                      : digitalTwin.state === "mild_deviation"
                      ? "#fef9c3"
                      : "#ecfdf5",
                  color:
                    digitalTwin.state === "significant_deviation"
                      ? "#991b1b"
                      : digitalTwin.state === "mild_deviation"
                      ? "#854d0e"
                      : "#065f46",
                }}
              >
                {digitalTwin.label}
              </span>
            </div>

            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "8px 0 14px 0", lineHeight: 1.5 }}>
              {digitalTwin.plainExplanation}
            </p>

            <div className={styles.factorsList}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>
                Contributing Observations ({digitalTwin.contributingFactors.length})
              </span>
              {digitalTwin.contributingFactors.slice(0, 3).map((factor, idx) => (
                <div key={idx} className={styles.factorItem}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#b58a43", marginTop: 6, flexShrink: 0 }} />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              type="button"
              className={styles.cardFooterBtn}
              onClick={openPatientStateModal}
            >
              <span>View Full Baseline Comparison &amp; Signals</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* What to Watch For Preview */}
        <div className={styles.watchPreviewCard}>
          <div>
            <div className={styles.twinCardHeader}>
              <h2 className={styles.twinCardTitle}>
                <AlertTriangle size={18} style={{ color: "#d9383a" }} />
                What to Watch For
              </h2>
              <Link href="/caregiver/patient" className={styles.cardFooterBtn} style={{ fontSize: 12 }}>
                <span>All Protocols</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "8px 0 14px 0" }}>
              Key physician risk indicators prescribed for {activePatient.name}:
            </p>

            <div className={styles.watchItemsPreviewList}>
              {watchList.slice(0, 3).map((item) => (
                <div key={item.id} className={styles.watchPreviewRow}>
                  <div className={styles.watchRowLeft}>
                    <div>
                      <div className={styles.watchRowTitle}>{item.title}</div>
                      <div className={styles.watchRowDesc}>{item.description}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.logThisSmallBtn}
                    onClick={() => openObservationDrawer(item.category, item.title)}
                  >
                    Log This
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Link href="/caregiver/patient" className={styles.cardFooterBtn}>
              <span>View Demographics, Allergies &amp; Escalation Plan</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Recent Health Timeline Feed */}
      <div className={styles.recentSection}>
        <div className={styles.recentSectionHeader}>
          <h2 className={styles.recentSectionTitle}>
            <Clock size={20} style={{ color: "var(--color-primary)" }} />
            Recent Care Feed &amp; Health Events
          </h2>
          <Link href="/caregiver/timeline" className={styles.cardFooterBtn}>
            <span>Open Combined Health Timeline</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recentEvents.map((ev) => {
            const eventNotes = followUpNotes[ev.id] || [];
            const isAdding = openNoteEventId === ev.id;

            return (
              <div
                key={ev.id}
                style={{
                  background: "#fbfbfc",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-primary)" }}>
                      {ev.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                      <span>{ev.date} {ev.time ? `· ${ev.time}` : ""}</span>
                      <span
                        style={{
                          background: "#e6f6f5",
                          color: "#1a6b6d",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontWeight: 700,
                        }}
                      >
                        {ev.sourceType}
                      </span>
                    </div>
                  </div>

                  {ev.severity && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background:
                          ev.severity === "critical"
                            ? "#fee2e2"
                            : ev.severity === "high"
                            ? "#fef3c7"
                            : "#f3f4f6",
                        color:
                          ev.severity === "critical"
                            ? "#991b1b"
                            : ev.severity === "high"
                            ? "#92400e"
                            : "#374151",
                      }}
                    >
                      Severity: {ev.severity}
                    </span>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: 14, color: "var(--color-primary)", lineHeight: 1.4 }}>
                  {ev.description}
                </p>

                {/* Follow-up notes */}
                {eventNotes.length > 0 && (
                  <div
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "8px 12px",
                      marginTop: 4,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#68717C" }}>
                      Follow-up Note ({eventNotes.length})
                    </span>
                    {eventNotes.map((note) => (
                      <div key={note.id} style={{ fontSize: 13, color: "var(--color-primary)" }}>
                        <strong>{note.author}:</strong> {note.note}
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline follow up note */}
                {isAdding ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                    <input
                      type="text"
                      placeholder="Add follow-up note..."
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--color-border)",
                        fontSize: 13,
                        fontFamily: "inherit",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenNoteEventId(null);
                          setNoteDraft("");
                        }}
                        style={{
                          background: "none",
                          border: "1px solid var(--color-border)",
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(ev.id)}
                        style={{
                          background: "var(--color-primary)",
                          color: "white",
                          border: "none",
                          borderRadius: 999,
                          padding: "4px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenNoteEventId(ev.id);
                        setNoteDraft("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-secondary)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: 0,
                      }}
                    >
                      <MessageSquarePlus size={13} />
                      <span>Add Follow-up Note</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
