"use client";

import * as React from "react";
import { useCaregiver } from "./caregiver-store";
import { PatientStateDigitalTwin } from "./PatientStateDigitalTwin";
import { X, Sparkles } from "lucide-react";
import styles from "./PatientStateModal.module.css";

export function PatientStateModal() {
  const { isPatientStateModalOpen, closePatientStateModal, activePatient } = useCaregiver();

  // Escape key listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isPatientStateModalOpen) {
        closePatientStateModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPatientStateModalOpen, closePatientStateModal]);

  if (!isPatientStateModalOpen) return null;

  return (
    <div className={styles.backdrop} onClick={closePatientStateModal} role="dialog" aria-modal="true" aria-labelledby="twin-modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={22} style={{ color: "var(--color-secondary)" }} />
            <div>
              <h2 id="twin-modal-title" style={{ margin: 0, fontSize: "var(--font-size-xl)", fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                Patient State &amp; Digital Twin Analysis
              </h2>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                Current condition relative to normal baseline for {activePatient.name}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={closePatientStateModal}
            aria-label="Close digital twin details"
          >
            <X size={24} />
          </button>
        </div>

        <PatientStateDigitalTwin />
      </div>
    </div>
  );
}
