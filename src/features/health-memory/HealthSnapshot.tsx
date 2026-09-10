"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, Pill, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import styles from "./HealthSnapshot.module.css";

export interface SnapshotItem {
  count: number | string;
  label: string;
  subtext: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  href: string;
}

export interface HealthSnapshotProps {
  conditionsCount?: number;
  medsCount?: number;
  eventsCount?: number;
  risksCount?: number;
}

export function HealthSnapshot({
  conditionsCount = 6,
  medsCount = 7,
  eventsCount = 4,
  risksCount = 2,
}: HealthSnapshotProps) {
  const items: SnapshotItem[] = [
    {
      count: conditionsCount,
      label: "Conditions",
      subtext: "",
      icon: Activity,
      iconClass: styles.iconConditions,
      href: "/patient/memory",
    },
    {
      count: medsCount,
      label: "Meds",
      subtext: "",
      icon: Pill,
      iconClass: styles.iconMeds,
      href: "/patient/medications",
    },
    {
      count: eventsCount,
      label: "Events",
      subtext: "",
      icon: Clock,
      iconClass: styles.iconEvents,
      href: "/patient/timeline",
    },
    {
      count: risksCount,
      label: "Risks",
      subtext: "",
      icon: AlertTriangle,
      iconClass: styles.iconRisks,
      href: "/patient/risks",
    },
  ];

  return (
    <div className={styles.grid}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.label} href={item.href} className={styles.card}>
            <div className={styles.topRow}>
              <div className={clsx(styles.iconWrapper, item.iconClass)}>
                <Icon size={22} />
              </div>
              <ArrowUpRight size={16} style={{ color: "var(--color-text-secondary)" }} />
            </div>
            <div>
              <div className={styles.count}>{item.count}</div>
              <div className={styles.label}>{item.label}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
