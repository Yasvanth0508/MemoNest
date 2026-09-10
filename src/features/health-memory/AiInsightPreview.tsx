"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, FileSearch, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import styles from "./AiInsightPreview.module.css";

export interface AiInsightPreviewProps {
  onViewEvidence?: (evidenceId?: string) => void;
}

export function AiInsightPreview({ onViewEvidence }: AiInsightPreviewProps) {
  return (
    <div className={styles.alertCard}>
      <div className={styles.topRow}>
        <div className={styles.badgesGroup}>
          <Badge variant="danger">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ShieldAlert size={12} />
              CRITICAL
            </span>
          </Badge>
          <Badge variant="outline">Falls</Badge>
        </div>

        <div className={styles.confidenceBadge}>
          <Sparkles size={13} />
          <span>98%</span>
        </div>
      </div>

      <div className={styles.titleGroup}>
        <AlertTriangle size={20} className={styles.alertIcon} />
        <div>
          <h3 className={styles.title}>Fall Risk</h3>
          <p className={styles.description} style={{ marginTop: 4 }}>
            2 falls in 24h correlated with Zolpidem 5mg.
          </p>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)", fontWeight: 600 }}>
          Recommendation: Reassess Zolpidem 5mg.
        </div>

        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewEvidence && onViewEvidence("ev-caregiver-fall-02")}
            style={{ background: "#ffffff" }}
          >
            <FileSearch size={15} />
            <span>Evidence</span>
          </Button>

          <Button variant="danger" size="sm" asChild>
            <Link href="/patient/risks">
              <span>Risks</span>
              <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
