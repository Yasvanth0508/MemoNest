"use client";

import * as React from "react";
import { Database, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import styles from "./LongitudinalSummary.module.css";

export function LongitudinalSummary() {
  const milestones = [
    { year: 2014, label: "Hypertension" },
    { year: 2016, label: "Diabetes" },
    { year: 2018, label: "Stroke" },
    { year: 2021, label: "Amlodipine" },
    { year: 2022, label: "Osteoarthritis" },
    { year: 2024, label: "MCI" },
    { year: 2026, label: "Falls" },
  ];

  return (
    <div className={styles.summaryBanner}>
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBadge}>
            <Database size={20} />
          </div>
          <div>
            <h2 className={styles.title}>Health Memory</h2>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge variant="success">Verified</Badge>
          <Badge variant="secondary">7 Domains</Badge>
        </div>
      </div>

      <div className={styles.timelineTrack}>
        {milestones.map((m, idx) => (
          <div key={idx} className={styles.milestone}>
            <span className={styles.milestoneYear}>{m.year}</span>
            <div className={styles.milestoneDot} />
            <span className={styles.milestoneText}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
