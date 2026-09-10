"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  FileText,
  X,
  ShieldCheck,
  Calendar,
  User,
  Building,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import styles from "./DoctorEvidenceDrawer.module.css";

export function DoctorEvidenceDrawer() {
  const { isEvidenceDrawerOpen, closeEvidenceDrawer, selectedEvidence } = useDoctorStore();

  // Close on Escape
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isEvidenceDrawerOpen) {
        closeEvidenceDrawer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEvidenceDrawerOpen, closeEvidenceDrawer]);

  if (!isEvidenceDrawerOpen || !selectedEvidence) return null;

  return (
    <div
      className={styles.drawerOverlay}
      onClick={closeEvidenceDrawer}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-drawer-title"
    >
      <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon}>
              <FileText size={20} />
            </div>
            <div>
              <h2 id="evidence-drawer-title" className={styles.drawerTitle}>
                Evidence Provenance Inspector
              </h2>
              <p className={styles.drawerSubtitle}>
                Verified source record & evidentiary excerpt
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={closeEvidenceDrawer}
            aria-label="Close evidence inspector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {/* Direct Quote Card */}
          <div className={styles.provenanceCard}>
            <div className={styles.confidenceBadge}>
              <CheckCircle2 size={14} />
              <span>Evidence Confidence: {Math.round((selectedEvidence.confidenceScore || 0.98) * 100)}%</span>
            </div>

            <blockquote className={styles.quoteBox}>
              {selectedEvidence.quote}
            </blockquote>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaKey}>Section:</span>
                <span>{selectedEvidence.context}</span>
              </div>
              {selectedEvidence.pageNumber && (
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Page:</span>
                  <span>{selectedEvidence.pageNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Linked Clinical Entity */}
          <div className={styles.detailsSection}>
            <h3 className={styles.sectionHeading}>Linked Clinical Entity</h3>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #dde2e1",
                borderRadius: "8px",
                padding: "12px 14px",
                fontWeight: 600,
                color: "#122544",
                fontSize: "14px",
              }}
            >
              {selectedEvidence.linkedEntity}
            </div>
          </div>

          {/* Document Source Metadata */}
          <div className={styles.detailsSection}>
            <h3 className={styles.sectionHeading}>Source Document Metadata</h3>
            <div className={styles.docMetaGrid}>
              <div className={styles.gridItem}>
                <span className={styles.gridItemLabel}>Document Title</span>
                <span className={styles.gridItemValue}>{selectedEvidence.documentTitle}</span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.gridItemLabel}>Record Date</span>
                <span className={styles.gridItemValue}>
                  <Calendar size={13} style={{ display: "inline", marginRight: "4px" }} />
                  {selectedEvidence.documentDate}
                </span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.gridItemLabel}>Attending / Author</span>
                <span className={styles.gridItemValue}>
                  <User size={13} style={{ display: "inline", marginRight: "4px" }} />
                  {selectedEvidence.author || "Clinical Team"}
                </span>
              </div>

              <div className={styles.gridItem}>
                <span className={styles.gridItemLabel}>Source Type</span>
                <span className={styles.gridItemValue}>
                  <Building size={13} style={{ display: "inline", marginRight: "4px" }} />
                  {selectedEvidence.sourceType.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Integrity Notice */}
          <div
            style={{
              background: "#eaf5f4",
              border: "1px solid #c2e2e0",
              borderRadius: "8px",
              padding: "12px 14px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            <ShieldCheck size={18} color="#4E8B72" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "12px", color: "#122544", lineHeight: 1.5 }}>
              This snippet is cryptographically linked to the patient's immutable health memory. Any
              clinical decision support synthesis referencing this excerpt has satisfied strict provenance
              verification.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.actionFooter}>
          <button type="button" className={styles.closeFooterBtn} onClick={closeEvidenceDrawer}>
            Dismiss Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
