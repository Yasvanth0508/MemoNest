"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  Camera,
  FolderOpen,
  Check,
  Edit2,
  Clock,
  Building,
  Calendar,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import styles from "./DoctorUploadView.module.css";

const DOC_TYPES = [
  "Lab Report",
  "Prescription",
  "Discharge Summary",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Clinical Note",
  "Other",
];

export function DoctorUploadView() {
  const { uploadQueue, addUploadedDocument, confirmExtractedDocument, selectedPatient } =
    useDoctorStore();

  const [selectedDocType, setSelectedDocType] = React.useState("Lab Report");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [draftDoc, setDraftDoc] = React.useState<any | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // Editable fields in review step
  const [editDate, setEditDate] = React.useState("10 Sep 2026");
  const [editProvider, setEditProvider] = React.useState("Dr. Rajesh Sharma, MD");
  const [editDiagnosis, setEditDiagnosis] = React.useState("Nocturnal Fall Follow-up / Gait Instability");
  const [editMedication, setEditMedication] = React.useState("Review of Zolpidem 5mg vs. Melatonin");
  const [editFindings, setEditFindings] = React.useState("No occult fracture; mild right knee contusion.");
  const [notificationMsg, setNotificationMsg] = React.useState<string | null>(null);

  const handleSimulateUpload = (fileName?: string) => {
    setIsProcessing(true);
    setDraftDoc(null);
    setNotificationMsg(null);

    setTimeout(() => {
      setIsProcessing(false);
      const newDraft = {
        id: `draft-${Date.now()}`,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        documentName: fileName || `Clinical_${selectedDocType.replace(/\s+/g, "_")}_10Sep2026.pdf`,
        documentType: selectedDocType,
        date: "2026-09-10",
        fileSize: "680 KB",
        extractedEntities: {
          date: editDate,
          provider: editProvider,
          diagnoses: [editDiagnosis],
          medications: [editMedication],
          keyFindings: [editFindings],
          summary: `Extracted ${selectedDocType} uploaded directly into unified health record.`,
        },
        status: "pending_review",
      };
      setDraftDoc(newDraft);
    }, 1200);
  };

  const handleConfirmAndCommit = () => {
    if (!draftDoc) return;

    addUploadedDocument({
      patientId: draftDoc.patientId,
      patientName: draftDoc.patientName,
      documentName: draftDoc.documentName,
      documentType: draftDoc.documentType,
      date: draftDoc.date,
      status: "confirmed",
      fileSize: draftDoc.fileSize,
      extractedEntities: {
        date: editDate,
        provider: editProvider,
        diagnoses: [editDiagnosis],
        medications: [editMedication],
        keyFindings: [editFindings],
        summary: draftDoc.extractedEntities.summary,
      },
    });

    setNotificationMsg(
      `✓ Successfully integrated "${draftDoc.documentName}" into ${selectedPatient.name}'s unified health record!`
    );
    setDraftDoc(null);
    setIsEditing(false);
  };

  const patientDocs = uploadQueue.filter((d) => d.patientId === selectedPatient.id);

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1 className={styles.heading}>
            <UploadCloud size={22} color="#122544" />
            <span>Doctor Uploads: Unified Health Record</span>
          </h1>
          <p className={styles.subheading}>
            Directly upload external medical documents, imaging, or prescriptions to {selectedPatient.name}'s chart
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #dde2e1",
              fontSize: "13px",
              fontWeight: 600,
              background: "#ffffff",
              color: "#122544",
            }}
            aria-label="Select Document Type"
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.uploadPrimaryBtn}
            onClick={() => handleSimulateUpload()}
            disabled={isProcessing}
          >
            <UploadCloud size={16} />
            <span>+ Upload Document</span>
          </button>
        </div>
      </section>

      {/* Success Notification Banner */}
      {notificationMsg && (
        <div
          style={{
            background: "#DEF7EC",
            border: "1px solid #BCF0DA",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#03543F",
            fontWeight: 600,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Processing Animation */}
      {isProcessing && (
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #67B8BA",
            borderRadius: "14px",
            padding: "32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Sparkles size={32} color="#67B8BA" style={{ animation: "spin 2s linear infinite" }} />
          <h3 style={{ margin: 0, fontSize: "16px", color: "#122544" }}>
            Scanning & Extracting Clinical Entities...
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#68717C" }}>
            Optical character recognition (OCR) and clinical taxonomy matching in progress
          </p>
        </div>
      )}

      {/* Extracted Information Edit & Review Step */}
      {draftDoc && (
        <section className={styles.reviewCard} aria-labelledby="extracted-info-heading">
          <div className={styles.reviewHeader}>
            <div className={styles.reviewTitle}>
              <Sparkles size={18} color="#67B8BA" />
              <h2 id="extracted-info-heading" style={{ margin: 0, fontSize: "18px" }}>
                Extracted Information Review
              </h2>
            </div>

            <div className={styles.processingBadge}>
              <CheckCircle2 size={14} color="#4E8B72" />
              <span>AI Extraction Verified • Awaiting Confirmation</span>
            </div>
          </div>

          <div className={styles.extractedGrid}>
            <div className={styles.extractItem}>
              <span className={styles.extractLabel}>Record Date</span>
              <input
                type="text"
                className={styles.extractInput}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.extractItem}>
              <span className={styles.extractLabel}>Provider / Facility</span>
              <input
                type="text"
                className={styles.extractInput}
                value={editProvider}
                onChange={(e) => setEditProvider(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.extractItem}>
              <span className={styles.extractLabel}>Extracted Diagnosis</span>
              <input
                type="text"
                className={styles.extractInput}
                value={editDiagnosis}
                onChange={(e) => setEditDiagnosis(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.extractItem}>
              <span className={styles.extractLabel}>Extracted Medication</span>
              <input
                type="text"
                className={styles.extractInput}
                value={editMedication}
                onChange={(e) => setEditMedication(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.extractItem} style={{ gridColumn: "1 / -1" }}>
              <span className={styles.extractLabel}>Key Findings & Notes</span>
              <textarea
                className={styles.extractInput}
                rows={2}
                value={editFindings}
                onChange={(e) => setEditFindings(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className={styles.reviewActions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 size={13} style={{ display: "inline", marginRight: "4px" }} />
              <span>{isEditing ? "Done Editing" : "Edit Extracted Data"}</span>
            </button>

            <button
              type="button"
              className={styles.btnConfirm}
              onClick={handleConfirmAndCommit}
            >
              <Check size={14} />
              <span>Confirm & Commit to Record</span>
            </button>
          </div>
        </section>
      )}

      {/* Drag & Drop Upload Zone */}
      {!draftDoc && !isProcessing && (
        <div
          className={styles.uploadSection}
          onClick={() => handleSimulateUpload()}
          role="button"
          tabIndex={0}
          aria-label="Upload document dropzone"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleSimulateUpload();
          }}
        >
          <div className={styles.uploadIconCircle}>
            <UploadCloud size={28} />
          </div>

          <div className={styles.uploadPromptText}>
            <p className={styles.uploadMainPrompt}>
              Drag and drop clinical files, or click to browse
            </p>
            <p className={styles.uploadSubPrompt}>
              Supports PDF, DICOM, JPEG, PNG • Automatic OCR & Entity Verification
            </p>
          </div>

          <div className={styles.actionPillsRow}>
            <span className={styles.actionPill}>
              <FolderOpen size={14} />
              <span>Browse Local Disk</span>
            </span>

            <span className={styles.actionPill}>
              <Camera size={14} />
              <span>Document Camera Capture</span>
            </span>
          </div>
        </div>
      )}

      {/* Upload History Table */}
      <section className={styles.historySection} aria-labelledby="upload-history-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 id="upload-history-heading" style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#122544" }}>
            Upload History ({patientDocs.length} Documents)
          </h2>
          <span style={{ fontSize: "12px", color: "#68717C" }}>
            Part of {selectedPatient.name}'s Unified Health Record
          </span>
        </div>

        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Date of Record</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Extracted Entities</th>
            </tr>
          </thead>
          <tbody>
            {patientDocs.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div className={styles.docTitleCell}>
                    <FileText size={15} color="#67B8BA" />
                    <span>{doc.documentName}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: "#122544" }}>{doc.documentType}</span>
                </td>
                <td>{doc.date}</td>
                <td style={{ color: "#68717C" }}>{doc.uploadDate}</td>
                <td>
                  <span className={styles.statusConfirmed}>
                    <CheckCircle2 size={12} />
                    <span>Confirmed</span>
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: "12px", color: "#4B5563" }}>
                    {doc.extractedEntities.diagnoses.join(", ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
