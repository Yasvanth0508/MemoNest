"use client";

import * as React from "react";
import { CheckCircle, Info, X } from "lucide-react";
import clsx from "clsx";
import styles from "./DigitalTwinBadge.module.css";

export type HealthTwinState = "stable" | "mild_deviation" | "significant_deviation";

export interface DigitalTwinBadgeProps {
  state?: HealthTwinState;
  showExplanationOnClick?: boolean;
}

export function DigitalTwinBadge({
  state = "stable",
  showExplanationOnClick = true,
}: DigitalTwinBadgeProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const config = {
    stable: {
      label: "Health State: Stable",
      badgeClass: styles.status_stable,
      summary:
        "Your vital signs, blood sugar, and daily movement patterns are steady and within your normal range.",
      points: [
        "Blood pressure is well-controlled on your current routine",
        "Recent blood tests show stable kidney and blood sugar levels",
        "No unexpected medication changes needed today",
      ],
    },
    mild_deviation: {
      label: "Health State: Mild Deviation",
      badgeClass: styles.status_mild_deviation,
      summary:
        "A small change was noted in your evening rest and transfer safety. Your care team is keeping a gentle watch.",
      points: [
        "Anita noted mild morning stiffness during chair transfers",
        "New sleep medication was started this week and is being monitored",
        "No emergency intervention needed; follow up with Dr. Sharma tomorrow",
      ],
    },
    significant_deviation: {
      label: "Health State: Needs Attention",
      badgeClass: styles.status_significant_deviation,
      summary:
        "Important medical updates need review by your doctor. Please check your alerts or call the clinic.",
      points: [
        "Recent fall incident reported by caregiver",
        "Doctor follow-up recommended today",
      ],
    },
  }[state];

  return (
    <>
      <button
        type="button"
        className={clsx(styles.container, config.badgeClass)}
        onClick={() => showExplanationOnClick && setIsOpen(true)}
        title="Click for a simple health explanation"
        aria-label={`${config.label}. Click to learn what this means.`}
      >
        <span className={styles.pulseDot} aria-hidden="true" />
        <span>{config.label}</span>
        <Info size={14} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsOpen(false)}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dt-title"
          >
            <div className={styles.modalHeader}>
              <h2 id="dt-title" className={styles.modalTitle}>
                What Does This Mean?
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <p className={styles.explanation}>{config.summary}</p>

            <div className={styles.plainPointers}>
              {config.points.map((pt, idx) => (
                <div key={idx} className={styles.pointerItem}>
                  <CheckCircle size={18} className={styles.checkIcon} aria-hidden="true" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.doneButton}
              onClick={() => setIsOpen(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}
