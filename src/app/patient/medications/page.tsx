"use client";

import * as React from "react";
import { PatientPortalShell } from "@/components/patient";
import { Medication } from "@/types";
import { medicationService } from "@/services";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EvidenceProvenanceDrawer } from "@/features/clinical-brief/EvidenceProvenanceDrawer";
import {
  Pill,
  AlertTriangle,
  ShieldAlert,
  FileSearch,
} from "lucide-react";
import styles from "./medications.module.css";

export default function PatientMedicationsPage() {
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadMeds() {
      try {
        setIsLoading(true);
        const data = await medicationService.getMedications();
        setMedications(data);
      } catch (err) {
        console.error("Failed to load medications:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMeds();
  }, []);

  const handleViewEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setIsEvidenceOpen(true);
  };

  const activeMeds = medications.filter((m) => m.status === "active");
  const stoppedMeds = medications.filter((m) => m.status !== "active");

  return (
    <PatientPortalShell>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.badgeRow}>
            <Badge variant="secondary">
              <Pill size={12} style={{ marginRight: 4 }} />
              Active ({activeMeds.length})
            </Badge>
          </div>
          <h1 className={styles.title}>Medications</h1>
        </div>

        {/* Critical Drug Alert / Recent Change Callout */}
        <div className={styles.recentChangeBanner}>
          <div className={styles.alertIconCol}>
            <AlertTriangle size={24} className={styles.alertIcon} />
          </div>
          <div className={styles.alertContent}>
            <div className={styles.alertTitleRow}>
              <span className={styles.alertTitle}>
                Alert: Zolpidem 5mg Added
              </span>
              <Badge variant="danger">Fall Risk Correlation</Badge>
            </div>
          </div>
        </div>

        {/* Documented Allergies & Intolerances */}
        <Card className={styles.allergiesCard}>
          <CardHeader className={styles.cardHeaderSmall}>
            <div className={styles.allergiesHeaderTitle}>
              <ShieldAlert size={18} color="var(--color-danger)" />
              <CardTitle>Allergies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className={styles.cardContentSmall}>
            <div className={styles.allergiesList}>
              <div className={styles.allergyItem}>
                <span className={styles.allergyName}>Penicillin</span>
                <Badge variant="danger">Severe Rash & Urticaria</Badge>
                <span className={styles.allergySource}>Source: Inpatient Record 2018</span>
              </div>
              <div className={styles.allergyItem}>
                <span className={styles.allergyName}>Sulfa Drugs</span>
                <Badge variant="warning">Moderate Gastrointestinal Intolerance</Badge>
                <span className={styles.allergySource}>Source: Clinic Intake 2021</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Regimen Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Active Medications</h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>Loading medications ledger...</div>
        ) : (
          <div className={styles.medsGrid}>
            {activeMeds.map((med) => (
              <Card key={med.id} className={styles.medCard}>
                <div className={styles.medCardHeader}>
                  <div>
                    <h3 className={styles.medName}>{med.name}</h3>
                    <span className={styles.medDosage}>{med.dosage} • {med.frequency}</span>
                  </div>
                  <Badge variant={med.name.includes("Zolpidem") ? "danger" : "default"}>
                    {med.status.toUpperCase()}
                  </Badge>
                </div>

                <div className={styles.medBody}>
                  {med.indication && (
                    <div className={styles.medMetaRow}>
                      <span className={styles.metaLabel}>Indication:</span>
                      <span className={styles.metaValue}>{med.indication}</span>
                    </div>
                  )}
                  <div className={styles.medMetaRow}>
                    <span className={styles.metaLabel}>Prescriber:</span>
                    <span className={styles.metaValue}>{med.prescriber}</span>
                  </div>
                  <div className={styles.medMetaRow}>
                    <span className={styles.metaLabel}>Started:</span>
                    <span className={styles.metaValue}>{med.startDate}</span>
                  </div>

                  {(med.fallRiskWarning || med.sedationRisk) && (
                    <div className={styles.medWarningBox}>
                      <AlertTriangle size={14} color="var(--color-danger)" />
                      <span>Elevated sedation & fall hazard in elderly patients (Beers Criteria)</span>
                    </div>
                  )}
                </div>

                <div className={styles.medFooter}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEvidence("ev-004")}
                    style={{ width: "100%" }}
                  >
                    <FileSearch size={14} />
                    <span>View Prescription Provenance</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Discontinued / Historical Medications */}
        {stoppedMeds.length > 0 && (
          <div className={styles.historicalSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>History</h2>
            </div>
            <div className={styles.medsGrid}>
              {stoppedMeds.map((med) => (
                <Card key={med.id} className={styles.medCardHistorical}>
                  <div className={styles.medCardHeader}>
                    <div>
                      <h3 className={styles.medNameHistorical}>{med.name}</h3>
                      <span className={styles.medDosage}>{med.dosage} • {med.frequency}</span>
                    </div>
                    <Badge variant="outline">DISCONTINUED</Badge>
                  </div>
                  <div className={styles.medBody}>
                    <div className={styles.medMetaRow}>
                      <span className={styles.metaLabel}>Prescriber:</span>
                      <span className={styles.metaValue}>{med.prescriber}</span>
                    </div>
                    <div className={styles.medMetaRow}>
                      <span className={styles.metaLabel}>Reason:</span>
                      <span className={styles.metaValue}>Replaced or adverse side-effect</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Drawer */}
        <EvidenceProvenanceDrawer
          selectedEvidenceId={selectedEvidenceId}
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
        />
      </div>
    </PatientPortalShell>
  );
}
