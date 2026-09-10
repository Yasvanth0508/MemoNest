"use client";

import * as React from "react";
import { useCaregiver } from "./caregiver-store";
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  Phone,
  ArrowRight,
  X,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import styles from "./ObservationRoutingModal.module.css";

export function ObservationRoutingModal() {
  const { routingNotice, dismissRoutingNotice, activePatient } = useCaregiver();

  if (!routingNotice.isOpen || !routingNotice.observation) {
    return null;
  }

  const { observation, type } = routingNotice;
  const isUrgent = type === "urgent";

  return (
    <div className={styles.backdrop} onClick={dismissRoutingNotice} role="dialog" aria-modal="true" aria-labelledby="routing-title">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerRow}>
          <div
            className={clsx(
              styles.statusIconWrapper,
              isUrgent ? styles.iconUrgent : styles.iconRoutine
            )}
          >
            {isUrgent ? <AlertTriangle size={26} /> : <CheckCircle2 size={26} />}
          </div>
          <div>
            <h3 id="routing-title" className={styles.titleText}>
              {isUrgent ? "Urgent Observation Escalated" : "Observation Recorded"}
            </h3>
            <p className={styles.subtitleText}>
              {isUrgent
                ? "Priority dispatch initiated per clinic escalation protocol"
                : `Successfully added to ${activePatient.name}'s health memory`}
            </p>
          </div>
        </div>

        {/* Observation Summary Details */}
        <div className={styles.detailsBox}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Patient</span>
            <span className={styles.detailValue}>{activePatient.name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Category</span>
            <span className={styles.detailValue} style={{ textTransform: "capitalize" }}>
              {observation.category.replace("_", " ")}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Severity</span>
            <span
              className={styles.detailValue}
              style={{
                color: isUrgent ? "#dc2626" : "#1a6b6d",
                textTransform: "uppercase",
              }}
            >
              {observation.severity}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Summary</span>
            <span className={styles.detailValue} style={{ maxWidth: 320 }}>
              {observation.summary || observation.note}
            </span>
          </div>
        </div>

        {/* Escalation Logic Feedback */}
        {isUrgent ? (
          <div className={styles.urgentChecklist}>
            <div className={styles.urgentChecklistTitle}>
              <AlertTriangle size={16} />
              Immediate Caregiver Actions
            </div>
            <div className={styles.urgentChecklistItem}>
              • Alert queued for Priya Kumar (Daughter / Healthcare Proxy)
            </div>
            <div className={styles.urgentChecklistItem}>
              • Signal routed to Dr. Rajesh Sharma&apos;s priority triage desk
            </div>
            <div className={styles.urgentChecklistItem}>
              • <strong>Stay with patient:</strong> Do not leave patient unassisted until stable
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              fontSize: 13,
              color: "#166534",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShieldCheck size={18} />
            <span>
              Entry is now visible in the patient&apos;s chronological timeline and caregiver stream.
            </span>
          </div>
        )}

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.dismissButton}
            onClick={dismissRoutingNotice}
            autoFocus
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
