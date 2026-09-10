"use client";

import * as React from "react";
import Link from "next/link";
import { ClinicalBrief } from "@/types";
import { mockClinicalBrief } from "@/data/mock";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  AlertTriangle,
  FileSearch,
  Sparkles,
  Clock,
  Pill,
  History,
  Activity,
  CheckSquare,
  Square,
  FileText,
  Copy,
  Check,
  Printer,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import clsx from "clsx";
import styles from "./ClinicalBriefCard.module.css";

export interface ClinicalBriefCardProps {
  brief?: ClinicalBrief;
  onViewEvidence?: (evidenceId?: string) => void;
  onOpenTimeline?: () => void;
}

export function ClinicalBriefCard({
  brief = mockClinicalBrief,
  onViewEvidence,
  onOpenTimeline,
}: ClinicalBriefCardProps) {
  const [completedActions, setCompletedActions] = React.useState<Record<number, boolean>>({});
  const [noteCopied, setNoteCopied] = React.useState(false);

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyNote = () => {
    const text = `POINT-OF-CARE AI CLINICAL BRIEF
Patient: ${brief.patientName} (${brief.age}yo M) | Attending: ${brief.primaryDoctor}
Generated: ${new Date(brief.generatedAt).toLocaleString()}

WHY THIS PATIENT NEEDS ATTENTION:
- HIGH PRIORITY: ${brief.highPriorityAlerts.join("; ")}
- RECENT CHANGES: ${brief.recentChanges.join("; ")}
- ACTIVE REGIMEN (${brief.activeMedicationsCount} meds): ${brief.activeMedications.join(", ")}
- RELEVANT HISTORY: ${brief.relevantHistory.join("; ")}

CLINICAL SYNTHESIS:
${brief.clinicalSummary}

RECOMMENDED ORDERS & ACTIONS:
${brief.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}
`;
    navigator.clipboard?.writeText(text);
    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.briefContainer}>
      {/* Top Metadata & Quick Bar */}
      <div className={styles.topBar}>
        <div className={styles.synthMeta}>
          <span className={styles.aiBadge}>
            <Sparkles size={13} />
            AI Clinical Brief v2.4
          </span>
          <span className={styles.metaText}>
            Prepared for <span className={styles.doctorName}>{brief.primaryDoctor}</span> • Generated at 09:00 AM Today
          </span>
        </div>

        <div className={styles.topActions}>
          <Button variant="outline" size="sm" onClick={handleCopyNote}>
            {noteCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{noteCopied ? "Note Copied" : "Copy Brief Note"}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewEvidence?.()}
          >
            <FileSearch size={14} />
            <span>Inspect All Evidence</span>
          </Button>
        </div>
      </div>

      {/* Flagship: WHY THIS PATIENT NEEDS ATTENTION */}
      <section className={styles.attentionHero} aria-label="Why this patient needs immediate clinical attention">
        <div className={styles.heroHeader}>
          <div className={styles.heroTitleGroup}>
            <div className={styles.heroPulseIcon}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className={styles.heroTitle}>Attention</h2>
            </div>
          </div>
          <Badge variant="danger">High Urgency</Badge>
        </div>

        {/* 4 Pillars Grid */}
        <div className={styles.heroGrid}>
          {/* 1. High Priority Alerts */}
          <div className={clsx(styles.heroCard, styles.heroCardHighAlert)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <ShieldAlert size={16} color="var(--color-danger)" />
                High Priority: 2 Falls in 24h
              </span>
              <Badge variant="danger">Critical</Badge>
            </div>

            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-danger)" }} />
                  <span><strong>Fall 1 (Yesterday, 2026-09-09):</strong> Morning bathroom slip with confusion.</span>
                </div>
                <div className={styles.citationRow}>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-caregiver-fall-01")}
                  >
                    <FileSearch size={10} />
                    <span>Caregiver Log 09-09</span>
                  </button>
                </div>
              </li>

              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-danger)" }} />
                  <span><strong>Fall 2 (Today, 2026-09-10):</strong> Bed-to-chair transfer loss of balance. Right knee contusion.</span>
                </div>
                <div className={styles.citationRow}>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-caregiver-fall-02")}
                  >
                    <FileSearch size={10} />
                    <span>Incident Report 09-10</span>
                  </button>
                </div>
              </li>
            </ul>
          </div>

          {/* 2. Recent Changes */}
          <div className={clsx(styles.heroCard, styles.heroCardChange)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <Clock size={16} color="var(--color-warning)" />
                Recent Changes: Zolpidem Added
              </span>
              <Badge variant="warning">5 Days Ago</Badge>
            </div>

            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-warning)" }} />
                  <span><strong>Zolpidem 5mg PRN</strong> prescribed on 2026-09-05 for sleep onset insomnia.</span>
                </div>
                <div className={styles.citationRow}>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-rx-zolpidem-01")}
                  >
                    <Pill size={10} />
                    <span>Sleep Rx Note 2026-09-05</span>
                  </button>
                </div>
              </li>

              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-warning)" }} />
                  <span>Morning confusion, daytime drowsiness, and ataxia during sit-to-stand transfers noted starting 2026-09-07.</span>
                </div>
                <div className={styles.citationRow}>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-caregiver-obs-01")}
                  >
                    <FileSearch size={10} />
                    <span>Caregiver Obs 09-07</span>
                  </button>
                </div>
              </li>
            </ul>
          </div>

          {/* 3. 7 Active Meds & Sedative Load */}
          <div className={clsx(styles.heroCard, styles.heroCardMeds)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <Pill size={16} color="var(--color-secondary)" />
                7 Active Meds & Sedative Load
              </span>
              <Badge variant="secondary">Polypharmacy</Badge>
            </div>

            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-secondary)" }} />
                  <span><strong>CNS Sedation Burden:</strong> High risk interaction between Zolpidem (Hypnotic) and Donepezil (MCI).</span>
                </div>
              </li>

              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-secondary)" }} />
                  <span>Concomitant Amlodipine 5mg increases vasodilatory orthostatic vulnerability upon waking.</span>
                </div>
                <div className={styles.citationRow}>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-htn-rx-01")}
                  >
                    <FileSearch size={10} />
                    <span>Amlodipine Switch Note</span>
                  </button>
                </div>
              </li>
            </ul>
          </div>

          {/* 4. Relevant Longitudinal History */}
          <div className={clsx(styles.heroCard, styles.heroCardHistory)}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <History size={16} color="var(--color-info)" />
                Relevant History & Deficits
              </span>
              <Badge variant="outline">Baseline Vulnerability</Badge>
            </div>

            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-info)" }} />
                  <span><strong>2018 Acute Ischemic Stroke:</strong> Right MCA territory; residual left hemiparesis and gait asymmetry.</span>
                </div>
                <div className={styles.citationRow}>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-stroke-discharge-01")}
                  >
                    <BookOpen size={10} />
                    <span>Discharge Summary 2018</span>
                  </button>
                </div>
              </li>

              <li className={styles.bulletItem}>
                <div className={styles.bulletItemText}>
                  <div className={styles.bulletDot} style={{ background: "var(--color-info)" }} />
                  <span><strong>Bilateral Knee OA & MCI:</strong> Transfer stiffness, prescribed rolling walker; MoCA 23/30.</span>
                </div>
                <div className={styles.citationRow}>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-neuro-consult-01")}
                  >
                    <Stethoscope size={10} />
                    <span>Neuro Consult 2024</span>
                  </button>
                  <button
                    type="button"
                    className={styles.citationChip}
                    onClick={() => onViewEvidence?.("ev-walker-mobility-01")}
                  >
                    <FileSearch size={10} />
                    <span>PT Eval 2025</span>
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Synthesized Clinical Assessment */}
      <section className={styles.synthesisCard}>
        <div className={styles.synthesisHeader}>
          <h3 className={styles.sectionHeading}>
            <Stethoscope size={20} color="var(--color-primary)" />
            Synthesis
          </h3>
          <Badge variant="default">Dr. Sharma, MD</Badge>
        </div>

        <blockquote className={styles.narrativeQuote}>
          &ldquo;{brief.clinicalSummary}&rdquo;
        </blockquote>
      </section>

      {/* Recommended Action Checklist */}
      <section className={styles.synthesisCard}>
        <div className={styles.synthesisHeader}>
          <h3 className={styles.sectionHeading}>
            <CheckSquare size={20} color="var(--color-primary)" />
            Orders
          </h3>
          <span className={styles.metaText}>
            {Object.values(completedActions).filter(Boolean).length} of {brief.recommendedActions.length} completed
          </span>
        </div>

        <div className={styles.actionsGrid}>
          {brief.recommendedActions.map((action, idx) => {
            const isDone = Boolean(completedActions[idx]);
            return (
              <div
                key={idx}
                className={styles.actionItem}
                onClick={() => toggleAction(idx)}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleAction(idx)}
                  className={styles.actionCheckbox}
                  aria-label={action}
                />
                <span className={clsx(styles.actionText, isDone && styles.actionCompleted)}>
                  {action}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cross-Disciplinary Handoff CTA */}
      <div className={styles.handoffBanner}>
        <div className={styles.handoffContent}>
          <h4 className={styles.handoffTitle}>Multi-Disciplinary Care Coordination</h4>
          <p className={styles.handoffSubtitle}>
            Review the full medication list to assess sedative burden and evaluate potential deprescribing options.
          </p>
        </div>

        <div className={styles.handoffActions}>
          <Button
            variant="secondary"
            size="md"
            asChild
          >
            <Link href="/patient/medications">
              <Pill size={16} /> Review Medications
            </Link>
          </Button>

          <Button
            variant="outline"
            size="md"
            style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.4)" }}
            onClick={onOpenTimeline}
            asChild={!onOpenTimeline}
          >
            {onOpenTimeline ? (
              <span>
                <Clock size={16} /> Review Timeline
              </span>
            ) : (
              <Link href="/timeline">
                <Clock size={16} /> Review Timeline
              </Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
