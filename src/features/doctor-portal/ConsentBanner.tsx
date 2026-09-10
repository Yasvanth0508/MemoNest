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
  ShieldAlert,
  X,
} from "lucide-react";
import clsx from "clsx";
import styles from "./ConsentBanner.module.css";

export function ConsentBanner() {
  const { consentScopes, selectedPatient, recordEmergencyBreakGlass } = useDoctorStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isBreakGlassOpen, setIsBreakGlassOpen] = React.useState(false);
  const [justification, setJustification] = React.useState("");
  const [department, setDepartment] = React.useState("Emergency Department / Trauma");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasOverrideActive, setHasOverrideActive] = React.useState(false);

  const availableCount = consentScopes.filter((s) => s.status === "available").length;
  const restrictedCount = consentScopes.filter((s) => s.status === "restricted").length;
  const pendingCount = consentScopes.filter((s) => s.status === "pending").length;

  const handleBreakGlassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || justification.trim().length < 10) return;
    setIsSubmitting(true);
    try {
      const ok = await recordEmergencyBreakGlass(justification.trim(), department);
      if (ok) {
        setHasOverrideActive(true);
        setIsBreakGlassOpen(false);
        setJustification("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

          {hasOverrideActive ? (
            <span className={styles.pillOverridden} title="24-Hour Emergency Override Active">
              <ShieldAlert size={12} />
              <span>EMERGENCY OVERRIDE ACTIVE</span>
            </span>
          ) : (
            <button
              type="button"
              className={styles.breakGlassBtn}
              onClick={() => setIsBreakGlassOpen(true)}
              aria-label="Trigger emergency break-glass override"
            >
              <AlertTriangle size={13} />
              <span>Break-Glass Override</span>
            </button>
          )}

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

      {/* Break Glass Modal */}
      {isBreakGlassOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" onClick={() => setIsBreakGlassOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <AlertTriangle size={22} />
                <span>Emergency Break-Glass Override</span>
              </div>
              <button
                type="button"
                className={styles.cancelBtn}
                style={{ padding: "4px 8px" }}
                onClick={() => setIsBreakGlassOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.legalNotice}>
              <strong>HIPAA & 45 CFR § 164.512 Protocol:</strong> Executing emergency break-glass grants immediate, full 24-hour access to restricted clinical data for <strong>{selectedPatient.name}</strong>. This event is permanently and immutably written to compliance audit logs.
            </div>

            <form onSubmit={handleBreakGlassSubmit} className={styles.modalForm}>
              <div>
                <label className={styles.inputLabel}>Clinical Justification (Required, min 10 characters):</label>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="e.g. Acute trauma or altered mental status with high risk of drug interaction; surrogate unavailable..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={styles.inputLabel}>Department / Clinical Context:</label>
                <select
                  className={styles.modalSelect}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Emergency Department / Trauma">Emergency Department / Trauma</option>
                  <option value="Geriatric Intensive Care Unit">Geriatric Intensive Care Unit</option>
                  <option value="Inpatient Acute Medical Care">Inpatient Acute Medical Care</option>
                  <option value="Rapid Response Consult">Rapid Response Consult</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsBreakGlassOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.confirmOverrideBtn}
                  disabled={isSubmitting || justification.trim().length < 10}
                >
                  <ShieldAlert size={14} />
                  <span>{isSubmitting ? "Authorizing Override..." : "Authorize Emergency Override"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
