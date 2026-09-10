"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  ShieldCheck,
  Check,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import styles from "./ConsentBanner.module.css";

export function ConsentBanner() {
  const { consentScopes, selectedPatient } = useDoctorStore();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const availableCount = consentScopes.filter((s) => s.status === "available").length;
  const restrictedCount = consentScopes.filter((s) => s.status === "restricted").length;
  const pendingCount = consentScopes.filter((s) => s.status === "pending").length;

  return (
    <div className={styles.bannerContainer} role="region" aria-label="Patient Data Consent Scope">
      <div className={styles.bannerMainRow}>
        <div className={styles.leftGroup}>
          <div className={styles.scopeTitleGroup}>
            <ShieldCheck size={16} className={styles.shieldIcon} />
            <span>Consent Scope ({selectedPatient.name}):</span>
          </div>

          <div className={styles.accessPills}>
            <span className={styles.pillAvailable} title="Fully authorized for clinical review">
              <Check size={12} />
              <span>{availableCount} Available</span>
            </span>

            {restrictedCount > 0 && (
              <span className={styles.pillRestricted} title="Restricted by patient preference">
                <Lock size={12} />
                <span>{restrictedCount} Restricted (Visible)</span>
              </span>
            )}

            {pendingCount > 0 && (
              <span className={styles.pillPending} title="Pending authorization / proxy renewal">
                <Clock size={12} />
                <span>{pendingCount} Pending</span>
              </span>
            )}
          </div>
        </div>

        <div className={styles.rightGroup}>
          <span className={styles.expiryText}>Active authorization valid through 01 Oct 2026</span>
          <button
            type="button"
            className={styles.expandToggle}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label="Toggle full consent details"
          >
            <span>{isExpanded ? "Hide Details" : "View Scope"}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expandedDetails}>
          {consentScopes.map((scope, idx) => {
            const isAvail = scope.status === "available";
            const isRestricted = scope.status === "restricted";
            const isPending = scope.status === "pending";

            return (
              <div key={idx} className={styles.scopeCard}>
                <div className={styles.scopeCardHeader}>
                  <span className={styles.scopeCardName}>{scope.category}</span>
                  <span
                    className={clsx(
                      isAvail && styles.pillAvailable,
                      isRestricted && styles.pillRestricted,
                      isPending && styles.pillPending,
                      scope.status === "expired" && styles.pillExpired
                    )}
                  >
                    {isAvail ? (
                      <>
                        <Check size={10} />
                        <span>Available</span>
                      </>
                    ) : isRestricted ? (
                      <>
                        <Lock size={10} />
                        <span>Restricted</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Clock size={10} />
                        <span>Pending</span>
                      </>
                    ) : (
                      <span>Expired</span>
                    )}
                  </span>
                </div>

                <span className={styles.scopeCardDesc}>
                  {isRestricted || isPending ? (
                    <strong style={{ color: isRestricted ? "#c5221f" : "#b06000" }}>
                      {scope.restrictionReason || "Access withheld."}{" "}
                    </strong>
                  ) : null}
                  {scope.details}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
