"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Activity } from "lucide-react";
import styles from "./ConditionsList.module.css";

export interface ConditionDisplayItem {
  id: string;
  name: string;
  diagnosedYear: number;
  status: "active" | "managed" | "historical";
  badgeVariant: "default" | "secondary" | "warning" | "danger" | "success";
  treatment: string;
  evidenceId?: string;
}

export const CONDITIONS_DATA: ConditionDisplayItem[] = [
  {
    id: "cond-1",
    name: "Essential Hypertension",
    diagnosedYear: 2014,
    status: "managed",
    badgeVariant: "success",
    treatment: "Amlodipine 5mg Daily",
    evidenceId: "ev-htn-rx-01",
  },
  {
    id: "cond-2",
    name: "Type 2 Diabetes Mellitus",
    diagnosedYear: 2016,
    status: "managed",
    badgeVariant: "success",
    treatment: "Metformin 500mg BID",
    evidenceId: "ev-lab-metabolic-01",
  },
  {
    id: "cond-3",
    name: "Ischemic Stroke (2018)",
    diagnosedYear: 2018,
    status: "historical",
    badgeVariant: "warning",
    treatment: "Aspirin 81mg & Atorvastatin 20mg",
    evidenceId: "ev-stroke-discharge-01",
  },
  {
    id: "cond-4",
    name: "Knee Osteoarthritis",
    diagnosedYear: 2022,
    status: "active",
    badgeVariant: "danger",
    treatment: "Rolling walker assistance",
    evidenceId: "ev-walker-mobility-01",
  },
  {
    id: "cond-5",
    name: "Mild Cognitive Impairment",
    diagnosedYear: 2024,
    status: "active",
    badgeVariant: "danger",
    treatment: "Donepezil 5mg Nightly",
    evidenceId: "ev-neuro-consult-01",
  },
];

export function ConditionsList() {
  return (
    <div className={styles.conditionsContainer}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={18} style={{ color: "var(--color-primary)" }} />
          <h3 className={styles.title}>Conditions</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patient/memory">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </Button>
      </div>

      <div className={styles.conditionsList}>
        {CONDITIONS_DATA.map((cond) => (
          <div key={cond.id} className={styles.conditionItem}>
            <div className={styles.conditionInfo}>
              <h4 className={styles.conditionName}>{cond.name}</h4>
              <p className={styles.conditionMeta}>
                Diagnosed {cond.diagnosedYear} • {cond.treatment}
              </p>
            </div>
            <div className={styles.badges}>
              <Badge variant={cond.badgeVariant}>
                {cond.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
