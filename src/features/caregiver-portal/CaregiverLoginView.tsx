"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCaregiver, CaregiverRelationship } from "./caregiver-store";
import {
  HeartHandshake,
  UserCheck,
  ShieldCheck,
  Users,
  Building,
  Heart,
  ArrowRight,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import styles from "./CaregiverLoginView.module.css";

export function CaregiverLoginView() {
  const router = useRouter();
  const {
    caregiver,
    setCaregiverRelationship,
    patients,
    activePatientId,
    switchPatient,
  } = useCaregiver();

  const [email, setEmail] = React.useState(caregiver.email || "anita@caregiver.demo");
  const [selectedRel, setSelectedRel] = React.useState<CaregiverRelationship>(caregiver.relationship);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>(activePatientId);

  const permissionLabelMap = {
    view_only: "View-only",
    observation_input: "Observation-input",
    full_proxy: "Full proxy",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCaregiverRelationship(selectedRel);
    switchPatient(selectedPatientId);
    router.push("/caregiver");
  };

  return (
    <div className={styles.loginContainer} role="region" aria-label="Caregiver Authentication and Patient Selection">
      <form className={styles.loginCard} onSubmit={handleLogin}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <HeartHandshake size={28} />
          </div>
          <h1 className={styles.title}>Caregiver Sign In</h1>
          <p className={styles.subtitle}>
            Elderly health companion portal for daily care, observations &amp; safety monitoring
          </p>
        </div>

        <div className={styles.formSection}>
          {/* Email / Caregiver ID */}
          <div className={styles.inputGroup}>
            <label htmlFor="caregiver-email" className={styles.inputLabel}>
              Caregiver Account
            </label>
            <input
              id="caregiver-email"
              type="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Relationship Declaration */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Relationship Declaration</label>
            <div className={styles.relationshipOptions} role="radiogroup" aria-label="Caregiver relationship declaration">
              <button
                type="button"
                className={clsx(
                  styles.relOptionButton,
                  selectedRel === "paid_caregiver" && styles.relOptionActive
                )}
                onClick={() => setSelectedRel("paid_caregiver")}
                role="radio"
                aria-checked={selectedRel === "paid_caregiver"}
              >
                <UserCheck size={18} />
                <span className={styles.relOptionLabel}>Paid caregiver</span>
              </button>

              <button
                type="button"
                className={clsx(
                  styles.relOptionButton,
                  selectedRel === "family_member" && styles.relOptionActive
                )}
                onClick={() => setSelectedRel("family_member")}
                role="radio"
                aria-checked={selectedRel === "family_member"}
              >
                <Heart size={18} />
                <span className={styles.relOptionLabel}>Family member</span>
              </button>

              <button
                type="button"
                className={clsx(
                  styles.relOptionButton,
                  selectedRel === "agency_staff" && styles.relOptionActive
                )}
                onClick={() => setSelectedRel("agency_staff")}
                role="radio"
                aria-checked={selectedRel === "agency_staff"}
              >
                <Building size={18} />
                <span className={styles.relOptionLabel}>Agency staff</span>
              </button>
            </div>
          </div>

          {/* Display of Caregiver's Permission Level (Determined by Patient/Guardian) */}
          <div className={styles.permissionDisplayCard}>
            <div className={styles.permissionHeader}>
              <span className={styles.permissionTitle}>
                <ShieldCheck size={16} />
                Assigned Permission Level
              </span>
              <span className={styles.permissionBadge}>
                {permissionLabelMap[caregiver.permissionLevel]}
              </span>
            </div>
            <p className={styles.permissionNote}>
              Permission is determined by guardian <strong>{caregiver.permissionDeterminedBy}</strong>.
              Grants daily routine review and voice observation input. Clinical record access is consent-governed.
            </p>
          </div>

          {/* Managed Patient Switcher Selection */}
          <div className={styles.patientSelectGroup}>
            <label htmlFor="patient-roster-select" className={styles.inputLabel}>
              Select Patient to Monitor
            </label>
            <select
              id="patient-roster-select"
              className={styles.patientSelect}
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}yo) — {p.activeConditions[0] || "Active Care Plan"}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.loginSubmitButton}>
            <span>Access Caregiver Portal</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
