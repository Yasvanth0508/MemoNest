"use client";

import * as React from "react";
import {
  Database,
  Bot,
  Sparkles,
  ShieldCheck,
  FileSearch,
  Lock,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import styles from "./CapabilitiesSection.module.css";

interface Pillar {
  title: string;
  badge: string;
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  feature: string;
}

const PILLARS: Pillar[] = [
  {
    title: "Persistent Memory",
    badge: "Longitudinal",
    badgeVariant: "default",
    icon: Database,
    feature: "Decade clinical continuity",
  },
  {
    title: "AI Agents",
    badge: "5 Specialists",
    badgeVariant: "secondary",
    icon: Bot,
    feature: "Parallel clinical surveillance",
  },
  {
    title: "Clinical Brief",
    badge: "Point of Care",
    badgeVariant: "warning",
    icon: Sparkles,
    feature: "15-second point-of-care summary",
  },
  {
    title: "Consent Matrix",
    badge: "Patient Governed",
    badgeVariant: "success",
    icon: ShieldCheck,
    feature: "Granular category permissions",
  },
  {
    title: "Audit Trail",
    badge: "Zero Trust",
    badgeVariant: "default",
    icon: Lock,
    feature: "Immutable tamper-evident logging",
  },
  {
    title: "Provenance",
    badge: "Evidence Backed",
    badgeVariant: "outline",
    icon: FileSearch,
    feature: "100% source-cited evidence",
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className={styles.section} aria-labelledby="capabilities-title">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <Layers size={14} />
            <span>Capabilities</span>
          </div>
          <h2 id="capabilities-title" className={styles.title}>
            Capabilities
          </h2>
        </div>

        {/* 6 Core Pillars Grid */}
        <div className={styles.grid}>
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className={styles.capabilityCard}>
                <CardHeader className={styles.cardHeaderCustom}>
                  <div className={styles.cardTopRow}>
                    <div className={styles.iconWrapper} aria-hidden="true">
                      <Icon size={22} />
                    </div>
                    <Badge variant={pillar.badgeVariant || "default"}>
                      {pillar.badge}
                    </Badge>
                  </div>
                  <CardTitle className={styles.cardTitle}>{pillar.title}</CardTitle>
                </CardHeader>

                <CardContent className={styles.cardContentCustom}>
                  <ul className={styles.featuresList}>
                    <li className={styles.featureItem}>
                      <CheckCircle2 size={15} className={styles.featureCheck} />
                      <span>{pillar.feature}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
