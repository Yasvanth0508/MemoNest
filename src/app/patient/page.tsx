"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  Pill,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { PatientPortalShell } from "@/components/patient";
import { EmergencySosModal } from "@/components/patient/EmergencySosModal";
import { patientPortalStore } from "@/services/patient-portal.service";
import styles from "./patient-home.module.css";

export default function PatientHomePage() {
  const [patient, setPatient] = React.useState(() => patientPortalStore.getPatient());
  const [medTaken, setMedTaken] = React.useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = React.useState(false);

  React.useEffect(() => {
    patientPortalStore.initFromApi();
    const unsub = patientPortalStore.subscribe(() => {
      setPatient({ ...patientPortalStore.getPatient() });
    });
    return unsub;
  }, []);

  // Time-aware greeting
  const greetingText = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayDateStr = "Thursday, September 10, 2026";

  const initials = React.useMemo(() => {
    const trimmed = (patient.name || "").trim();
    if (!trimmed || trimmed === "Loading...") return "PT";
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return trimmed.substring(0, 2).toUpperCase();
  }, [patient.name]);

  const speechSummary = `Good morning, ${patient.name || "Patient"}. Here is what is important about your health today: Your health profile is established. Your care team is keeping a gentle watch on your evening rest. Emergency access is always available.`;

  return (
    <PatientPortalShell pageSpeechSummary={speechSummary}>
      <div className={styles.homeWrapper}>
        {/* 1. Header Greeting Section */}
        <section className={styles.greetingSection} aria-labelledby="greeting-title">
          <div className={styles.greetingContent}>
            <div className={styles.dateDisplay}>
              <Calendar size={18} />
              <span>{todayDateStr}</span>
            </div>
            <h1 id="greeting-title" className={styles.greetingTitle}>
              {greetingText}, {patient.name}
            </h1>
            <p className={styles.greetingSubtitle}>
              Here&apos;s what&apos;s important about your health today.
            </p>
          </div>

          <div className={styles.patientAvatarBig} aria-label={`Profile avatar for ${patient.name}`}>
            {initials}
          </div>
        </section>

        {/* 2. Digital Twin Status Banner */}
        <section aria-labelledby="twin-status-title">
          <div className={styles.digitalTwinBanner}>
            <div className={styles.twinLeft}>
              <div className={styles.twinIcon}>
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h2 id="twin-status-title" className={styles.twinTitle}>
                  Health State: Stable
                </h2>
                <p className={styles.twinDesc}>
                  Your vital signs and daily movement patterns are steady. Your care team is keeping a gentle watch on your evening rest.
                </p>
              </div>
            </div>

            <Link href="/patient/timeline" className={styles.cardActionSecondary}>
              <span>View Health Trends</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* 3. Health Summary: Small number of large, easy-to-understand cards */}
        <section aria-labelledby="health-summary-title">
          <div className={styles.sectionTitleRow}>
            <h2 id="health-summary-title" className={styles.sectionHeading}>
              Today&apos;s Health Summary
            </h2>
            <p className={styles.sectionSubtitle}>4 items need your attention or awareness</p>
          </div>

          <div className={styles.summaryGrid}>
            {/* Card 1: Upcoming Appointment */}
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <div className={`${styles.summaryIconBox} ${styles.iconAppointment}`}>
                  <Calendar size={26} />
                </div>
                <div>
                  <div className={styles.summaryCardCategory}>Upcoming Appointment</div>
                  <h3 className={styles.summaryCardTitle}>Doctor Visit Tomorrow at 10:00 AM</h3>
                  <p className={styles.summaryCardDescription}>
                    Geriatric follow-up with <strong>Dr. Rajesh Sharma</strong> at MetroHealth Senior Specialty Clinic.
                  </p>
                </div>
              </div>
              <div className={styles.summaryCardFooter}>
                <Link href="/patient/timeline" className={styles.cardActionBtn}>
                  <span>Appointment Details</span>
                  <ArrowRight size={16} />
                </Link>
                <span style={{ fontSize: "14px", color: "#64748B" }}>In 1 day</span>
              </div>
            </div>

            {/* Card 2: Medication Reminder */}
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <div className={`${styles.summaryIconBox} ${styles.iconMedication}`}>
                  <Pill size={26} />
                </div>
                <div>
                  <div className={styles.summaryCardCategory}>Medication Reminder</div>
                  <h3 className={styles.summaryCardTitle}>
                    {medTaken ? "Morning Medications Completed" : "Morning Medications (3 Due)"}
                  </h3>
                  <p className={styles.summaryCardDescription}>
                    Amlodipine 5mg (1 pill), Metformin 500mg (1 pill), Aspirin 81mg (1 pill) with breakfast.
                  </p>
                </div>
              </div>
              <div className={styles.summaryCardFooter}>
                {medTaken ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700, fontSize: "15px" }}>
                    <Check size={18} /> Marked as Taken for Today
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.cardActionBtn}
                    onClick={() => setMedTaken(true)}
                  >
                    <Check size={18} />
                    <span>Mark as Taken</span>
                  </button>
                )}
                <Link href="/patient/timeline" className={styles.cardActionSecondary}>
                  <span>View Schedule</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Recent Health Activity */}
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <div className={`${styles.summaryIconBox} ${styles.iconActivity}`}>
                  <Heart size={26} />
                </div>
                <div>
                  <div className={styles.summaryCardCategory}>Recent Health Activity</div>
                  <h3 className={styles.summaryCardTitle}>Blood Pressure: 128/82 mmHg</h3>
                  <p className={styles.summaryCardDescription}>
                    Logged this morning at 8:15 AM. Within your target healthy range (under 135/85 mmHg).
                  </p>
                </div>
              </div>
              <div className={styles.summaryCardFooter}>
                <span style={{ fontSize: "14px", color: "#059669", fontWeight: 600 }}>
                  ✓ Normal Range
                </span>
                <Link href="/patient/timeline" className={styles.cardActionSecondary}>
                  <span>Log New Vitals</span>
                </Link>
              </div>
            </div>

            {/* Card 4: Important Notification / Consent Alert */}
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <div className={`${styles.summaryIconBox} ${styles.iconAlert}`}>
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className={styles.summaryCardCategory}>Important Notification</div>
                  <h3 className={styles.summaryCardTitle}>New Doctor Access Request</h3>
                  <p className={styles.summaryCardDescription}>
                    Dr. Priya Sharma requested temporary 30-day access to your recent blood tests for follow-up review.
                  </p>
                </div>
              </div>
              <div className={styles.summaryCardFooter}>
                <Link href="/patient/consent" className={styles.cardActionBtn}>
                  <span>Review Request</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/patient/notifications" className={styles.cardActionSecondary}>
                  <span>All Alerts</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Health Memory Summary Section */}
        <section aria-labelledby="health-memory-title">
          <div className={styles.sectionTitleRow}>
            <h2 id="health-memory-title" className={styles.sectionHeading}>
              Recent Health Memory
            </h2>
            <Link href="/patient/timeline" style={{ color: "#0D9488", fontWeight: 700, textDecoration: "none", fontSize: "16px" }}>
              View Complete Timeline →
            </Link>
          </div>

          <div className={styles.memoryList}>
            {/* Item 1: Recent diagnosis */}
            <Link href="/patient/timeline" className={styles.memoryItem}>
              <div className={styles.memoryItemIcon}>
                <Stethoscope size={22} />
              </div>
              <div className={styles.memoryItemContent}>
                <div className={styles.memoryItemCategory}>Recent Diagnosis</div>
                <div className={styles.memoryItemTitle}>Mild Cognitive Impairment (MCI)</div>
                <div className={styles.memoryItemDate}>Confirmed 2024 • Managed with Donepezil 5mg</div>
              </div>
              <ChevronRight size={20} color="#94A3B8" />
            </Link>

            {/* Item 2: Recent report uploaded */}
            <Link href="/patient/reports" className={styles.memoryItem}>
              <div className={styles.memoryItemIcon}>
                <FileText size={22} />
              </div>
              <div className={styles.memoryItemContent}>
                <div className={styles.memoryItemCategory}>Recent Report Uploaded</div>
                <div className={styles.memoryItemTitle}>Comprehensive Metabolic Blood Panel</div>
                <div className={styles.memoryItemDate}>28 Aug 2026 • Quest Diagnostics • ✓ Confirmed</div>
              </div>
              <ChevronRight size={20} color="#94A3B8" />
            </Link>

            {/* Item 3: Recent doctor visit */}
            <Link href="/patient/timeline" className={styles.memoryItem}>
              <div className={styles.memoryItemIcon}>
                <Clock size={22} />
              </div>
              <div className={styles.memoryItemContent}>
                <div className={styles.memoryItemCategory}>Recent Doctor Visit</div>
                <div className={styles.memoryItemTitle}>Geriatric Follow-up with Dr. Sharma</div>
                <div className={styles.memoryItemDate}>20 Aug 2026 • Routine checkup & lab orders</div>
              </div>
              <ChevronRight size={20} color="#94A3B8" />
            </Link>

            {/* Item 4: Recent medication change */}
            <Link href="/patient/timeline" className={styles.memoryItem}>
              <div className={styles.memoryItemIcon}>
                <Pill size={22} />
              </div>
              <div className={styles.memoryItemContent}>
                <div className={styles.memoryItemCategory}>Recent Medication Change</div>
                <div className={styles.memoryItemTitle}>Zolpidem 5mg PRN Added for Sleep</div>
                <div className={styles.memoryItemDate}>05 Sep 2026 • Caregiver fall precautions active</div>
              </div>
              <ChevronRight size={20} color="#94A3B8" />
            </Link>
          </div>
        </section>

        {/* 5. Emergency Section Card (Always Visible & Highly Accessible) */}
        <section aria-labelledby="emergency-section-title">
          <div className={styles.emergencyHighlight}>
            <div className={styles.emergencyHighlightLeft}>
              <div className={styles.emergencyHighlightIcon}>
                <AlertOctagon size={32} />
              </div>
              <div>
                <h2 id="emergency-section-title" className={styles.emergencyHighlightTitle}>
                  Emergency & SOS Assistance
                </h2>
                <p className={styles.emergencyHighlightDesc}>
                  Quick access to emergency contacts, severe drug allergies, blood type ({patient.bloodType || "B+"}), and DNR advance directives.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.emergencyTriggerBtn}
              onClick={() => setIsEmergencyOpen(true)}
            >
              Open Emergency Card
            </button>
          </div>
        </section>
      </div>

      <EmergencySosModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </PatientPortalShell>
  );
}
