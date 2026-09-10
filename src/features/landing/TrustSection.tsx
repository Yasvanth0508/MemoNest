"use client";

import * as React from "react";
import {
  UserCheck,
  Sliders,
  FileCheck2,
  ScrollText,
  ShieldCheck,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import styles from "./TrustSection.module.css";

interface TrustPrinciple {
  title: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TRUST_PRINCIPLES: TrustPrinciple[] = [
  {
    title: "Patient Owned",
    badge: "Sovereign",
    icon: UserCheck,
  },
  {
    title: "Consent Governed",
    badge: "Granular",
    icon: Sliders,
  },
  {
    title: "Evidence Backed",
    badge: "Provenance",
    icon: FileCheck2,
  },
  {
    title: "Fully Audited",
    badge: "Immutable",
    icon: ScrollText,
  },
];

export function TrustSection() {
  return (
    <section id="trust" className={styles.section} aria-labelledby="trust-title">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <ShieldCheck size={14} />
            <span>Governance</span>
          </div>
          <h2 id="trust-title" className={styles.title}>
            Governance
          </h2>
        </div>

        {/* 4 Principles Grid */}
        <div className={styles.principlesGrid}>
          {TRUST_PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div key={principle.title} className={styles.principleCard}>
                <div className={styles.principleTop}>
                  <div className={styles.iconWrapper} aria-hidden="true">
                    <Icon size={22} />
                  </div>
                  <Badge variant="outline">{principle.badge}</Badge>
                </div>

                <h3 className={styles.principleTitle}>{principle.title}</h3>
              </div>
            );
          })}
        </div>

        {/* Compliance Callout */}
        <div className={styles.complianceBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Lock size={24} color="var(--color-primary)" />
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-primary)" }}>
              Healthcare Security
            </div>
          </div>

          <div className={styles.complianceBadges}>
            <div className={styles.complianceBadge}>
              <CheckCircle2 size={12} color="var(--color-success)" />
              <span>HIPAA Compliant</span>
            </div>
            <div className={styles.complianceBadge}>
              <CheckCircle2 size={12} color="var(--color-success)" />
              <span>FHIR / HL7</span>
            </div>
            <div className={styles.complianceBadge}>
              <CheckCircle2 size={12} color="var(--color-success)" />
              <span>Zero PHI Training</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
