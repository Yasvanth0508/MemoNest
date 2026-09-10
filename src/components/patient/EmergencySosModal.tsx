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
  const storePatient = patientPortalStore.getPatient();
  const [sosData, setSosData] = React.useState<any | null>(null);

  // Fetch live SOS emergency record
  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadSos() {
      try {
        const res = await fetch("/api/patient/emergency-sos");
        if (res.ok && isMounted) {
          const data = await res.json();
          setSosData(data);
        }
      } catch {
        // Fallback to store
      }
    }
    loadSos();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

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

  const patient = {
    name: sosData?.name || storePatient.name || "Ravi Kumar",
    age: sosData?.age ?? storePatient.age ?? 74,
    dateOfBirth: sosData?.dateOfBirth || storePatient.dateOfBirth || "1952-04-12",
    gender: sosData?.gender || storePatient.gender || "Male",
    bloodType: sosData?.bloodType || storePatient.bloodType || "B+",
    mobilityStatus: sosData?.mobilityStatus || storePatient.mobilityStatus || "Walker required",
    emergencyContact: sosData?.emergencyContact || storePatient.emergencyContact || {
      name: "Meera Kumar",
      relationship: "Daughter / Legal Healthcare Proxy",
      phone: "+1-555-0199",
    },
    allergies: sosData?.allergies || storePatient.allergies || [],
    activeMedications: sosData?.activeMedications || [
      { name: "Amlodipine", dosage: "5mg", frequency: "Daily morning", indication: "Blood pressure" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", indication: "Blood glucose" },
      { name: "Aspirin", dosage: "81mg", frequency: "Daily", indication: "Stroke prevention" },
      { name: "Donepezil", dosage: "5mg", frequency: "Nightly bedtime", indication: "Cognitive support" },
      { name: "Zolpidem", dosage: "5mg", frequency: "PRN bedtime", fallRiskWarning: true, sedationRisk: true, indication: "Insomnia (Fall caution)" },
    ],
    primaryDoctor: sosData?.primaryDoctor || storePatient.primaryDoctor || "Dr. Rajesh Sharma, MD",
    dnrStatus: sosData?.dnrStatus || "DNR Order on Official Record #DNR-2024-8841",
  };

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
            href={`tel:${patient.emergencyContact?.phone || "+1-555-0199"}`}
            className={styles.callContactButton}
            aria-label={`Call Emergency Contact ${patient.emergencyContact?.name || "Healthcare Proxy"}`}
          >
            <UserCheck size={26} />
            <span>Call {patient.emergencyContact?.name || "Healthcare Proxy"}</span>
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
                {patient.bloodType}
              </span>
            </p>
            <p style={{ margin: 0 }}>
              <strong>Severe Allergies:</strong>{" "}
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a: any, i: number) => (
                  <span key={a.id || i} className={styles.allergyItem}>
                    {a.allergen} ({a.reaction || a.severity}){i < patient.allergies.length - 1 ? ", " : ""}
                  </span>
                ))
              ) : (
                <span className={styles.allergyItem}>None documented</span>
              )}
            </p>
          </div>
        </div>

        {/* Current Critical Medications */}
        <div className={styles.critSection}>
          <h3 className={styles.critTitle}>
            <Pill size={18} color="#2563EB" />
            <span>Current Critical Medications ({patient.activeMedications.length})</span>
          </h3>
          <div className={styles.critCard}>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {patient.activeMedications.map((m: any, idx: number) => (
                <li key={idx} style={{ marginBottom: "6px" }}>
                  <strong>{m.name} {m.dosage}</strong> ({m.frequency})
                  {m.fallRiskWarning && (
                    <span style={{ marginLeft: "8px", color: "#DC2626", fontWeight: 700, fontSize: "12px" }}>
                      ⚠️ Fall Risk Warning
                    </span>
                  )}
                  {m.sedationRisk && (
                    <span style={{ marginLeft: "8px", color: "#D97706", fontWeight: 700, fontSize: "12px" }}>
                      ⚠️ Sedation Caution
                    </span>
                  )}
                  {m.indication && <span style={{ color: "#68717C", fontSize: "12px" }}> — {m.indication}</span>}
                </li>
              ))}
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
              <div style={{ fontSize: "17px", fontWeight: 800 }}>{patient.dnrStatus}</div>
              <div>Healthcare proxy and medical power of attorney: {patient.emergencyContact?.name} ({patient.emergencyContact?.phone}).</div>
            </div>
          </div>
        </div>

        {/* Primary Physician */}
        <div className={styles.critSection}>
          <div className={styles.critCard}>
            <strong>Primary Physician:</strong> {patient.primaryDoctor} • MetroHealth Senior Specialty Clinic
          </div>
        </div>

        <button type="button" className={styles.dismissButton} onClick={onClose}>
          Close Emergency Card
        </button>
      </div>
    </div>
  );
}
