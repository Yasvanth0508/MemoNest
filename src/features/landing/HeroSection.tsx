"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-headline">
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Minimal Headline & Actions */}
          <div className={styles.content}>
            <div className={styles.eyebrow}>
              <Sparkles size={14} className={styles.eyebrowIcon} />
              <span>Health Memory</span>
            </div>

            <h1 id="hero-headline" className={styles.headline}>
              Longitudinal Intelligence{" "}
              <span className={styles.headlineEmphasis}>for Patient Care.</span>
            </h1>

            <div className={styles.actions}>
              <Button asChild size="lg" variant="primary">
                <Link href="/login" className={styles.actionLink}>
                  <span className={styles.buttonText}>
                    Sign In
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <Link href="/signup" className={styles.actionLink}>
                  <span className={styles.buttonText}>Register</span>
                </Link>
              </Button>
            </div>

            {/* Metric Chips */}
            <div className={styles.metricsRow}>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>Decade Record</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>5 Agents</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricValue}>100% Provenance</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Telemetry Card */}
          <div className={styles.mockupWrapper}>
            <div className={styles.mockupCard}>
              {/* Architecture Top Header */}
              <div className={styles.cardTopHeader}>
                <div className={styles.patientIdentity}>
                  <div className={styles.avatarMock} aria-hidden="true">
                    <Database size={20} color="var(--color-primary)" />
                  </div>
                  <div className={styles.patientMeta}>
                    <div className={styles.patientName}>
                      Persistent Memory
                    </div>
                    <div className={styles.patientSubtext}>
                      Longitudinal Engine
                    </div>
                  </div>
                </div>
                <div className={styles.livePill}>
                  <span className={styles.pulseDot} aria-hidden="true" />
                  <span>Live</span>
                </div>
              </div>

              {/* Card Body: Minimal Telemetry Tags */}
              <div className={styles.cardBody}>
                {/* Pipeline Tags */}
                <div className={styles.conditionsRow}>
                  <span className={styles.conditionTag}>OCR Ingestion</span>
                  <span className={styles.conditionTag}>SNOMED / RxNorm</span>
                  <span className={styles.conditionTag}>Vector Index</span>
                  <span className={styles.conditionTag}>Knowledge Graph</span>
                </div>

                {/* Synthesis Risk Box */}
                <div className={styles.riskBox}>
                  <div className={styles.riskHeader}>
                    <div className={styles.riskTitleGroup}>
                      <Cpu size={16} />
                      <span>Risk Synthesis</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className={styles.conditionsRow} style={{ marginTop: 4 }}>
                    <span className={styles.conditionTag}>Polypharmacy Check</span>
                    <span className={styles.conditionTag}>Fall Surveillance</span>
                    <span className={styles.conditionTag}>Sedative Index</span>
                  </div>
                </div>

                {/* Agent Activity Teaser */}
                <div className={styles.timelineTeaser}>
                  <div className={styles.timelineTeaserHeader}>
                    <span>Active Agents</span>
                    <Activity size={14} />
                  </div>
                  <div className={styles.timelineEvents}>
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineItemDot} />
                      <span className={styles.timelineItemTime}>
                        Medical History Agent
                      </span>
                    </div>
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineItemDot} />
                      <span className={styles.timelineItemTime}>
                        Medication Intelligence Agent
                      </span>
                    </div>
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineItemDot} />
                      <span className={styles.timelineItemTime}>
                        Functional & Fall Surveillance
                      </span>
                    </div>
                    <div className={styles.timelineItem}>
                      <span className={styles.timelineItemDot} />
                      <span className={styles.timelineItemTime}>
                        Provenance Index
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Verification Footer */}
              <div className={styles.cardFooterStatus}>
                <div className={styles.statusCheck}>
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  <span>Consent Enforced</span>
                </div>
                <div className={styles.statusCheck}>
                  <ShieldCheck size={14} color="var(--color-primary)" />
                  <span>Audited Ledger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
