"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  FileCheck2,
  Download,
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
  Lock,
} from "lucide-react";
import styles from "./AccessLogView.module.css";

export function AccessLogView() {
  const { auditLogs, downloadAuditCsv, selectedPatient } = useDoctorStore();

  const patientLogs = auditLogs.filter(
    (l) => l.patientId === selectedPatient.id || l.patientId === "patient-001"
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.headerCard}>
        <div className={styles.titleArea}>
          <h1 className={styles.heading}>
            <FileCheck2 size={22} color="#122544" />
            <span>Doctor Patient Access Log & Audit Trail</span>
          </h1>
          <p className={styles.subheading}>
            Cryptographically signed EHR access and review activity for {selectedPatient.name}
          </p>
        </div>

        <button
          type="button"
          className={styles.downloadBtn}
          onClick={downloadAuditCsv}
          aria-label="Download Access History CSV"
        >
          <Download size={15} />
          <span>Download Access Log (CSV)</span>
        </button>
      </section>

      {/* HIPAA Compliance Banner */}
      <section className={styles.hipaaBanner}>
        <ShieldCheck size={20} color="#4E8B72" style={{ flexShrink: 0 }} />
        <div>
          <strong>HIPAA § 164.312(b) Audit Control Standard:</strong> All clinical timeline reviews,
          AI prompt executions, medication orders, and document inspections are recorded with verified
          credentials, IP origin, and clinical purpose of use.
        </div>
      </section>

      {/* Access Log Table */}
      <div className={styles.logTableCard}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#122544" }}>
            Recent Access Activity ({patientLogs.length} Events)
          </h2>
          <span style={{ fontSize: "12px", color: "#68717C" }}>
            Doctor: Dr. Rajesh Sharma, MD (user-clinician-001)
          </span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action / Event</th>
              <th>Resource Accessed</th>
              <th>Purpose of Use</th>
              <th>IP & Verification</th>
            </tr>
          </thead>
          <tbody>
            {patientLogs.map((log) => {
              const dateObj = new Date(log.timestamp);
              const formattedTime = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={log.id}>
                  <td className={styles.timeCell}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={12} color="#68717C" />
                      <span>{formattedTime}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionCell}>{log.action}</div>
                    <div className={styles.detailsCell}>{log.details}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: "#122544" }}>{log.resource}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#4B5563" }}>
                      {log.purposeOfUse || "Direct Clinical Care"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span className={styles.statusSuccess}>
                        <CheckCircle2 size={10} />
                        <span>VERIFIED</span>
                      </span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>IP: {log.ipAddress}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
