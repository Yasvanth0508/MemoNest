"use client";

import * as React from "react";
import { useCaregiver, RiskIndicator } from "./caregiver-store";
import {
  AlertTriangle,
  Heart,
  Pill,
  Activity,
  Brain,
  Utensils,
  Phone,
  ShieldCheck,
  Lock,
  PlusCircle,
  User,
  Stethoscope,
  Clock,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import styles from "./PatientDetailsView.module.css";

export function PatientDetailsView() {
  const { activePatient, activePatientCare, openObservationDrawer } = useCaregiver();
  const { escalationProtocol, watchList, medicationsList, restrictedItems } = activePatientCare;

  const getRiskIcon = (category: string) => {
    switch (category) {
      case "fall":
        return <AlertTriangle size={20} />;
      case "confusion":
        return <Brain size={20} />;
      case "mobility":
        return <Activity size={20} />;
      case "medication_adherence":
        return <Pill size={20} />;
      case "appetite":
        return <Utensils size={20} />;
      default:
        return <Heart size={20} />;
    }
  };

  return (
    <div className={styles.container} role="region" aria-label="Patient details, risk indicators, and escalation care protocol">
      {/* 1. Prominent "What to Watch For" Section */}
      <div className={styles.watchForSection}>
        <div className={styles.watchForHeader}>
          <div>
            <div className={styles.watchBadge}>
              <AlertTriangle size={14} />
              Condition-Specific Care Signals
            </div>
            <h2 className={styles.sectionTitle} style={{ marginTop: 8 }}>
              What to Watch For
            </h2>
            <p className={styles.sectionSubtitle}>
              Doctor-prescribed risk indicators to monitor closely for {activePatient.name}. Tap &quot;Log This&quot; to quickly record an observation.
            </p>
          </div>
        </div>

        <div className={styles.watchGrid}>
          {watchList.map((item: RiskIndicator) => (
            <div key={item.id} className={styles.watchCard}>
              <div>
                <div className={styles.watchCardHeader}>
                  <div
                    className={clsx(
                      styles.watchIconCircle,
                      item.severity === "urgent" && styles.iconUrgent,
                      item.severity === "moderate" && styles.iconModerate,
                      item.severity === "mild" && styles.iconMild
                    )}
                  >
                    {getRiskIcon(item.category)}
                  </div>
                  <div>
                    <h3 className={styles.watchCardTitle}>{item.title}</h3>
                    <p className={styles.watchDescription}>{item.description}</p>
                  </div>
                </div>

                <div className={styles.doctorNoteBox} style={{ marginTop: 12 }}>
                  <span className={styles.doctorNoteLabel}>Care Protocol</span>
                  {item.doctorInstructions}
                </div>

                <div className={styles.signalsRow} style={{ marginTop: 10 }}>
                  {item.signals.map((sig, idx) => (
                    <span key={idx} className={styles.signalTag}>
                      • {sig}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={styles.logThisButton}
                onClick={() => openObservationDrawer(item.category, item.title)}
                aria-label={`Log an observation for ${item.title}`}
              >
                <PlusCircle size={16} />
                <span>Log Observation for This</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Demographics & Primary Conditions */}
      <div className={styles.twoColGrid}>
        {/* Demographics Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <User size={20} style={{ color: "var(--color-primary)" }} />
            <h3 className={styles.cardTitle}>Patient Demographics</h3>
          </div>

          <div className={styles.demographicsList}>
            <div className={styles.demoItem}>
              <span className={styles.demoLabel}>Full Name</span>
              <span className={styles.demoValue}>{activePatient.name}</span>
            </div>
            <div className={styles.demoItem}>
              <span className={styles.demoLabel}>Age / Gender</span>
              <span className={styles.demoValue}>
                {activePatient.age} years old • {activePatient.gender}
              </span>
            </div>
            <div className={styles.demoItem}>
              <span className={styles.demoLabel}>Date of Birth</span>
              <span className={styles.demoValue}>{activePatient.dateOfBirth}</span>
            </div>
            <div className={styles.demoItem}>
              <span className={styles.demoLabel}>Blood Type</span>
              <span className={styles.demoValue}>{activePatient.bloodType || "B+"}</span>
            </div>
            <div className={styles.demoItem}>
              <span className={styles.demoLabel}>Primary Physician</span>
              <span className={styles.demoValue}>{activePatient.primaryDoctor}</span>
            </div>
            <div className={styles.demoItem}>
              <span className={styles.demoLabel}>Preferred Language</span>
              <span className={styles.demoValue}>{activePatient.preferredLanguage || "English"}</span>
            </div>
            <div className={styles.demoItem} style={{ gridColumn: "1 / -1" }}>
              <span className={styles.demoLabel}>Current Residence</span>
              <span className={styles.demoValue}>{activePatient.address || "Home with Daily Caregiver Support"}</span>
            </div>
          </div>
        </div>

        {/* Primary Conditions Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <Stethoscope size={20} style={{ color: "var(--color-primary)" }} />
            <h3 className={styles.cardTitle}>Primary Conditions</h3>
          </div>

          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: 16 }}>
            Diagnosed chronic and active conditions managed in {activePatient.name}&apos;s care plan:
          </p>

          <div className={styles.conditionChips}>
            {activePatient.activeConditions.map((cond, idx) => (
              <span key={idx} className={styles.conditionChip}>
                <Activity size={14} style={{ color: "var(--color-secondary)" }} />
                {cond}
              </span>
            ))}
          </div>

          {activePatient.mobilityStatus && (
            <div
              style={{
                marginTop: 20,
                background: "#f0f7f6",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid #c9e5e3",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#1a6b6d", display: "block" }}>
                Mobility & Transfer Baseline
              </span>
              <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500 }}>
                {activePatient.mobilityStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Allergies & Escalation Protocol Grid */}
      <div className={styles.twoColGrid}>
        {/* Allergies Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <ShieldAlert size={20} style={{ color: "var(--color-danger)" }} />
            <h3 className={styles.cardTitle}>Allergies & Critical Warnings</h3>
          </div>

          {activePatient.allergies.length > 0 ? (
            <div className={styles.allergyGrid}>
              {activePatient.allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className={clsx(
                    styles.allergyItem,
                    allergy.severity === "severe" ? undefined : styles.allergyItemWarning
                  )}
                >
                  <div>
                    <div className={styles.allergyTitle}>
                      <AlertTriangle size={16} />
                      {allergy.allergen} ({allergy.severity.toUpperCase()})
                    </div>
                    <div className={styles.allergyReaction}>
                      <strong>Reaction:</strong> {allergy.reaction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "16px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--radius-md)",
                color: "#166534",
                fontSize: 14,
              }}
            >
              <CheckCircleIcon /> No known critical medication allergies recorded.
            </div>
          )}
        </div>

        {/* Escalation Protocol Card */}
        <div className={styles.escalationCard}>
          <div className={styles.cardHeader} style={{ borderColor: "#bee3f8" }}>
            <Phone size={20} style={{ color: "#2b6cb0" }} />
            <h3 className={styles.cardTitle}>Escalation Protocol</h3>
          </div>

          <div className={styles.protocolSteps}>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepText}>{escalationProtocol.step1}</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepText}>{escalationProtocol.step2}</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepText}>{escalationProtocol.step3}</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepText}>{escalationProtocol.step4}</div>
            </div>
          </div>

          <div className={styles.quickActionRow}>
            <a
              href={`tel:${activePatient.emergencyContact?.phone || "+1-555-0192"}`}
              className={styles.callButton}
              aria-label={`Call Emergency Contact ${activePatient.emergencyContact?.name}`}
            >
              <Phone size={15} />
              <span>Call Contact ({activePatient.emergencyContact?.name})</span>
            </a>

            <a
              href={`tel:${escalationProtocol.triagePhone}`}
              className={styles.callButton}
              aria-label="Call Clinic On-Call Triage Desk"
            >
              <Stethoscope size={15} />
              <span>Call Clinic Desk</span>
            </a>

            <a
              href="tel:911"
              className={styles.callButton}
              style={{ background: "#d9383a", color: "white", borderColor: "#d9383a" }}
              aria-label="Call 911 Emergency Services"
            >
              <AlertTriangle size={15} />
              <span>Dial 911</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Current Medications */}
      <div className={styles.infoCard}>
        <div className={styles.cardHeader}>
          <Pill size={20} style={{ color: "var(--color-primary)" }} />
          <div>
            <h3 className={styles.cardTitle}>Current Medications</h3>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
              Active prescription schedule to monitor and verify ingestion
            </span>
          </div>
        </div>

        <div className={styles.medList}>
          {medicationsList.map((med) => (
            <div key={med.id} className={styles.medItem}>
              <div className={styles.medItemLeft}>
                <div className={styles.medIconWrapper}>
                  <Pill size={18} />
                </div>
                <div>
                  <div className={styles.medName}>
                    {med.name} <span style={{ fontWeight: 500, fontSize: 14 }}>({med.dosage})</span>
                  </div>
                  <div className={styles.medPurpose}>
                    <strong>Purpose:</strong> {med.purpose}
                  </div>
                  {med.specialInstructions && (
                    <div style={{ fontSize: 12, color: "#a85d58", marginTop: 2, fontWeight: 500 }}>
                      ⚠️ {med.specialInstructions}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.medScheduleBadge}>
                <Clock size={13} style={{ display: "inline", marginRight: 4 }} />
                {med.timing}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Consent-Aware Interface: Restricted Information */}
      <div className={styles.restrictedSection} role="region" aria-label="Restricted Information Policy">
        <div className={styles.restrictedHeader}>
          <Lock size={20} style={{ color: "#8c735d" }} />
          <h3 className={styles.restrictedTitle}>Restricted Information Scope</h3>
        </div>

        <p className={styles.restrictedBannerNote}>
          All health records displayed to caregivers are strictly governed by {activePatient.name}&apos;s consent authorizations. In compliance with patient privacy rights, restricted records are transparently noted rather than omitted:
        </p>

        {restrictedItems.length > 0 ? (
          <div className={styles.restrictedGrid}>
            {restrictedItems.map((item, idx) => (
              <div key={idx} className={styles.restrictedCard}>
                <div className={styles.restrictedCardTitle}>
                  <Lock size={14} style={{ color: "#a88b72" }} />
                  {item.title}
                </div>
                <div className={styles.restrictedReason}>
                  <strong>Status:</strong> You do not currently have access to this information.
                </div>
                <div className={styles.restrictedReason}>{item.reason}</div>
                <div className={styles.restrictedPolicy}>{item.restrictedBy}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
            No restricted information categories apply to your current caregiver scope for this patient.
          </p>
        )}
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline", marginRight: 6 }}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
