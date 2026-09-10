"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  FileSearch,
  Heart,
  Lock,
  Pill,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  AlertOctagon,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import styles from "./PatientOverviewView.module.css";

export function PatientOverviewView() {
  const {
    selectedPatient,
    careTeam,
    consentScopes,
    medications,
    setActiveTab,
    openEvidenceDrawer,
  } = useDoctorStore();

  const patientMeds = medications.filter(
    (m) => m.patientId === selectedPatient.id && m.status === "active"
  );

  return (
    <div className={styles.overviewContainer}>
      {/* Patient Summary Header */}
      <section className={styles.patientSummaryBanner}>
        <div className={styles.profileMain}>
          <div className={styles.profileAvatar}>
            {selectedPatient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div className={styles.profileMeta}>
            <h1 className={styles.patientNameTitle}>{selectedPatient.name}</h1>
            <div className={styles.demographicDetails}>
              <span>Age {selectedPatient.age}</span>
              <span className={styles.demoDot}>•</span>
              <span>DOB: {selectedPatient.dateOfBirth}</span>
              <span className={styles.demoDot}>•</span>
              <span>Gender: {selectedPatient.gender}</span>
              <span className={styles.demoDot}>•</span>
              <span>Blood: {selectedPatient.bloodType || "B+"}</span>
              <span className={styles.demoDot}>•</span>
              <span>MRN: {selectedPatient.id}</span>
              <span className={styles.demoDot}>•</span>
              <span>Lang: {selectedPatient.preferredLanguage}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#68717C", marginTop: "2px" }}>
              Address: {selectedPatient.address} • Phone: {selectedPatient.phone}
            </div>
          </div>
        </div>

        <div className={styles.quickActionsGroup}>
          <button
            type="button"
            className={styles.quickActionBtn}
            onClick={() => setActiveTab("changes")}
          >
            <AlertTriangle size={14} color="#B58A43" />
            <span>Key Changes</span>
          </button>

          <button
            type="button"
            className={styles.quickActionBtn}
            onClick={() => setActiveTab("state")}
          >
            <Sparkles size={14} color="#67B8BA" />
            <span>Digital Twin</span>
          </button>

          <button
            type="button"
            className={styles.quickActionBtn}
            onClick={() => setActiveTab("assistant")}
          >
            <Stethoscope size={14} color="#122544" />
            <span>AI Assistant</span>
          </button>
        </div>
      </section>

      {/* Two Column Grid */}
      <div className={styles.overviewGrid}>
        {/* Left Column: Clinical Core (Allergies, Medications, Diagnoses) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Active Diagnoses */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingLeft}>
                <Stethoscope size={16} color="#122544" />
                <span>Active Diagnoses & Conditions</span>
              </div>
              <span style={{ fontSize: "12px", color: "#68717C" }}>
                {selectedPatient.activeConditions.length} Diagnoses
              </span>
            </div>

            <div className={styles.diagnosesContainer}>
              {selectedPatient.activeConditions.map((condition, idx) => (
                <div key={idx} className={styles.diagnosisPill}>
                  <CheckCircle2 size={14} color="#4E8B72" />
                  <span>{condition}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Allergies & Adverse Reactions */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingLeft}>
                <AlertOctagon size={16} color="#C5221F" />
                <span>Known Allergies & Adverse Reactions</span>
              </div>
              <span style={{ fontSize: "12px", color: "#C5221F", fontWeight: 700 }}>
                {selectedPatient.allergies?.length || 0} Critical Flags
              </span>
            </div>

            <div className={styles.allergiesGrid}>
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                selectedPatient.allergies.map((allergy) => (
                  <div key={allergy.id} className={styles.allergyItem}>
                    <div className={styles.allergyAllergen}>
                      <span>{allergy.allergen}</span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          background: "#FED7D7",
                          color: "#C5221F",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        {allergy.severity}
                      </span>
                    </div>
                    <span className={styles.allergyReaction}>Reaction: {allergy.reaction}</span>
                    <span className={styles.allergyDate}>Diagnosed: {allergy.diagnosedDate}</span>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, fontSize: "13px", color: "#68717C" }}>
                  No active allergies on clinical record.
                </p>
              )}
            </div>
          </section>

          {/* Active Medications List */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingLeft}>
                <Pill size={16} color="#122544" />
                <span>Active Medications ({patientMeds.length})</span>
              </div>
              <button
                type="button"
                className={styles.quickActionBtn}
                style={{ padding: "4px 10px", fontSize: "12px" }}
                onClick={() => setActiveTab("prescribe")}
              >
                + Prescribe
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className={styles.medsTable}>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage & Frequency</th>
                    <th>Indication</th>
                    <th>Instructions / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {patientMeds.map((med) => {
                    const isRecent = med.isRecentChange;

                    return (
                      <tr key={med.id}>
                        <td>
                          <div className={styles.medNameCell}>{med.name}</div>
                          <div style={{ fontSize: "11px", color: "#68717C" }}>
                            {med.genericName}
                          </div>
                          {isRecent && (
                            <span className={styles.recentBadge}>
                              ⚠️ Recent Change (5d ago)
                            </span>
                          )}
                        </td>
                        <td>
                          <div>{med.dosage}</div>
                          <div style={{ fontSize: "12px", color: "#68717C" }}>
                            {med.frequency}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px" }}>{med.indication}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#4B5563" }}>
                            {med.instructions}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Care Team & Consent Scope */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Care Team */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingLeft}>
                <Users size={16} color="#122544" />
                <span>Multidisciplinary Care Team</span>
              </div>
            </div>

            <div className={styles.careTeamList}>
              {careTeam.map((member, idx) => (
                <div key={idx} className={styles.careMemberCard}>
                  <span className={styles.memberRole}>{member.role}</span>
                  <span className={styles.memberName}>{member.name}</span>
                  <span className={styles.memberOrg}>{member.organization}</span>
                  <span className={styles.memberContact}>📞 {member.contact}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Consent Scope Overview */}
          <section className={styles.cardSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingLeft}>
                <ShieldCheck size={16} color="#4E8B72" />
                <span>Your Access Scope (Consent)</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: "12px", color: "#68717C" }}>
              Restricted categories are visibly identified rather than silently hidden per clinical
              governance.
            </p>

            <table className={styles.consentTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {consentScopes.map((scope, idx) => {
                  const isAvail = scope.status === "available";
                  const isRestricted = scope.status === "restricted";
                  const isPending = scope.status === "pending";

                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#122544" }}>{scope.category}</div>
                        <div style={{ fontSize: "11px", color: "#68717C" }}>{scope.details}</div>
                      </td>
                      <td>
                        {isAvail ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              color: "#137333",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            ✓ Available
                          </span>
                        ) : isRestricted ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              color: "#C5221F",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            <Lock size={10} /> Restricted
                          </span>
                        ) : isPending ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              color: "#B06000",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            <Clock size={10} /> Pending
                          </span>
                        ) : (
                          <span style={{ color: "#5F6368", fontSize: "11px" }}>Expired</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
