"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, Clock, Pill, AlertTriangle } from "lucide-react";
import styles from "./QuickActions.module.css";

export const QUICK_ACTIONS = [
  {
    title: "Health Memory",
    subtitle: "Records",
    href: "/patient/memory",
    icon: Activity,
  },
  {
    title: "Timeline",
    subtitle: "Chronology",
    href: "/patient/timeline",
    icon: Clock,
  },
  {
    title: "Medications",
    subtitle: "7 active",
    href: "/patient/medications",
    icon: Pill,
  },
  {
    title: "Risks",
    subtitle: "2 alerts",
    href: "/patient/risks",
    icon: AlertTriangle,
  },
];

export function QuickActions() {
  return (
    <div className={styles.actionsGrid}>
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.title} href={action.href} className={styles.actionButton}>
            <div className={styles.iconCircle}>
              <Icon size={20} />
            </div>
            <div className={styles.textGroup}>
              <h4 className={styles.actionTitle}>{action.title}</h4>
              <p className={styles.actionSubtitle}>{action.subtitle}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
