"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { PATIENT_SIDEBAR_SECTIONS } from "@/features/patient-nav";
import { patientService } from "@/services";
import { Patient } from "@/types";
import {
  HealthSnapshot,
  AiInsightPreview,
  ConditionsList,
  RecentEventsList,
  CareTeamSection,
  QuickActions,
} from "@/features/health-memory";
import { EvidenceDrawer } from "@/components/evidence";
import styles from "./patient-home.module.css";

export default function PatientHomePage() {
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = React.useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const p = await patientService.getPatient();
        setPatient(p);
      } catch (err) {
        console.error("Failed to load patient:", err);
      }
    }
    loadData();
  }, []);

  const handleOpenEvidence = (evidenceId?: string) => {
    setSelectedEvidenceId(evidenceId || "ev-stroke-discharge-01");
    setIsEvidenceOpen(true);
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Patient", href: "/patient" },
    { label: "Dashboard" },
  ];

  return (
    <AppShell
      activeRole="patient"
      customSidebarSections={PATIENT_SIDEBAR_SECTIONS}
      showPatientHeader={true}
      patient={patient || undefined}
      breadcrumbs={breadcrumbs}
      onViewEvidence={() => handleOpenEvidence("ev-stroke-discharge-01")}
    >
      <div className={styles.homeLayout}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>Overview</h1>
        </div>

        {/* Health Snapshot */}
        <HealthSnapshot
          conditionsCount={6}
          medsCount={7}
          eventsCount={4}
          risksCount={2}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Risks */}
        <section id="risks">
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Risks</h3>
          </div>
          <AiInsightPreview onViewEvidence={handleOpenEvidence} />
        </section>

        {/* Conditions & Recent Events */}
        <div className={styles.twoColumnSection}>
          <ConditionsList />
          <RecentEventsList />
        </div>

        {/* Care Team */}
        <section id="care-team">
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Care Team</h3>
          </div>
          <CareTeamSection />
        </section>
      </div>

      {/* Integrated Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        evidenceId={selectedEvidenceId}
      />
    </AppShell>
  );
}
