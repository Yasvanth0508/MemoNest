"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  Pill,
  FileText,
  AlertTriangle,
  Check,
  CheckCircle2,
  ShieldAlert,
  Stethoscope,
  Plus,
  AlertOctagon,
} from "lucide-react";
import clsx from "clsx";
import styles from "./PrescriptionNotesView.module.css";

const COMMON_ICD_CODES = [
  { code: "R29.6", label: "Repeated falls / Tendency to fall" },
  { code: "G31.84", label: "Mild cognitive impairment, so stated" },
  { code: "I69.30", label: "Unspecified sequelae of cerebral infarction" },
  { code: "I10", label: "Essential (primary) hypertension" },
  { code: "E11.9", label: "Type 2 diabetes mellitus without complications" },
  { code: "M17.0", label: "Bilateral primary osteoarthritis of knee" },
];

export function PrescriptionNotesView() {
  const {
    selectedPatient,
    medications,
    checkMedicationInteractions,
    addPrescription,
    addClinicalNote,
  } = useDoctorStore();

  const [activeMode, setActiveMode] = React.useState<"prescription" | "note">("prescription");

  // Prescription Form State
  const [medName, setMedName] = React.useState("");
  const [dosage, setDosage] = React.useState("5mg");
  const [frequency, setFrequency] = React.useState("Once Daily at Bedtime");
  const [duration, setDuration] = React.useState("30 Days");
  const [instructions, setInstructions] = React.useState("Take 1 tablet with water.");
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Diagnosis & Note Form State
  const [diagnosisTitle, setDiagnosisTitle] = React.useState("Acute Fall & Sedation Review");
  const [selectedCode, setSelectedCode] = React.useState("R29.6");
  const [subjective, setSubjective] = React.useState(
    "Patient accompanied by daughter Priya. Caregiver Anita reports 2 unassisted falls in past 24 hours. Morning grogginess and unsteady gait noted."
  );
  const [objective, setObjective] = React.useState(
    "BP 132/80 sitting, 118/74 standing. Mild right knee ecchymosis. Cranial nerves intact. No focal motor drop from stroke baseline."
  );
  const [assessment, setAssessment] = React.useState(
    "Acute-on-chronic fall cluster secondary to Zolpidem initiation and Beers Criteria sedative accumulation atop stroke motor weakness."
  );
  const [plan, setPlan] = React.useState(
    "Deprescribe Zolpidem PRN immediately. Order updated home safety PT consult. Hydration and non-pharmacologic sleep hygiene."
  );
  const [freeText, setFreeText] = React.useState("");

  // Real-time polypharmacy interaction check
  const activeInteraction = React.useMemo(() => {
    if (!medName) return null;
    return checkMedicationInteractions(medName);
  }, [medName, checkMedicationInteractions]);

  const activePatientMeds = medications.filter(
    (m) => m.patientId === selectedPatient.id && m.status === "active"
  );

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    addPrescription({
      medication: medName,
      dosage,
      frequency,
      duration,
      instructions,
    });

    setSuccessMsg(`✓ Prescription for ${medName} ${dosage} successfully added to unified record!`);
    setMedName("");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClinicalNote({
      title: diagnosisTitle,
      diagnosisCodes: [selectedCode],
      soap: { subjective, objective, assessment, plan },
      freeText,
    });

    setSuccessMsg(`✓ Clinical Progress Note signed and committed to ${selectedPatient.name}'s chart!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1 className={styles.heading}>
            <Stethoscope size={22} color="#122544" />
            <span>Prescription & Clinical Note Entry</span>
          </h1>
          <p className={styles.subheading}>
            Update {selectedPatient.name}'s unified health record with real-time polypharmacy checking
          </p>
        </div>

        <div className={styles.modeToggle} role="tablist">
          <button
            type="button"
            className={clsx(
              styles.toggleBtn,
              activeMode === "prescription" && styles.toggleBtnActive
            )}
            onClick={() => setActiveMode("prescription")}
            role="tab"
            aria-selected={activeMode === "prescription"}
          >
            <Pill size={14} style={{ display: "inline", marginRight: "6px" }} />
            <span>New Prescription Order</span>
          </button>

          <button
            type="button"
            className={clsx(styles.toggleBtn, activeMode === "note" && styles.toggleBtnActive)}
            onClick={() => setActiveMode("note")}
            role="tab"
            aria-selected={activeMode === "note"}
          >
            <FileText size={14} style={{ display: "inline", marginRight: "6px" }} />
            <span>Diagnosis & SOAP Note</span>
          </button>
        </div>
      </section>

      {/* Success Banner */}
      {successMsg && (
        <div
          style={{
            background: "#DEF7EC",
            border: "1px solid #BCF0DA",
            borderRadius: "10px",
            padding: "12px 18px",
            color: "#03543F",
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Current Active Medications Strip (Contextual Reference) */}
      <section className={styles.currentMedsStrip}>
        <span className={styles.currentMedsLabel}>
          Current Active Medications Baseline ({activePatientMeds.length} concurrent):
        </span>
        <div className={styles.medPills}>
          {activePatientMeds.map((med) => (
            <span key={med.id} className={styles.medPill}>
              {med.name} {med.dosage}
            </span>
          ))}
        </div>
      </section>

      {/* Mode 1: Prescription Order with Inline Polypharmacy Interaction Warning */}
      {activeMode === "prescription" && (
        <form className={styles.formCard} onSubmit={handlePrescriptionSubmit}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#122544" }}>
              Authorizing New Medication Order
            </h2>
            <span style={{ fontSize: "12px", color: "#68717C" }}>
              Automated Beers Criteria & Interaction Scan Active
            </span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Medication Name (Generic / Brand)</label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="e.g., Melatonin, Lorazepam, Gabapentin..."
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                required
              />
              <span style={{ fontSize: "11px", color: "#68717C" }}>
                Tip: Try typing "Lorazepam" or "Ibuprofen" to trigger real-time polypharmacy checks.
              </span>
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Dosage & Strength</label>
              <input
                type="text"
                className={styles.inputControl}
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Frequency / Timing</label>
              <select
                className={styles.inputControl}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Once Daily (Morning)">Once Daily (Morning)</option>
                <option value="Once Daily at Bedtime">Once Daily at Bedtime</option>
                <option value="Twice Daily with Meals">Twice Daily with Meals</option>
                <option value="PRN (As Needed)">PRN (As Needed for Acute Symptoms)</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Order Duration</label>
              <select
                className={styles.inputControl}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="7 Days (Short Course)">7 Days (Short Course)</option>
                <option value="14 Days">14 Days</option>
                <option value="30 Days (Standard Refill)">30 Days (Standard Refill)</option>
                <option value="90 Days (Chronic Maintenance)">90 Days (Chronic Maintenance)</option>
              </select>
            </div>

            <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.fieldLabel}>Dispense Instructions & Clinical Notes</label>
              <textarea
                className={styles.inputControl}
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Real-Time Polypharmacy & Drug Interaction Warning */}
          {activeInteraction && (
            <div className={styles.interactionWarningBox} role="alert">
              <div className={styles.warningHeader}>
                <AlertTriangle size={18} />
                <span>
                  Potential Medication Interaction: {activeInteraction.medicationsInvolved.join(" + ")}
                </span>
              </div>

              <div className={styles.warningContent}>
                <p style={{ margin: 0 }}>{activeInteraction.concern}</p>
                <p style={{ margin: "4px 0 0 0", fontWeight: 600 }}>
                  Recommendation: {activeInteraction.recommendation}
                </p>
              </div>

              <div className={styles.warningSource}>
                Supporting Evidence: {activeInteraction.source}
              </div>
            </div>
          )}

          <div className={styles.formFooter}>
            <span style={{ fontSize: "12px", color: "#68717C" }}>
              Authorized Prescriber: Dr. Rajesh Sharma, MD (NPI: #1492004812)
            </span>

            <button type="submit" className={styles.submitButton}>
              <Plus size={16} />
              <span>Submit & Update Regimen</span>
            </button>
          </div>
        </form>
      )}

      {/* Mode 2: Diagnosis & SOAP Clinical Note Entry */}
      {activeMode === "note" && (
        <form className={styles.formCard} onSubmit={handleNoteSubmit}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#122544" }}>
              Structured Clinical Encounter Note (SOAP)
            </h2>
            <span style={{ fontSize: "12px", color: "#68717C" }}>
              EHR Encounter Timestamp: {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Clinical Encounter Title</label>
              <input
                type="text"
                className={styles.inputControl}
                value={diagnosisTitle}
                onChange={(e) => setDiagnosisTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>Structured Clinical Code (ICD-10)</label>
              <select
                className={styles.inputControl}
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                {COMMON_ICD_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} — {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.fieldLabel}>Subjective (S)</label>
              <textarea
                className={styles.inputControl}
                rows={2}
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
              />
            </div>

            <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.fieldLabel}>Objective (O)</label>
              <textarea
                className={styles.inputControl}
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>

            <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.fieldLabel}>Assessment (A)</label>
              <textarea
                className={styles.inputControl}
                rows={2}
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
              />
            </div>

            <div className={styles.formField} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.fieldLabel}>Plan (P)</label>
              <textarea
                className={styles.inputControl}
                rows={2}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formFooter}>
            <span style={{ fontSize: "12px", color: "#68717C" }}>
              Signing as: Dr. Rajesh Sharma, MD (MetroHealth Senior Specialty Clinic)
            </span>

            <button type="submit" className={styles.submitButton}>
              <Check size={16} />
              <span>Sign & Commit Clinical Note</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
