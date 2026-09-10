"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ClinicalBriefCard, EvidenceProvenanceDrawer } from "@/features/clinical-brief";
import { patientService, clinicalBriefService } from "@/services";
import { Patient, ClinicalBrief } from "@/types";
import { mockPatient, mockClinicalBrief } from "@/data/mock";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Sparkles, Clock } from "lucide-react";
import styles from "./brief.module.css";

export default function AIClinicalBriefPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = (params?.id as string) || "patient-001";

  const [patient, setPatient] = React.useState<Patient>(mockPatient);
  const [brief, setBrief] = React.useState<ClinicalBrief>(mockClinicalBrief);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = React.useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>("ev-rx-zolpidem-01");

  React.useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [loadedPatient, loadedBrief] = await Promise.all([
          patientService.getPatient(patientId),
          clinicalBriefService.getClinicalBrief(patientId),
        ]);
        if (isMounted) {
          if (loadedPatient) setPatient(loadedPatient);
          if (loadedBrief) setBrief(loadedBrief);
        }
      } catch (err) {
        console.error("Failed to load clinical brief data:", err);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleOpenEvidence = (evidenceId?: string) => {
    setSelectedEvidenceId(evidenceId || "ev-rx-zolpidem-01");
    setIsEvidenceDrawerOpen(true);
  };

  return (
    <AppShell
      activeRole="doctor"
      showPatientHeader={true}
      patient={patient}
      onViewEvidence={() => handleOpenEvidence("ev-stroke-discharge-01")}
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Clinician Workspace", href: "/clinician" },
        { label: patient.name, href: `/clinician` },
        { label: "AI Clinical Brief", href: `/clinician/patient/${patientId}/brief` },
      ]}
      user={{
        name: "Dr. Rajesh Sharma",
        role: "doctor",
        title: "MD, Geriatric Medicine",
      }}
    >
      <div className={styles.briefPage}>
        {/* Navigation & Section Title */}
        <div className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <Link href="/clinician" className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>Roster</span>
            </Link>
            <h1 className={styles.title}>Clinical Brief</h1>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/timeline">
                <Clock size={14} />
                <span>Timeline</span>
              </Link>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              asChild
            >
              <Link href="/patient/medications">
                <Clock size={14} />
                <span>Medications</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Core AI Clinical Brief Card */}
        <ClinicalBriefCard
          brief={brief}
          onViewEvidence={handleOpenEvidence}
          onOpenTimeline={() => router.push("/timeline")}
        />
      </div>

      {/* Evidence Provenance Inspector Drawer */}
      <EvidenceProvenanceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        selectedEvidenceId={selectedEvidenceId}
        patientId={patientId}
      />
    </AppShell>
  );
}
