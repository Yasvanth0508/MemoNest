"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EvidenceProvenanceDrawer } from "@/features/clinical-brief/EvidenceProvenanceDrawer";
import { getPatients } from "@/services";
import { Patient } from "@/types";
import { mockPatients, mockPatient } from "@/data/mock";
import {
  AlertTriangle,
  Clock,
  FileSearch,
  Search,
  Sparkles,
  Stethoscope,
  Activity,
  ShieldAlert,
  ArrowRight,
  User,
  Pill,
  Heart,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import styles from "./clinician.module.css";

export default function ClinicianWorkspacePage() {
  const [patients, setPatients] = React.useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<"all" | "urgent" | "med_changes" | "fall_risk">("all");
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = React.useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function loadPatients() {
      try {
        const loaded = await getPatients();
        if (isMounted && loaded.length > 0) {
          setPatients(loaded);
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
      }
    }
    loadPatients();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.activeConditions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "urgent") {
      return patient.id === "patient-001"; // Ravi Kumar needs urgent review
    }
    if (activeFilter === "med_changes") {
      return patient.id === "patient-001"; // Zolpidem initiated
    }
    if (activeFilter === "fall_risk") {
      return patient.id === "patient-001"; // Fall cluster
    }

    return true;
  });

  const handleInspectEvidence = (evidenceId: string = "ev-rx-zolpidem-01") => {
    setSelectedEvidenceId(evidenceId);
    setIsEvidenceDrawerOpen(true);
  };

  return (
    <AppShell
      activeRole="doctor"
      showPatientHeader={false}
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Clinician Workspace", href: "/clinician" },
      ]}
      user={{
        name: "Dr. Rajesh Sharma",
        role: "doctor",
        title: "MD, Geriatric Medicine",
      }}
    >
      <div className={styles.page}>
        {/* Clinician Profile Hero */}
        <section className={styles.workspaceHero}>
          <div className={styles.clinicianMeta}>
            <div className={styles.doctorAvatar}>RS</div>
            <div className={styles.doctorInfo}>
              <h1 className={styles.doctorName}>Clinician Workspace</h1>
              <p className={styles.doctorTitle}>
                Dr. Rajesh Sharma, MD
              </p>
            </div>
          </div>

          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>3</span>
              <span className={styles.statLabel}>Active Roster</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue} style={{ color: "#FFA29B" }}>
                1
              </span>
              <span className={styles.statLabel}>Immediate Attention</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>2</span>
              <span className={styles.statLabel}>Pending Reviews</span>
            </div>
          </div>
        </section>

        {/* Toolbar: Search & Filters */}
        <section className={styles.toolbarCard}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search patients by name, MRN, condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterPills}>
            <button
              type="button"
              className={clsx(styles.filterButton, activeFilter === "all" && styles.filterActive)}
              onClick={() => setActiveFilter("all")}
            >
              All Patients ({patients.length})
            </button>
            <button
              type="button"
              className={clsx(styles.filterButton, activeFilter === "urgent" && styles.filterActive)}
              onClick={() => setActiveFilter("urgent")}
            >
              Immediate Attention (1)
            </button>
            <button
              type="button"
              className={clsx(styles.filterButton, activeFilter === "med_changes" && styles.filterActive)}
              onClick={() => setActiveFilter("med_changes")}
            >
              Recent Med Changes (1)
            </button>
            <button
              type="button"
              className={clsx(styles.filterButton, activeFilter === "fall_risk" && styles.filterActive)}
              onClick={() => setActiveFilter("fall_risk")}
            >
              Fall Risk Alerts (1)
            </button>
          </div>
        </section>

        {/* Patient Roster Grid */}
        <section className={styles.rosterGrid} aria-label="Authorized Patient Roster">
          {filteredPatients.map((patient) => {
            const isRavi = patient.id === "patient-001";

            return (
              <div
                key={patient.id}
                className={clsx(styles.patientCard, isRavi && styles.cardUrgent)}
              >
                {/* Top Patient Header Row */}
                <div className={styles.patientHeaderRow}>
                  <div className={styles.patientProfile}>
                    <div className={styles.patientAvatar}>
                      {patient.name.split(" ").map((n) => n[0]).join("")}
                    </div>

                    <div className={styles.patientDetails}>
                      <div className={styles.patientNameRow}>
                        <h3 className={styles.patientName}>{patient.name}</h3>
                        <span className={styles.patientMrn}>MRN: {patient.id}</span>
                      </div>

                      <span className={styles.patientSubtext}>
                        Age {patient.age} • {patient.gender} • Blood {patient.bloodType || "B+"} • Primary: {patient.primaryDoctor}
                      </span>
                    </div>
                  </div>

                  {/* Immediate Attention Badges */}
                  <div className={styles.badgeStack}>
                    {isRavi ? (
                      <>
                        <Badge variant="danger">
                          <AlertTriangle size={12} style={{ marginRight: 4 }} />
                          2 Falls Logged in 24h
                        </Badge>
                        <Badge variant="warning">
                          <Pill size={12} style={{ marginRight: 4 }} />
                          Zolpidem Initiated 5d ago
                        </Badge>
                        <Badge variant="danger">
                          <ShieldAlert size={12} style={{ marginRight: 4 }} />
                          Elevated Fall Risk
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="success">Stable Follow-Up</Badge>
                    )}
                  </div>
                </div>

                {/* Clinical Overview Strip */}
                <div className={styles.clinicalSummaryStrip}>
                  <div className={styles.summaryGroup}>
                    <span className={styles.summaryKey}>Key Conditions:</span>
                    <span className={styles.summaryValue}>
                      {patient.activeConditions.slice(0, 3).join(", ")}
                      {patient.activeConditions.length > 3 ? "..." : ""}
                    </span>
                  </div>

                  <div className={styles.summaryGroup}>
                    <span className={styles.summaryKey}>Mobility Status:</span>
                    <span className={styles.summaryValue}>
                      {patient.mobilityStatus || "Independent ambulation"}
                    </span>
                  </div>

                  {isRavi && (
                    <div className={styles.summaryGroup}>
                      <span className={styles.summaryKey}>Active Regimen:</span>
                      <span className={styles.summaryValue} style={{ color: "var(--color-danger)", fontWeight: 700 }}>
                        7 Meds (High Sedation Load)
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer with Quick Actions */}
                <div className={styles.cardFooter}>
                  <div>
                    {isRavi && (
                      <span className={styles.footerLeftNotice}>
                        <AlertTriangle size={14} />
                        Requires immediate deprescribing and fall-safety intervention
                      </span>
                    )}
                  </div>

                  <div className={styles.actionButtons}>
                    {isRavi ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInspectEvidence("ev-rx-zolpidem-01")}
                        >
                          <FileSearch size={14} />
                          <span>Inspect Evidence</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href="/timeline">
                            <Clock size={14} />
                            <span>Review Timeline</span>
                          </Link>
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          asChild
                        >
                          <Link href={`/clinician/patient/${patient.id}/brief`}>
                            <Sparkles size={14} />
                            <span>Open AI Clinical Brief</span>
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href="/timeline">
                            <Clock size={14} />
                            <span>Review Timeline</span>
                          </Link>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                        >
                          <Link href={`/clinician/patient/${patient.id}/brief`}>
                            <Sparkles size={14} />
                            <span>Open Clinical Summary</span>
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Evidence Provenance Drawer */}
      <EvidenceProvenanceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        selectedEvidenceId={selectedEvidenceId}
        patientId="patient-001"
      />
    </AppShell>
  );
}
