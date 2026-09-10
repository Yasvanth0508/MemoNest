"use client";

import * as React from "react";
import { DoctorProvider, useDoctorStore, DoctorPortalTab } from "./doctor-store";
import { DoctorTopBar } from "./DoctorTopBar";
import { ConsentBanner } from "./ConsentBanner";
import { DoctorHomeView } from "./DoctorHomeView";
import { PatientOverviewView } from "./PatientOverviewView";
import { KeyChangesView } from "./KeyChangesView";
import { DigitalTwinView } from "./DigitalTwinView";
import { HealthTimelineView } from "./HealthTimelineView";
import { DoctorUploadView } from "./DoctorUploadView";
import { AiClinicalAssistantView } from "./AiClinicalAssistantView";
import { PrescriptionNotesView } from "./PrescriptionNotesView";
import { AccessLogView } from "./AccessLogView";
import { DoctorEvidenceDrawer } from "./DoctorEvidenceDrawer";
import { EmergencySosModal } from "@/components/patient/EmergencySosModal";
import {
  LayoutDashboard,
  User,
  AlertTriangle,
  Brain,
  Clock,
  UploadCloud,
  Sparkles,
  Stethoscope,
  FileCheck2,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import styles from "./DoctorShell.module.css";

export interface DoctorShellProps {
  initialTab?: DoctorPortalTab;
}

function DoctorShellContent() {
  const {
    activeTab,
    setActiveTab,
    patientChanges,
    selectedPatient,
    isEmergencySosOpen,
    closeEmergencySos,
  } = useDoctorStore();

  const isHome = activeTab === "home";

  const newChangesCount = patientChanges.filter((c) => c.isNew).length;

  const tabs: { id: DoctorPortalTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: "overview", label: "Overview", icon: User },
    { id: "changes", label: "Key Changes", icon: AlertTriangle },
    { id: "state", label: "Patient State / Digital Twin", icon: Brain },
    { id: "timeline", label: "Health Timeline", icon: Clock },
    { id: "upload", label: "Upload Documents", icon: UploadCloud },
    { id: "assistant", label: "AI Clinical Assistant", icon: Sparkles },
    { id: "prescribe", label: "Prescription / Notes", icon: Stethoscope },
    { id: "audit", label: "Access Log", icon: FileCheck2 },
  ];

  return (
    <div className={styles.portalLayout}>
      <main className={styles.mainContainer}>
        {/* Top Header Bar with Doctor Profile, Patient Switcher, Digital Twin Badge, SOS */}
        <DoctorTopBar />

        {/* Persistent Consent Scope Banner */}
        <ConsentBanner />

        {/* Secondary Tab Navigation Bar (Selected Patient Context) */}
        {!isHome && (
          <nav className={styles.navTabsRow} aria-label="Doctor Patient Workspace Navigation">
            <div className={styles.tabsList} role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={clsx(styles.tabBtn, isActive && styles.tabBtnActive)}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                    {tab.id === "changes" && newChangesCount > 0 && (
                      <span className={styles.tabBadge}>{newChangesCount}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles.rightTabActions}>
              <button
                type="button"
                className={styles.tabActionUpload}
                onClick={() => setActiveTab("upload")}
              >
                <UploadCloud size={14} />
                <span>+ Upload Record</span>
              </button>
            </div>
          </nav>
        )}

        {/* Injected Tab Content */}
        <div className={styles.contentArea}>
          {activeTab === "home" && <DoctorHomeView />}
          {activeTab === "overview" && <PatientOverviewView />}
          {activeTab === "changes" && <KeyChangesView />}
          {activeTab === "state" && <DigitalTwinView />}
          {activeTab === "timeline" && <HealthTimelineView />}
          {activeTab === "upload" && <DoctorUploadView />}
          {activeTab === "assistant" && <AiClinicalAssistantView />}
          {activeTab === "prescribe" && <PrescriptionNotesView />}
          {activeTab === "audit" && <AccessLogView />}
        </div>
      </main>

      {/* Shared Modals & Drawers */}
      <DoctorEvidenceDrawer />
      <EmergencySosModal isOpen={isEmergencySosOpen} onClose={closeEmergencySos} />
    </div>
  );
}

export function DoctorShell({ initialTab }: DoctorShellProps) {
  return (
    <DoctorProvider>
      <DoctorShellContentWrapper initialTab={initialTab} />
    </DoctorProvider>
  );
}

function DoctorShellContentWrapper({ initialTab }: { initialTab?: DoctorPortalTab }) {
  const { setActiveTab } = useDoctorStore();

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, setActiveTab]);

  return <DoctorShellContent />;
}
