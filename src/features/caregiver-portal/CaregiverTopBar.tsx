"use client";

import * as React from "react";
import {
  useCaregiver,
  CaregiverRelationship,
} from "./caregiver-store";
import {
  AlertOctagon,
  ChevronDown,
  History,
  ShieldCheck,
  UserCheck,
  HeartHandshake,
  Info,
  Check,
} from "lucide-react";
import clsx from "clsx";
import styles from "./CaregiverTopBar.module.css";

export function CaregiverTopBar() {
  const {
    caregiver,
    setCaregiverRelationship,
    patients,
    activePatientId,
    activePatient,
    activePatientCare,
    switchPatient,
    openEmergencyModal,
    openPatientStateModal,
  } = useCaregiver();

  const [isPatientMenuOpen, setIsPatientMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsPatientMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = activePatient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const permissionLabelMap = {
    view_only: "View-only",
    observation_input: "Observation-input",
    full_proxy: "Full proxy",
  };

  const digitalTwin = activePatientCare.digitalTwin;

  return (
    <div className={styles.container} role="region" aria-label="Caregiver Portal Header and Patient Selector">
      {/* Primary Top Bar */}
      <div className={styles.topRow}>
        <div className={styles.leftGroup}>
          {/* Patient Switcher */}
          <div className={styles.patientSwitcherWrapper} ref={menuRef}>
            <button
              type="button"
              className={styles.patientSelectButton}
              onClick={() => setIsPatientMenuOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isPatientMenuOpen}
              aria-label={`Current patient: ${activePatient.name}. Click to switch patient.`}
            >
              <div className={styles.patientAvatar}>{initials}</div>
              <div className={styles.patientInfo}>
                <span className={styles.patientNameLabel}>{activePatient.name}</span>
                <span className={styles.patientSubLabel}>
                  {activePatient.age}yo • {activePatient.gender} • Switch patient
                  <ChevronDown size={14} />
                </span>
              </div>
            </button>

            {isPatientMenuOpen && (
              <div className={styles.dropdownMenu} role="listbox" aria-label="Select a patient">
                <p className={styles.dropdownTitle}>Managed Patients</p>
                {patients.map((p) => {
                  const isActive = p.id === activePatientId;
                  const pInitials = p.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={clsx(styles.dropdownItem, isActive && styles.dropdownItemActive)}
                      onClick={() => {
                        switchPatient(p.id);
                        setIsPatientMenuOpen(false);
                      }}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className={styles.dropdownItemLeft}>
                        <div
                          className={styles.patientAvatar}
                          style={{
                            background: isActive ? "var(--color-primary)" : "#8295a5",
                            width: 32,
                            height: 32,
                            fontSize: 12,
                          }}
                        >
                          {pInitials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: 14 }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                            {p.age}yo • {p.activeConditions[0] || "Care Plan"}
                          </div>
                        </div>
                      </div>
                      {isActive && <Check size={16} style={{ color: "var(--color-secondary)" }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Caregiver Identity & Relationship Declaration */}
          <div className={styles.caregiverProfileBadge}>
            <div className={styles.caregiverIconWrapper} title="Caregiver Profile">
              <HeartHandshake size={18} />
            </div>
            <div className={styles.caregiverDetails}>
              <span className={styles.caregiverName}>{caregiver.name}</span>
              <div className={styles.caregiverRelGroup}>
                <span>Role:</span>
                <select
                  value={caregiver.relationship}
                  onChange={(e) => setCaregiverRelationship(e.target.value as CaregiverRelationship)}
                  className={styles.relationshipSelect}
                  aria-label="Caregiver relationship declaration"
                  title="Caregiver relationship declaration"
                >
                  <option value="paid_caregiver">Paid caregiver</option>
                  <option value="family_member">Family member</option>
                  <option value="agency_staff">Agency staff</option>
                </select>
              </div>
            </div>
          </div>

          {/* Permission Level (Determined by Patient / Guardian) */}
          <div
            className={styles.permissionBadge}
            title={`Permission level determined by ${caregiver.permissionDeterminedBy}. Caregivers cannot self-elevate permissions.`}
          >
            <UserCheck size={14} />
            <span>Scope: {permissionLabelMap[caregiver.permissionLevel]}</span>
          </div>
        </div>

        {/* Right Action Group */}
        <div className={styles.rightGroup}>
          {/* Digital Twin State Badge */}
          <button
            type="button"
            className={clsx(styles.twinButton, styles[`twin_${digitalTwin.state}`])}
            onClick={openPatientStateModal}
            aria-label={`Digital Twin State: ${digitalTwin.label}. Click for full clinical baseline comparison.`}
            title="Click to open detailed Digital Twin & baseline trend analysis"
          >
            <span className={styles.pulseDot} aria-hidden="true" />
            <span>State: {digitalTwin.label}</span>
            <Info size={14} aria-hidden="true" />
          </button>

          {/* Persistent Emergency / SOS */}
          <button
            type="button"
            className={styles.sosButton}
            onClick={openEmergencyModal}
            aria-label="Emergency SOS — Open emergency medical card and contacts"
          >
            <AlertOctagon size={18} aria-hidden="true" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* Secondary Row: Consent Banner & Audit Trail */}
      <div className={styles.secondaryRow}>
        <div className={styles.consentBanner} role="status">
          <ShieldCheck size={18} className={styles.consentIcon} aria-hidden="true" />
          <span>
            <strong>Consent Scope:</strong> Daily Care Observations & Safety Monitoring granted by{" "}
            <strong>{caregiver.permissionDeterminedBy}</strong>. Full records restricted per patient privacy policy.
          </span>
        </div>

        <div className={styles.auditBadge} title="Access transparency audit trail">
          <History size={14} className={styles.auditIcon} aria-hidden="true" />
          <span>
            Last accessed by <span className={styles.auditStrong}>Dr. Rajesh Sharma</span> · Today, 10:42 AM
          </span>
        </div>
      </div>
    </div>
  );
}
