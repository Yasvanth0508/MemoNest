"use client";

import * as React from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Lock,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { PatientPortalShell } from "@/components/patient";
import {
  patientPortalStore,
  AccessRequest,
} from "@/services/patient-portal.service";
import { ConsentRecord } from "@/types";
import styles from "./consent.module.css";

const AVAILABLE_CATEGORIES = [
  { id: "medical_reports", label: "Medical Reports & Lab Tests" },
  { id: "medications", label: "Medication Lists & Schedules" },
  { id: "diagnoses", label: "Diagnoses & Health Conditions" },
  { id: "caregiver_notes", label: "Daily Caregiver Observations" },
  { id: "emergency_only", label: "Emergency & Allergy Details Only" },
];

export default function ConsentSharingPage() {
  const [consentRecords, setConsentRecords] = React.useState<ConsentRecord[]>(() =>
    patientPortalStore.getConsentRecords()
  );
  const [accessRequests, setAccessRequests] = React.useState<AccessRequest[]>(() =>
    patientPortalStore.getAccessRequests()
  );

  const [feedbackNotice, setFeedbackNotice] = React.useState<string | null>(null);

  // Modal State for Granting New Access
  const [isGrantModalOpen, setIsGrantModalOpen] = React.useState(false);
  const [newPersonName, setNewPersonName] = React.useState("");
  const [newPersonRole, setNewPersonRole] = React.useState<"doctor" | "caregiver" | "guardian">("doctor");
  const [newPersonOrg, setNewPersonOrg] = React.useState("");
  const [selectedCats, setSelectedCats] = React.useState<string[]>([
    "medical_reports",
    "medications",
  ]);
  const [newDuration, setNewDuration] = React.useState<number>(30);

  React.useEffect(() => {
    patientPortalStore.initFromApi().then(() => {
      setConsentRecords([...patientPortalStore.getConsentRecords()]);
      setAccessRequests([...patientPortalStore.getAccessRequests()]);
    });
    const unsub = patientPortalStore.subscribe(() => {
      setConsentRecords([...patientPortalStore.getConsentRecords()]);
      setAccessRequests([...patientPortalStore.getAccessRequests()]);
    });
    return unsub;
  }, []);

  const handleApprove = (id: string, name: string) => {
    patientPortalStore.approveAccessRequest(id);
    setFeedbackNotice(`Access approved for ${name} for 30 days. You can revoke this anytime.`);
    setTimeout(() => setFeedbackNotice(null), 6000);
  };

  const handleDeny = (id: string, name: string) => {
    patientPortalStore.denyAccessRequest(id);
    setFeedbackNotice(`Access request from ${name} was denied. Your information remains private.`);
    setTimeout(() => setFeedbackNotice(null), 6000);
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Are you sure you want to stop sharing health information with ${name}?`)) {
      patientPortalStore.revokeConsent(id);
      setFeedbackNotice(`Access revoked for ${name}.`);
      setTimeout(() => setFeedbackNotice(null), 5000);
    }
  };

  const handleCreateGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    patientPortalStore.grantNewConsent(
      newPersonName.trim(),
      newPersonRole,
      newPersonOrg.trim() || "Independent Healthcare Provider",
      selectedCats,
      newDuration
    );

    setFeedbackNotice(`Health records now shared with ${newPersonName}.`);
    setIsGrantModalOpen(false);
    setNewPersonName("");
    setNewPersonOrg("");
    setTimeout(() => setFeedbackNotice(null), 6000);
  };

  const toggleCategory = (catId: string) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter((c) => c !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  const activePendingRequests = accessRequests.filter((r) => r.status === "pending");

  const speechSummary = `You are on the Consent and Data Sharing page. The title is Who Can Access My Health Information. You currently share your health records with Dr. Rajesh Sharma and caregiver Anita Desai. There is also one pending access request from Dr. Priya Sharma for follow-up review.`;

  return (
    <PatientPortalShell pageSpeechSummary={speechSummary}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Who Can Access My Health Information?</h1>
            <p className={styles.subtitle}>
              You have complete control over who sees your health memories, reports, and medication lists.
            </p>
          </div>

          <button
            type="button"
            className={styles.grantNewBtn}
            onClick={() => setIsGrantModalOpen(true)}
          >
            <Plus size={22} />
            <span>+ Share With Someone New</span>
          </button>
        </header>

        {feedbackNotice && (
          <div
            style={{
              background: "#ECFDF5",
              border: "1.5px solid #6EE7B7",
              color: "#065F46",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              fontSize: "16px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            role="alert"
          >
            <CheckCircle2 size={22} />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* Section 1: Access Requests */}
        {activePendingRequests.length > 0 && (
          <section className={styles.requestsSection} aria-labelledby="requests-heading">
            <div className={styles.requestsHeader}>
              <h2 id="requests-heading" className={styles.requestsTitle}>
                Access Requests Waiting for Your Approval
              </h2>
              <span className={styles.requestBadge}>
                {activePendingRequests.length} New Request
              </span>
            </div>

            {activePendingRequests.map((req) => (
              <div key={req.id} className={styles.requestCard}>
                <div style={{ flex: 1 }}>
                  <h3 className={styles.requesterName}>{req.requesterName}</h3>
                  <div className={styles.requesterOrg}>
                    {req.requesterRole} • {req.requesterOrg}
                  </div>

                  <p className={styles.requestDetails}>
                    <strong>Reason:</strong> &ldquo;{req.reason}&rdquo;
                  </p>

                  <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 700, color: "#64748B" }}>
                    REQUESTED INFORMATION:
                  </div>
                  <div className={styles.categoryTagList}>
                    {req.requestedCategories.map((c, i) => (
                      <span key={i} className={styles.categoryTag}>
                        {c}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: "12px", fontSize: "14px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={16} />
                    <span>Requested duration: {req.durationDays} days (Expires automatically)</span>
                  </div>
                </div>

                <div className={styles.requestActions}>
                  <button
                    type="button"
                    className={styles.approveBtn}
                    onClick={() => handleApprove(req.id, req.requesterName)}
                    aria-label={`Approve access request from ${req.requesterName}`}
                  >
                    <Check size={18} />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    className={styles.denyBtn}
                    onClick={() => handleDeny(req.id, req.requesterName)}
                    aria-label={`Deny access request from ${req.requesterName}`}
                  >
                    <X size={18} />
                    <span>Deny</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Section 2: Active Access List */}
        <section className={styles.activeSharingSection} aria-labelledby="active-sharing-heading">
          <h2 id="active-sharing-heading" className={styles.sectionTitle}>
            People Who Currently Have Access ({consentRecords.length})
          </h2>

          <div className={styles.grantsGrid}>
            {consentRecords.map((grant) => {
              const RoleIcon =
                grant.granteeRole === "doctor"
                  ? Stethoscope
                  : grant.granteeRole === "caregiver"
                  ? HeartHandshake
                  : UserCheck;

              return (
                <div key={grant.id} className={styles.grantCard}>
                  <div>
                    <div className={styles.grantCardHeader}>
                      <div>
                        <h3 className={styles.granteeName}>{grant.granteeName}</h3>
                        <div className={styles.granteeRole}>
                          {grant.granteeRole === "doctor"
                            ? "Primary Physician"
                            : grant.granteeRole === "caregiver"
                            ? "Connected Home Caregiver"
                            : "Family Guardian & Healthcare Proxy"}
                        </div>
                        <div className={styles.granteeOrg}>{grant.organization}</div>
                      </div>

                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "#EAF5F4",
                          color: "#0D9488",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <RoleIcon size={22} />
                      </div>
                    </div>

                    <div className={styles.grantCardBody} style={{ marginTop: "16px" }}>
                      <div className={styles.canAccessLabel}>Can Access:</div>
                      <div className={styles.categoryTagList}>
                        {grant.grantedPermissions.map((perm, idx) => (
                          <span key={idx} className={styles.categoryTag}>
                            {perm.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>

                      <div className={styles.expiryRow} style={{ marginTop: "12px" }}>
                        <Calendar size={16} color="#0D9488" />
                        <span>
                          Access expires:{" "}
                          <strong>
                            {grant.validUntil && grant.validUntil.includes("2099")
                              ? "Permanent (Family Guardian)"
                              : grant.validUntil
                              ? new Date(grant.validUntil).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Active (Continuous)"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.grantCardFooter}>
                    <button
                      type="button"
                      className={styles.manageAccessBtn}
                      onClick={() => alert(`Managing permissions for ${grant.granteeName}.`)}
                    >
                      Manage Access
                    </button>

                    <button
                      type="button"
                      className={styles.revokeBtn}
                      onClick={() => handleRevoke(grant.id, grant.granteeName)}
                      aria-label={`Revoke access for ${grant.granteeName}`}
                    >
                      Revoke Access
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Modal: Grant New Access Wizard */}
        {isGrantModalOpen && (
          <div className={styles.modalBackdrop} onClick={() => setIsGrantModalOpen(false)}>
            <div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="grant-modal-title"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 id="grant-modal-title" style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "#122544" }}>
                  Share Your Health Information
                </h2>
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B" }}
                  onClick={() => setIsGrantModalOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.5, marginBottom: "20px" }}>
                Select who you want to share with and which categories of your records they can see. You can cancel this anytime.
              </p>

              <form onSubmit={handleCreateGrant}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
                    Full Name of Doctor, Caregiver, or Family Member
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. Arun Kumar"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "16px", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
                    Their Role
                  </label>
                  <select
                    value={newPersonRole}
                    onChange={(e) => setNewPersonRole(e.target.value as any)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "16px", boxSizing: "border-box" }}
                  >
                    <option value="doctor">Medical Doctor / Specialist</option>
                    <option value="caregiver">Home Caregiver / Nurse</option>
                    <option value="guardian">Family Guardian / Proxy</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
                    Hospital or Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Apollo Hospitals or Senior Care"
                    value={newPersonOrg}
                    onChange={(e) => setNewPersonOrg(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "16px", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>
                    What Can They Access?
                  </label>
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const isChecked = selectedCats.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        className={styles.categoryCheckboxRow}
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ width: "20px", height: "20px", accentColor: "#0D9488" }}
                        />
                        <span>{cat.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
                    Access Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value, 10))}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "16px", boxSizing: "border-box" }}
                  >
                    <option value={7}>7 Days (Temporary Consult)</option>
                    <option value={30}>30 Days (Standard Care Period)</option>
                    <option value={365}>1 Year (Annual Physician Care)</option>
                    <option value={-1}>Permanent Until Revoked</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button
                    type="button"
                    style={{ background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "999px", padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}
                    onClick={() => setIsGrantModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: "#0D9488", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "12px 24px", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}
                  >
                    Grant Access
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
