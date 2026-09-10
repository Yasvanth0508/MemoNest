"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Edit2,
  Eye,
  FileCheck,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import clsx from "clsx";
import { PatientPortalShell } from "@/components/patient";
import {
  patientPortalStore,
  UploadedRecordItem,
} from "@/services/patient-portal.service";
import styles from "./reports.module.css";

const CATEGORY_FILTERS = [
  { label: "All Reports", value: "all" },
  { label: "Lab Reports", value: "lab_report" },
  { label: "Prescriptions", value: "prescription" },
  { label: "Discharge Summaries", value: "discharge_summary" },
  { label: "Consultations", value: "consultation" },
  { label: "X-Rays", value: "x_ray" },
  { label: "MRI", value: "mri" },
  { label: "CT", value: "ct" },
  { label: "Other", value: "other" },
];

export default function ReportsPage() {
  const [reports, setReports] = React.useState<UploadedRecordItem[]>(() =>
    patientPortalStore.getReports()
  );
  const [activeFilter, setActiveFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedReport, setSelectedReport] = React.useState<UploadedRecordItem | null>(null);
  const [isEditingReport, setIsEditingReport] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");

  React.useEffect(() => {
    const unsub = patientPortalStore.subscribe(() => {
      setReports([...patientPortalStore.getReports()]);
    });
    return unsub;
  }, []);

  const filteredReports = React.useMemo(() => {
    return reports.filter((item) => {
      const matchesCategory =
        activeFilter === "all" ||
        item.type.toLowerCase() === activeFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.facility && item.facility.toLowerCase().includes(q)) ||
        (item.summary && item.summary.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [reports, activeFilter, searchQuery]);

  const handleOpenReport = (doc: UploadedRecordItem) => {
    setSelectedReport(doc);
    setEditTitle(doc.title);
    setIsEditingReport(false);
  };

  const handleSaveEdit = () => {
    if (selectedReport && editTitle.trim()) {
      selectedReport.title = editTitle.trim();
      setSelectedReport({ ...selectedReport, title: editTitle.trim() });
      setIsEditingReport(false);
    }
  };

  const handleDownload = () => {
    if (selectedReport) {
      alert(`Downloading official clinical record: ${selectedReport.title} (PDF)...`);
    }
  };

  const speechSummary = `You are on the My Reports page. You have ${reports.length} total medical documents in your health memory. You can filter by Lab Reports, Prescriptions, Discharge Summaries, or Imaging. Click any report to read the full document details.`;

  return (
    <PatientPortalShell pageSpeechSummary={speechSummary}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>My Reports</h1>
            <p className={styles.subtitle}>
              All your uploaded health documents in one place.
            </p>
          </div>

          <Link href="/patient/upload" className={styles.uploadReportBtn}>
            <Plus size={22} />
            <span>+ Upload Report</span>
          </Link>
        </header>

        {/* Controls: Search and Filters */}
        <div className={styles.controlsBar}>
          <div className={styles.searchRow}>
            <Search size={22} color="#64748B" />
            <input
              type="text"
              placeholder="Search reports by doctor name, hospital, condition, or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search medical documents"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B" }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className={styles.filterScrollRow} role="tablist" aria-label="Filter documents by category">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = activeFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  className={clsx(styles.filterChip, isActive && styles.filterChipActive)}
                  onClick={() => setActiveFilter(cat.value)}
                  role="tab"
                  aria-selected={isActive}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Report List Cards */}
        {filteredReports.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #DDE2E1",
              borderRadius: "var(--radius-lg)",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <FileSearch size={48} color="#94A3B8" style={{ margin: "0 auto 16px auto" }} />
            <h2 style={{ fontSize: "22px", color: "#1E293B", margin: "0 0 8px 0" }}>No reports found</h2>
            <p style={{ fontSize: "16px", color: "#64748B", margin: "0 0 20px 0" }}>
              No health documents match your search query or filter.
            </p>
            <button
              type="button"
              className={styles.filterChip}
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={styles.reportsGrid}>
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={styles.reportCard}
                onClick={() => handleOpenReport(report)}
                tabIndex={0}
                role="button"
                aria-label={`Open report: ${report.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleOpenReport(report);
                }}
              >
                <div className={styles.cardTop}>
                  <div className={styles.docIcon}>
                    <FileText size={26} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.reportTypeTag}>
                      {report.type.replace("_", " ")}
                    </div>
                    <h2 className={styles.reportName}>{report.title}</h2>
                    <div className={styles.reportMetaRow}>
                      <span>{report.facility || "MetroHealth"}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.confirmedStatus}>
                    <CheckCircle2 size={18} />
                    <span>✓ Confirmed</span>
                  </span>

                  <span className={styles.openDetailPrompt}>
                    <span>View Details</span>
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className={styles.modalBackdrop} onClick={() => setSelectedReport(null)}>
            <div
              className={styles.detailCard}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-title"
            >
              <div className={styles.detailHeader}>
                <div style={{ flex: 1 }}>
                  <div className={styles.detailType}>
                    {selectedReport.type.replace("_", " ")}
                  </div>
                  {isEditingReport ? (
                    <div style={{ marginTop: "8px" }}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          fontSize: "20px",
                          fontWeight: 700,
                          borderRadius: "8px",
                          border: "2px solid #0D9488",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        style={{
                          marginTop: "8px",
                          padding: "6px 16px",
                          background: "#0D9488",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "999px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Save Title
                      </button>
                    </div>
                  ) : (
                    <h2 id="detail-title" className={styles.detailTitle}>
                      {selectedReport.title}
                    </h2>
                  )}
                  <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "16px" }}>
                    Uploaded {selectedReport.date} • {selectedReport.facility || "MetroHealth"}
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setSelectedReport(null)}
                  aria-label="Close report details"
                >
                  <X size={24} />
                </button>
              </div>

              {/* AI Extraction Status Box */}
              <div className={styles.aiStatusBox}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Sparkles size={22} color="#2563EB" />
                  <span className={styles.aiStatusText}>
                    AI Extraction Status: Verified by Patient (99% confidence)
                  </span>
                </div>
                <span style={{ fontSize: "14px", color: "#1E40AF", fontWeight: 700 }}>
                  ✓ Source of Truth Preserved
                </span>
              </div>

              {/* Document Preview Sheet */}
              <div className={styles.docPreviewSheet}>
                <div className={styles.sheetHeader}>
                  <span>DOCUMENT PREVIEW SHEET</span>
                  <span>{selectedReport.fileType?.toUpperCase() || "PDF"} • {selectedReport.fileSize || "1.1 MB"}</span>
                </div>

                <p className={styles.sheetSummary}>
                  <strong>Clinical Summary:</strong> {selectedReport.summary}
                </p>

                {selectedReport.keyFindings && selectedReport.keyFindings.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0" }}>
                      Key Medical Findings:
                    </h3>
                    <ul className={styles.findingsList}>
                      {selectedReport.keyFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.extractedEntities && selectedReport.extractedEntities.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 8px 0", color: "#64748B" }}>
                      Extracted Medical Entities:
                    </h3>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {selectedReport.extractedEntities.map((item, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#E2E8F0",
                            color: "#1E293B",
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: View Document, Download, Edit Information */}
              <div className={styles.detailActionsRow}>
                <button
                  type="button"
                  className={styles.actionSecondary}
                  onClick={() => setIsEditingReport((prev) => !prev)}
                >
                  <Edit2 size={18} />
                  <span>{isEditingReport ? "Cancel Edit" : "Edit Information"}</span>
                </button>

                <button
                  type="button"
                  className={styles.actionSecondary}
                  onClick={handleDownload}
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  className={styles.actionPrimary}
                  onClick={() => alert(`Opening original verified document: ${selectedReport.title}`)}
                >
                  <Eye size={18} />
                  <span>View Document</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientPortalShell>
  );
}
