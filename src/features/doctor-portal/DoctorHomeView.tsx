"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileText,
  Heart,
  Pill,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  Activity,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import styles from "./DoctorHomeView.module.css";

export function DoctorHomeView() {
  const {
    patients,
    selectedPatient,
    selectPatient,
    allChanges,
    openEvidenceDrawer,
    setActiveTab,
  } = useDoctorStore();

  const [searchFilter, setSearchFilter] = React.useState("");

  const filteredChanges = allChanges.filter((change) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      change.title.toLowerCase().includes(q) ||
      change.shortExplanation.toLowerCase().includes(q) ||
      change.sourceText.toLowerCase().includes(q)
    );
  });

  const criticalChangesCount = allChanges.filter((c) => c.severity === "critical").length;

  return (
    <div className={styles.homeContainer}>
      {/* Clinician Overview Hero */}
      <section className={styles.heroHeader}>
        <div className={styles.heroTitleGroup}>
          <h1 className={styles.heroTitle}>Doctor Clinical Overview</h1>
          <p className={styles.heroSubtitle}>
            Dr. Rajesh Sharma, MD • Active Geriatric Care Roster & Prioritized Attention Signals
          </p>
        </div>

        <div className={styles.quickStatsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>3</span>
            <span className={styles.statLabel}>Active Roster</span>
          </div>

          <div className={styles.statCard}>
            <span className={clsx(styles.statValue, styles.statValueAlert)}>
              {criticalChangesCount}
            </span>
            <span className={styles.statLabel}>Immediate Attention</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>1</span>
            <span className={styles.statLabel}>Twin Deviation</span>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className={styles.dashboardGrid}>
        {/* Left Column: Prioritized Important Changes */}
        <section aria-labelledby="important-changes-heading">
          <div className={styles.sectionHeader}>
            <h2 id="important-changes-heading" className={styles.sectionTitle}>
              <ShieldAlert size={18} color="#C5221F" />
              <span>Important Changes Requiring Attention</span>
              <span className={styles.badgeCount}>{allChanges.length}</span>
            </h2>
          </div>

          <div className={styles.changesList}>
            {filteredChanges.map((change) => {
              const p = patients.find((pat) => pat.id === change.patientId) || patients[0];
              const patientName = p?.name || "Ravi Kumar";
              const isCritical = change.severity === "critical";
              const isHigh = change.severity === "high";

              return (
                <article
                  key={change.id}
                  className={clsx(
                    styles.changeCard,
                    isCritical && styles.changeCardCritical,
                    isHigh && styles.changeCardHigh,
                    !isCritical && !isHigh && styles.changeCardMedium
                  )}
                >
                  <div className={changeTopRowStyle(change.severity)}>
                    <div className={styles.changeTitleGroup}>
                      <span className={styles.changePatientBadge}>{patientName}</span>
                      <h3 className={styles.changeTitle}>{change.title}</h3>
                    </div>

                    <span
                      className={clsx(
                        styles.severityPill,
                        isCritical && styles.severityCritical,
                        isHigh && styles.severityHigh,
                        !isCritical && !isHigh && styles.severityMedium
                      )}
                    >
                      {change.severity}
                    </span>
                  </div>

                  <p className={styles.changeExplanation}>{change.shortExplanation}</p>

                  <div className={styles.changeFooter}>
                    <span className={styles.sourceText}>
                      Source: {change.sourceText} • {change.date}
                    </span>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {change.evidenceId && (
                        <button
                          type="button"
                          className={styles.viewSourceBtn}
                          onClick={() => openEvidenceDrawer(change.evidenceId)}
                          aria-label={`View evidence source for ${change.title}`}
                        >
                          <FileText size={12} />
                          <span>View Source</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className={styles.viewSourceBtn}
                        onClick={() => selectPatient(change.patientId, "changes")}
                        aria-label={`Inspect ${patientName}'s records`}
                      >
                        <span>Open Record</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Right Column: Patients / Recent Patients */}
        <section aria-labelledby="patients-roster-heading">
          <div className={styles.sectionHeader}>
            <h2 id="patients-roster-heading" className={styles.sectionTitle}>
              <Users size={18} color="#122544" />
              <span>Patients / Active Roster</span>
            </h2>
          </div>

          <div className={styles.patientsList}>
            {patients.map((patient) => {
              const isSelected = patient.id === selectedPatient.id;
              const isRavi = patient.id === "patient-001";
              const isMargaret = patient.id === "patient-002";

              return (
                <div
                  key={patient.id}
                  className={clsx(styles.patientCard, isSelected && styles.patientCardSelected)}
                >
                  <div className={styles.patientTopRow}>
                    <div className={styles.patientIdentity}>
                      <div className={styles.patientAvatarLg}>
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      <div className={styles.patientInfoText}>
                        <h3 className={styles.patientCardName}>{patient.name}</h3>
                        <span className={styles.patientCardDemographics}>
                          Age {patient.age} • {patient.gender} • Blood {patient.bloodType || "B+"} • MRN: {patient.id}
                        </span>
                      </div>
                    </div>

                    {isRavi ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "#FCE8E6",
                          color: "#C5221F",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "999px",
                        }}
                      >
                        <AlertTriangle size={12} />
                        Significant Deviation
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "#DEF7EC",
                          color: "#03543F",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "999px",
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Stable
                      </span>
                    )}
                  </div>

                  <div className={styles.patientCardBody}>
                    <div className={styles.cardDataField}>
                      <span className={styles.fieldLabel}>Primary Conditions</span>
                      <span className={styles.fieldValue}>
                        {patient.activeConditions.slice(0, 3).join(", ")}
                      </span>
                    </div>

                    <div className={styles.cardDataField}>
                      <span className={styles.fieldLabel}>Active Medications</span>
                      <span className={styles.fieldValue}>
                        {isRavi ? "7 Active (Sedation Warning)" : isMargaret ? "4 Active" : "3 Active"}
                      </span>
                    </div>
                  </div>

                  {/* Recent Important Activity */}
                  <div className={styles.recentActivityStrip}>
                    {isRavi ? (
                      <>
                        <AlertTriangle size={14} className={styles.activityIconAlert} />
                        <span>
                          <strong>2 Falls logged in 24h</strong> (Transfer instability; Zolpidem PRN added 5d ago).
                        </span>
                      </>
                    ) : isMargaret ? (
                      <>
                        <Clock size={14} color="#68717C" />
                        <span>Routine blood pressure check recorded 2d ago.</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} color="#4E8B72" />
                        <span>Post-CABG cardiac rehab completed successfully.</span>
                      </>
                    )}
                  </div>

                  <div className={styles.patientCardFooter}>
                    <span style={{ fontSize: "12px", color: "#68717C" }}>
                      Mobility: {patient.mobilityStatus || "Independent"}
                    </span>

                    <button
                      type="button"
                      className={styles.openWorkspaceBtn}
                      onClick={() => selectPatient(patient.id, "overview")}
                    >
                      <span>Select Patient</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function changeTopRowStyle(severity: string) {
  return styles.changeTopRow;
}
