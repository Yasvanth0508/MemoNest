"use client";

import * as React from "react";
import { useCaregiver } from "./caregiver-store";
import { VoiceObservationInput } from "./VoiceObservationInput";
import styles from "./ObservationDrawer.module.css";

export function ObservationDrawer() {
  const {
    isObservationDrawerOpen,
    closeObservationDrawer,
    preselectedCategory,
    preselectedTag,
  } = useCaregiver();

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isObservationDrawerOpen) {
        closeObservationDrawer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isObservationDrawerOpen, closeObservationDrawer]);

  if (!isObservationDrawerOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={closeObservationDrawer}
      role="dialog"
      aria-modal="true"
      aria-label="Log an Observation Modal"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <VoiceObservationInput
          initialCategory={preselectedCategory}
          initialTag={preselectedTag}
          onSuccess={closeObservationDrawer}
          onCancel={closeObservationDrawer}
        />
      </div>
    </div>
  );
}
