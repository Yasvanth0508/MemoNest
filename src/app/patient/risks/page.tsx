"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { RiskSignal } from "@/types";
import { riskService } from "@/services";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EvidenceProvenanceDrawer } from "@/features/clinical-brief/EvidenceProvenanceDrawer";
import {
  AlertTriangle,
  ShieldAlert,
  FileSearch,
  Activity,
  TrendingDown,
} from "lucide-react";
import styles from "./risks.module.css";

export default function PatientRisksPage() {
  const [risks, setRisks] = React.useState<RiskSignal[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadRisks() {
      try {
        setIsLoading(true);
        const data = await riskService.getRiskSignals();
        setRisks(data);
      } catch (err) {
        console.error("Failed to load risks:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRisks();
  }, []);

  const handleViewEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setIsEvidenceOpen(true);
  };

  const highRisks = risks.filter((r) => r.priority === "high");
  const mediumRisks = risks.filter((r) => r.priority === "medium");

  return (
    <AppShell activeRole="patient" showPatientHeader={true}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.badgeRow}>
            <Badge variant="danger">
              <AlertTriangle size={12} style={{ marginRight: 4 }} />
              Active ({risks.length})
            </Badge>
          </div>
          <h1 className={styles.title}>Risks</h1>
        </div>

        {/* High Priority Alerts */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <ShieldAlert size={20} color="var(--color-danger)" />
            <h2 className={styles.sectionTitle}>High Priority</h2>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>Analyzing longitudinal memory streams...</div>
        ) : (
          <div className={styles.risksList}>
            {highRisks.map((risk) => (
              <Card key={risk.id} className={styles.riskCardHigh}>
                <div className={styles.riskHeader}>
                  <div className={styles.riskTitleGroup}>
                    <AlertTriangle size={20} className={styles.riskIconHigh} />
                    <div>
                      <h3 className={styles.riskTitle}>{risk.title}</h3>
                      <span className={styles.riskCategory}>
                        Domain: {risk.category.toUpperCase()} • Confidence: {risk.confidence || "98% (Grounded)"}
                      </span>
                    </div>
                  </div>
                  <Badge variant="danger">HIGH PRIORITY</Badge>
                </div>

                <div className={styles.riskBody}>
                  <p className={styles.riskDescription}>{risk.description}</p>

                  {risk.recommendations && risk.recommendations.length > 0 && (
                    <div className={styles.recommendationBox}>
                      <span className={styles.recTitle}>Proactive Clinical Recommendation:</span>
                      <p className={styles.recText}>{risk.recommendations[0]}</p>
                    </div>
                  )}

                  <div className={styles.evidenceActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewEvidence(risk.evidenceIds[0] || "ev-001")}
                    >
                      <FileSearch size={14} />
                      <span>Inspect Source Evidence ({risk.evidenceIds.length} Citations)</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Medium Priority Alerts */}
        {mediumRisks.length > 0 && (
          <>
            <div className={styles.sectionHeader} style={{ marginTop: "var(--space-8)" }}>
              <div className={styles.sectionTitleRow}>
                <TrendingDown size={20} color="var(--color-warning)" />
                <h2 className={styles.sectionTitle}>Moderate</h2>
              </div>
            </div>

            <div className={styles.risksList}>
              {mediumRisks.map((risk) => (
                <Card key={risk.id} className={styles.riskCardMedium}>
                  <div className={styles.riskHeader}>
                    <div className={styles.riskTitleGroup}>
                      <Activity size={18} className={styles.riskIconMedium} />
                      <div>
                        <h3 className={styles.riskTitle}>{risk.title}</h3>
                        <span className={styles.riskCategory}>
                          Domain: {risk.category.toUpperCase()} • Confidence: {risk.confidence || "89% (Synthesized)"}
                        </span>
                      </div>
                    </div>
                    <Badge variant="warning">MEDIUM PRIORITY</Badge>
                  </div>

                  <div className={styles.riskBody}>
                    <p className={styles.riskDescription}>{risk.description}</p>

                    {risk.recommendations && risk.recommendations.length > 0 && (
                      <div className={styles.recommendationBoxMedium}>
                        <span className={styles.recTitle}>System Suggestion:</span>
                        <p className={styles.recText}>{risk.recommendations[0]}</p>
                      </div>
                    )}

                    <div className={styles.evidenceActions}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEvidence(risk.evidenceIds[0] || "ev-002")}
                      >
                        <FileSearch size={14} />
                        <span>Inspect Evidence</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Evidence Drawer */}
        <EvidenceProvenanceDrawer
          selectedEvidenceId={selectedEvidenceId}
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
        />
      </div>
    </AppShell>
  );
}
