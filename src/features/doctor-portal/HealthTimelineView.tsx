"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  Clock,
  Search,
  Filter,
  FileText,
  Calendar,
  Building,
  User,
  Activity,
  AlertTriangle,
  Pill,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import styles from "./HealthTimelineView.module.css";

export function HealthTimelineView() {
  const {
    filteredTimeline,
    timelineSearchQuery,
    setTimelineSearchQuery,
    timelineFilterType,
    setTimelineFilterType,
    timelineFilterProvider,
    setTimelineFilterProvider,
    openEvidenceDrawer,
    selectedPatient,
  } = useDoctorStore();

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1 className={styles.heading}>
            <Clock size={22} color="#122544" />
            <span>Longitudinal Health Timeline</span>
          </h1>
          <p className={styles.subheading}>
            Unified multi-provider chronological record for {selectedPatient.name} within authorized consent scope
          </p>
        </div>

        <div style={{ fontSize: "12px", color: "#68717C" }}>
          Showing <strong>{filteredTimeline.length}</strong> longitudinal clinical events
        </div>
      </section>

      {/* Search & Filtering Controls Bar */}
      <section className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={16} color="#68717C" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search timeline by condition, drug, note, or author..."
            value={timelineSearchQuery}
            onChange={(e) => setTimelineSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={timelineFilterType}
            onChange={(e) => setTimelineFilterType(e.target.value)}
            aria-label="Filter by Data Type"
          >
            <option value="all">All Event Categories</option>
            <option value="medical">Medical & Clinical Notes</option>
            <option value="medication">Medications & Prescriptions</option>
            <option value="caregiver">Caregiver Observations & Falls</option>
            <option value="labs">Laboratory & Diagnostic Results</option>
            <option value="cognitive">Cognitive & MCI Assessments</option>
            <option value="functional">Functional & Mobility Evaluations</option>
          </select>

          <select
            className={styles.filterSelect}
            value={timelineFilterProvider}
            onChange={(e) => setTimelineFilterProvider(e.target.value)}
            aria-label="Filter by Provider"
          >
            <option value="all">All Providers & Authors</option>
            <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma, MD</option>
            <option value="Anita Desai">Anita Desai (Caregiver)</option>
            <option value="external">External Providers Only</option>
          </select>
        </div>
      </section>

      {/* Timeline Stream */}
      <div className={styles.timelineStream}>
        {filteredTimeline.map((ev) => {
          const isCritical = ev.severity === "critical";
          const isHigh = ev.severity === "high";
          const authorStr = ev.author || "";
          const isExternal =
            authorStr.includes("Quest") ||
            authorStr.includes("Neurovascular") ||
            authorStr.includes("Elena Rostova");

          return (
            <div key={ev.id} className={styles.eventNode}>
              <div
                className={clsx(
                  styles.nodeDot,
                  isCritical && styles.nodeDotCritical,
                  isHigh && styles.nodeDotHigh
                )}
              />

              <article className={styles.eventCard}>
                <div className={styles.eventTopRow}>
                  <div className={styles.eventTitleGroup}>
                    <div className={styles.eventMeta}>
                      <span>
                        <Calendar size={12} style={{ display: "inline", marginRight: "3px" }} />
                        {ev.date} at {ev.time}
                      </span>
                      <span>•</span>
                      <span style={{ textTransform: "capitalize", fontWeight: 600 }}>
                        {ev.category}
                      </span>
                    </div>
                    <h2 className={styles.eventTitle}>{ev.title}</h2>
                  </div>

                  <div className={styles.badgesRow}>
                    {isExternal && (
                      <span className={styles.externalBadge} title="Record originated outside primary clinic">
                        Source: External Provider
                      </span>
                    )}

                    {isCritical && (
                      <span
                        style={{
                          background: "#FCE8E6",
                          color: "#C5221F",
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>

                <p className={styles.eventDesc}>{ev.description}</p>

                <div className={styles.eventFooter}>
                  <span className={styles.authorText}>
                    <User size={12} />
                    <span>
                      {ev.author} ({ev.authorRole})
                    </span>
                  </span>

                  {ev.evidenceId && (
                    <button
                      type="button"
                      className={styles.viewDocBtn}
                      onClick={() => openEvidenceDrawer(ev.evidenceId)}
                    >
                      <FileText size={12} />
                      <span>[View Source]</span>
                    </button>
                  )}
                </div>
              </article>
            </div>
          );
        })}

        {filteredTimeline.length === 0 && (
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
            No events found matching your timeline query.
          </div>
        )}
      </div>
    </div>
  );
}
