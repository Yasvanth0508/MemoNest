"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Filter,
  Pill,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import clsx from "clsx";
import styles from "./KeyChangesView.module.css";

export function KeyChangesView() {
  const { patientChanges, selectedPatient, openEvidenceDrawer } = useDoctorStore();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredChanges = patientChanges.filter((change) => {
    if (selectedCategory !== "all" && change.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      change.title.toLowerCase().includes(q) ||
      change.shortExplanation.toLowerCase().includes(q) ||
      change.sourceText.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1 className={styles.heading}>
            <AlertTriangle size={20} color="#B58A43" />
            <span>Key Clinical Changes since Previous Visit</span>
          </h1>
          <p className={styles.subheading}>
            Tracking clinically relevant shifts for {selectedPatient.name} (MRN: {selectedPatient.id})
          </p>
        </div>

        {/* Filter Pills */}
        <div className={styles.filterRow}>
          <button
            type="button"
            className={clsx(styles.filterPill, selectedCategory === "all" && styles.filterPillActive)}
            onClick={() => setSelectedCategory("all")}
          >
            All Changes ({patientChanges.length})
          </button>

          <button
            type="button"
            className={clsx(
              styles.filterPill,
              selectedCategory === "medication" && styles.filterPillActive
            )}
            onClick={() => setSelectedCategory("medication")}
          >
            Medication Changes
          </button>

          <button
            type="button"
            className={clsx(
              styles.filterPill,
              selectedCategory === "incident" && styles.filterPillActive
            )}
            onClick={() => setSelectedCategory("incident")}
          >
            Caregiver Incidents
          </button>

          <button
            type="button"
            className={clsx(styles.filterPill, selectedCategory === "lab" && styles.filterPillActive)}
            onClick={() => setSelectedCategory("lab")}
          >
            Abnormal Labs
          </button>

          <button
            type="button"
            className={clsx(
              styles.filterPill,
              selectedCategory === "state" && styles.filterPillActive
            )}
            onClick={() => setSelectedCategory("state")}
          >
            Digital Twin Deviations
          </button>
        </div>
      </section>

      {/* Changes Feed */}
      <div className={styles.changesGrid}>
        {filteredChanges.map((change) => {
          const isCritical = change.severity === "critical";
          const isHigh = change.severity === "high";
          const isMedium = change.severity === "medium";

          return (
            <article
              key={change.id}
              className={clsx(
                styles.changeCard,
                isCritical && styles.borderCritical,
                isHigh && styles.borderHigh,
                isMedium && styles.borderMedium,
                !isCritical && !isHigh && !isMedium && styles.borderLow
              )}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardTitleGroup}>
                  <div className={styles.cardDate}>
                    <Calendar size={13} />
                    <span>{change.date}</span>
                    {change.isNew && (
                      <span
                        style={{
                          background: "#FCE8E6",
                          color: "#C5221F",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 800,
                          marginLeft: "6px",
                        }}
                      >
                        NEW SINCE LAST VISIT
                      </span>
                    )}
                  </div>
                  <h2 className={styles.cardTitle}>{change.title}</h2>
                </div>

                <div className={styles.badgeStack}>
                  <span
                    className={clsx(
                      styles.severityBadge,
                      isCritical && styles.sevCritical,
                      isHigh && styles.sevHigh,
                      isMedium && styles.sevMedium,
                      !isCritical && !isHigh && !isMedium && styles.sevLow
                    )}
                  >
                    {change.severity}
                  </span>
                </div>
              </div>

              <p className={styles.explanation}>{change.shortExplanation}</p>

              <div className={styles.cardFooter}>
                <div className={styles.sourceLine}>
                  <span className={styles.sourceLabel}>Source:</span>
                  <span>{change.sourceText}</span>
                </div>

                <button
                  type="button"
                  className={styles.viewSourceBtn}
                  onClick={() => openEvidenceDrawer(change.evidenceId || "ev-rx-zolpidem-01")}
                  aria-label={`View clinical source for ${change.title}`}
                >
                  <FileText size={13} />
                  <span>[View Source]</span>
                </button>
              </div>
            </article>
          );
        })}

        {filteredChanges.length === 0 && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #dde2e1",
              color: "#68717c",
            }}
          >
            No changes found matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
