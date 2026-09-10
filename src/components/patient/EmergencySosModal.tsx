"use client";

import * as React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  FileText,
  Heart,
  Phone,
  Pill,
  UserCheck,
  X,
} from "lucide-react";
import { patientPortalStore } from "@/services/patient-portal.service";
import styles from "./EmergencySosModal.module.css";

export interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencySosModal({ isOpen, onClose }: EmergencySosModalProps) {
  const patient = patientPortalStore.getPatient();

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="sos-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.topBar}>
          <div className={styles.headerTitleRow}>
            <span className={styles.sosPill}>EMERGENCY</span>
            <h1 id="sos-title" className={styles.modalTitle}>
              Emergency Medical Card
            </h1>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close emergency modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Big Action Call Buttons */}
        <div className={styles.callGrid}>
          <a href="tel:911" className={styles.call911Button} aria-label="Call 911 Emergency">
            <Phone size={26} />
            <span>Call 911 Now</span>
          </a>

          <a
            href={`tel:${patient.emergencyContact?.phone || "+1-555-0192"}`}
            className={styles.callContactButton}
            aria-label={`Call Emergency Contact ${patient.emergencyContact?.name || "Priya Kumar"}`}
          >
            <UserCheck size={26} />
            <span>Call {patient.emergencyContact?.name || "Priya (Daughter)"}</span>
          </a>
        </div>

        {/* Patient Identity */}
        <div className={styles.patientBox}>
          <h2 className={styles.patientName}>{patient.name}</h2>
          <div className={styles.patientMeta}>
            Age {patient.age} • Date of Birth: {patient.dateOfBirth} • Gender: {patient.gender}
          </div>
        </div>

        {/* Blood Type & Allergies */}
        <div className={styles.critSection}>
          <h3 className={styles.critTitle}>
            <Heart size={18} color="#DC2626" />
            <span>Blood Type & Known Allergies</span>
          </h3>
          <div className={styles.critCard}>
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>Blood Type:</strong>{" "}
              <span style={{ fontSize: "20px", color: "#DC2626", fontWeight: 800 }}>
                {patient.bloodType || "B+"}
              </span>
            </p>
            <p style={{ margin: 0 }}>
              <strong>Severe Allergies:</strong>{" "}
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a, i) => (
                  <span key={a.id || i} className={styles.allergyItem}>
                    {a.allergen} ({a.reaction}){i < patient.allergies.length - 1 ? ", " : ""}
                  </span>
                ))
              ) : (
                <span className={styles.allergyItem}>Penicillin (Severe Hives/Anaphylaxis), Sulfa drugs</span>
              )}
            </p>
          </div>
        </div>

        {/* Current Critical Medications */}
        <div className={styles.critSection}>
          <h3 className={styles.critTitle}>
            <Pill size={18} color="#2563EB" />
            <span>Current Critical Medications</span>
          </h3>
          <div className={styles.critCard}>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li><strong>Amlodipine 5mg</strong> (Daily morning for blood pressure)</li>
              <li><strong>Metformin 500mg</strong> (Twice daily with meals)</li>
              <li><strong>Aspirin 81mg</strong> (Daily stroke prevention)</li>
              <li><strong>Donepezil 5mg</strong> (Nightly at bedtime)</li>
              <li><strong>Zolpidem 5mg PRN</strong> (Bedtime as needed — fall caution)</li>
            </ul>
          </div>
        </div>

        {/* DNR / Advance Directive Information */}
        <div className={styles.critSection}>
          <h3 className={styles.critTitle}>
            <FileText size={18} color="#D97706" />
            <span>DNR & Advance Directives</span>
          </h3>
          <div className={styles.dnrAlert}>
            <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "17px", fontWeight: 800 }}>DNR Order on Official Record</div>
              <div>MetroHealth Hospital Registry ID #DNR-2024-8841. Healthcare proxy and medical power of attorney: Priya Kumar (+1-555-0192).</div>
            </div>
          </div>
        </div>

        {/* Primary Physician */}
        <div className={styles.critSection}>
          <div className={styles.critCard}>
            <strong>Primary Physician:</strong> {patient.primaryDoctor || "Dr. Rajesh Sharma, MD"} • MetroHealth Senior Specialty Clinic
          </div>
        </div>

        <button type="button" className={styles.dismissButton} onClick={onClose}>
          Close Emergency Card
        </button>
      </div>
    </div>
  );
}
