"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  ScanText,
  Database,
  Sparkles,
  Stethoscope,
  ArrowRight,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./TransformationSection.module.css";

interface PipelineStep {
  number: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tags: string[];
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    number: "01",
    title: "Ingestion",
    subtitle: "Multi-Source Intake",
    icon: FileText,
    tags: ["Discharge Summaries", "Prescriptions", "Caregiver Notes", "Lab Results"],
  },
  {
    number: "02",
    title: "Extraction",
    subtitle: "OCR & Parsing",
    icon: ScanText,
    tags: ["OCR Processing", "Temporal Anchoring", "Rx Normalization"],
  },
  {
    number: "03",
    title: "Memory",
    subtitle: "Longitudinal Graph",
    icon: Database,
    tags: ["Decade Record", "Semantic Index", "Zero Amnesia"],
  },
  {
    number: "04",
    title: "Synthesis",
    subtitle: "Risk Intelligence",
    icon: Sparkles,
    tags: ["Clinical Brief", "Drug Interactions", "Fall Detection"],
  },
  {
    number: "05",
    title: "Care",
    subtitle: "Point of Care",
    icon: Stethoscope,
    tags: ["Clinician Brief", "Pharmacist Check", "Caregiver Log"],
  },
];

export function TransformationSection() {
  return (
    <section id="transformation" className={styles.section} aria-labelledby="transformation-title">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <Workflow size={14} />
            <span>Architecture</span>
          </div>
          <h2 id="transformation-title" className={styles.title}>
            Pipeline
          </h2>
        </div>

        {/* Pipeline Steps Grid */}
        <div className={styles.pipeline}>
          {PIPELINE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span className={styles.stepBadge}>{step.number}</span>
                  <div className={styles.stepIconWrap} aria-hidden="true">
                    <Icon size={22} />
                  </div>
                </div>

                <h3 className={styles.stepTitle}>{step.title}</h3>
                <span className={styles.stepSubtitle}>{step.subtitle}</span>

                <div className={styles.stepTags}>
                  {step.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <h3 className={styles.bannerTitle}>
              Continuous memory that follows the patient.
            </h3>
          </div>
          <div className={styles.bannerAction}>
            <Button asChild variant="secondary" size="lg">
              <Link href="/login">
                Clinical Brief
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
