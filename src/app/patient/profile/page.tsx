"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Edit,
  FileCheck,
  FileText,
  Heart,
  Pill,
  Shield,
  ShieldAlert,
  Stethoscope,
  User,
  Users,
  X,
} from "lucide-react";
import { PatientPortalShell } from "@/components/patient";
import {
  patientPortalStore,
  ProfileChangeRequest,
} from "@/services/patient-portal.service";
import styles from "./profile.module.css";

interface RequestModalState {
  isOpen: boolean;
  field: string;
  currentValue: string;
}

export default function MyProfilePage() {
  const [patient, setPatient] = React.useState(() => patientPortalStore.getPatient());
  const [changeRequests, setChangeRequests] = React.useState(() =>
    patientPortalStore.getChangeRequests()
  );

  // Controlled change request modal
  const [modalState, setModalState] = React.useState<RequestModalState>({
    isOpen: false,
    field: "",
    currentValue: "",
  });
  const [requestedValue, setRequestedValue] = React.useState("");
  const [requestReason, setRequestReason] = React.useState("");
  const [submittedNotice, setSubmittedNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    patientPortalStore.initFromApi().then(() => {
      setPatient({ ...patientPortalStore.getPatient() });
      setChangeRequests([...patientPortalStore.getChangeRequests()]);
    });
    const unsub = patientPortalStore.subscribe(() => {
      setPatient({ ...patientPortalStore.getPatient() });
      setChangeRequests([...patientPortalStore.getChangeRequests()]);
    });
    return unsub;
  }, []);

  const openChangeRequest = (field: string, currentValue: string) => {
    setModalState({
      isOpen: true,
      field,
      currentValue,
    });
    setRequestedValue("");
    setRequestReason("");
  };

  const handleSubmitChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim()) return;

    patientPortalStore.submitChangeRequest(
      modalState.field,
      modalState.currentValue,
      requestedValue.trim(),
      requestReason.trim() || "Requested by patient for medical record update"
    );

    setSubmittedNotice(`Change request for ${modalState.field} has been submitted for doctor verification.`);
    setModalState({ isOpen: false, field: "", currentValue: "" });

    setTimeout(() => {
      setSubmittedNotice(null);
    }, 6000);
  };

  const speechSummary = `You are viewing your health profile for ${patient.name}. Your primary physician is Dr. Rajesh Sharma, and your emergency contact is your daughter Priya Kumar. Critical clinical items like blood type B-positive and your Penicillin allergy are protected and require a doctor verification request to modify.`;

  return (
    <PatientPortalShell pageSpeechSummary={speechSummary}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>
              Your verified personal information, emergency contacts, care team, and health identifiers.
            </p>
          </div>
          <div className={styles.iconBox} aria-hidden="true">
            <User size={28} />
          </div>
        </header>

        {submittedNotice && (
          <div className={styles.successNotice} role="alert">
            <CheckCircle2 size={22} />
            <span>{submittedNotice}</span>
          </div>
        )}

        <div className={styles.cardsGrid}>
          {/* Card 1: Personal Information */}
          <section className={styles.card} aria-labelledby="personal-info-heading">
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <User size={22} />
              </div>
              <h2 id="personal-info-heading" className={styles.cardTitle}>
                Personal Information
              </h2>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Full Legal Name</span>
                <span className={styles.infoValue}>{patient.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Date of Birth</span>
                <span className={styles.infoValue}>{patient.dateOfBirth} (Age {patient.age})</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone Number</span>
                <span className={styles.infoValue}>{patient.phone || "+1-555-0142"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Residential Address</span>
                <span className={styles.infoValue}>{patient.address || "742 Evergreen Terrace, Springfield"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Preferred Language</span>
                <span className={styles.infoValue}>{patient.preferredLanguage || "English"}</span>
              </div>
            </div>
          </section>

          {/* Card 2: Emergency & Critical Directives */}
          <section className={styles.card} aria-labelledby="emergency-info-heading">
            <div className={styles.cardHeader}>
              <div className={`${styles.iconBox} ${styles.iconBoxEmergency}`}>
                <ShieldAlert size={22} />
              </div>
              <h2 id="emergency-info-heading" className={styles.cardTitle}>
                Emergency Information
              </h2>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Primary Emergency Contact</span>
                <div style={{ textAlign: "right" }}>
                  <span className={styles.infoValue}>{patient.emergencyContact?.name || "Priya Kumar"}</span>
                  <div style={{ fontSize: "14px", color: "#64748B" }}>
                    {patient.emergencyContact?.relationship || "Daughter"} • {patient.emergencyContact?.phone || "+1-555-0192"}
                  </div>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Legal Healthcare Guardian</span>
                <span className={styles.infoValue}>Priya Kumar (Full Power of Attorney)</span>
              </div>

              {/* Blood Type with Controlled Request Change */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Blood Type</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={styles.criticalTag}>{patient.bloodType || "B+"}</span>
                  <button
                    type="button"
                    className={styles.requestChangeBtn}
                    onClick={() => openChangeRequest("Blood Type", patient.bloodType || "B+")}
                    aria-label="Request change to blood type"
                  >
                    Request Change
                  </button>
                </div>
              </div>

              {/* Severe Allergies with Controlled Request Change */}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Known Allergies</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span className={styles.criticalTag}>Penicillin, Sulfa drugs</span>
                  <button
                    type="button"
                    className={styles.requestChangeBtn}
                    onClick={() => openChangeRequest("Allergies", "Penicillin, Sulfa drugs")}
                    aria-label="Request change to allergies"
                  >
                    Request Change
                  </button>
                </div>
              </div>

              {/* DNR Order */}
              <div className={styles.dnrBox}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Do Not Resuscitate (DNR) Order on File:</strong>
                  <div>Valid order certified at MetroHealth registry (ID #88412).</div>
                  <button
                    type="button"
                    className={styles.requestChangeBtn}
                    style={{ marginTop: "8px" }}
                    onClick={() => openChangeRequest("DNR / Advance Directive", "DNR Order on file")}
                  >
                    Request Change to Directives
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Care Team */}
          <section className={styles.card} aria-labelledby="care-team-heading">
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <Stethoscope size={22} />
              </div>
              <h2 id="care-team-heading" className={styles.cardTitle}>
                Connected Care Team
              </h2>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Primary Physician</span>
                <div style={{ textAlign: "right" }}>
                  <span className={styles.infoValue}>{patient.primaryDoctor || "Dr. Rajesh Sharma, MD"}</span>
                  <div style={{ fontSize: "14px", color: "#64748B" }}>Geriatric Medicine • MetroHealth</div>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Designated Pharmacy</span>
                <div style={{ textAlign: "right" }}>
                  <span className={styles.infoValue}>Walgreens Pharmacy #4102</span>
                  <div style={{ fontSize: "14px", color: "#64748B" }}>Oak St, Springfield • Phone: +1-555-0811</div>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Home Caregiver</span>
                <div style={{ textAlign: "right" }}>
                  <span className={styles.infoValue}>Anita Desai</span>
                  <div style={{ fontSize: "14px", color: "#64748B" }}>Grace Senior Home Care (Daily visits)</div>
                </div>
              </div>
            </div>
          </section>

          {/* Card 4: Insurance & Identification */}
          <section className={styles.card} aria-labelledby="insurance-heading">
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <FileCheck size={22} />
              </div>
              <h2 id="insurance-heading" className={styles.cardTitle}>
                Insurance & Official ID
              </h2>
            </div>

            <div className={styles.infoList}>
              <div className={styles.docRow}>
                <div className={styles.docLeft}>
                  <Shield size={22} color="#0D9488" />
                  <div>
                    <h3 className={styles.docTitle}>Medicare Part A & B</h3>
                    <p className={styles.docMeta}>Member ID: ••••-4912-A • Verified Active</p>
                  </div>
                </div>
                <Link href="/patient/reports" className={styles.docViewBtn}>
                  View Card
                </Link>
              </div>

              <div className={styles.docRow}>
                <div className={styles.docLeft}>
                  <Building size={22} color="#2563EB" />
                  <div>
                    <h3 className={styles.docTitle}>Blue Cross Senior Advantage</h3>
                    <p className={styles.docMeta}>Group #BC-8831920 • Secondary Coverage</p>
                  </div>
                </div>
                <Link href="/patient/reports" className={styles.docViewBtn}>
                  View Card
                </Link>
              </div>

              <div className={styles.docRow}>
                <div className={styles.docLeft}>
                  <FileText size={22} color="#475569" />
                  <div>
                    <h3 className={styles.docTitle}>State Photo Identification</h3>
                    <p className={styles.docMeta}>Driver License / Senior ID on File</p>
                  </div>
                </div>
                <Link href="/patient/reports" className={styles.docViewBtn}>
                  View Document
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Audit / Change Requests Log */}
        {changeRequests.length > 0 && (
          <section className={`${styles.card} ${styles.cardFullWidth}`} aria-labelledby="change-history-heading">
            <h2 id="change-history-heading" className={styles.cardTitle}>
              Medical Information Change Requests
            </h2>
            <div className={styles.infoList}>
              {changeRequests.map((req) => (
                <div key={req.id} className={styles.infoRow}>
                  <div>
                    <strong>{req.field}</strong>: Current &quot;{req.currentValue}&quot; → Requested &quot;{req.requestedValue}&quot;
                    <div style={{ fontSize: "14px", color: "#64748B" }}>Submitted on {req.dateSubmitted} • Reason: {req.reason}</div>
                  </div>
                  <div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 700,
                        background: req.status === "approved" ? "#DCFCE7" : "#FEF3C7",
                        color: req.status === "approved" ? "#166534" : "#92400E",
                      }}
                    >
                      {req.status === "approved" ? "✓ Verified & Approved" : "Under Physician Review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Controlled Edit / Request Change Modal */}
        {modalState.isOpen && (
          <div className={styles.modalBackdrop} onClick={() => setModalState({ isOpen: false, field: "", currentValue: "" })}>
            <div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="change-modal-title"
            >
              <div className={styles.modalHeader}>
                <h2 id="change-modal-title" className={styles.modalTitle}>
                  Request Change: {modalState.field}
                </h2>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setModalState({ isOpen: false, field: "", currentValue: "" })}
                  aria-label="Close modal"
                >
                  <X size={22} />
                </button>
              </div>

              <p className={styles.modalIntro}>
                To protect patient safety, changes to critical medical information (such as blood type, severe allergies, or advance directives) require clinical verification by your physician before updating your permanent health record.
              </p>

              <form onSubmit={handleSubmitChangeRequest}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current Record Value</label>
                  <input
                    type="text"
                    disabled
                    value={modalState.currentValue}
                    className={styles.formInput}
                    style={{ background: "#F1F5F9", color: "#475569" }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Requested New Value <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter requested ${modalState.field.toLowerCase()}`}
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    className={styles.formInput}
                    autoFocus
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Reason or Supporting Document Details</label>
                  <textarea
                    placeholder="e.g., Recent lab test confirmed by hospital, or updated directive signed with attorney..."
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setModalState({ isOpen: false, field: "", currentValue: "" })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Submit Verification Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PatientPortalShell>
  );
}
