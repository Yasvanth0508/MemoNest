"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import clsx from "clsx";
import styles from "./RecentEventsList.module.css";

export interface RecentEventDisplay {
  id: string;
  timeLabel: string;
  date: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  category: string;
}

export const RECENT_EVENTS_DATA: RecentEventDisplay[] = [
  {
    id: "evt-today",
    timeLabel: "Today (08:30 AM)",
    date: "2026-09-10",
    title: "Bed-to-Chair Fall",
    description: "Transfer fall; minor knee bruise. 2nd fall in 24h.",
    severity: "critical",
    category: "Fall",
  },
  {
    id: "evt-yesterday",
    timeLabel: "Yesterday (07:15 AM)",
    date: "2026-09-09",
    title: "Bathroom Transit Fall",
    description: "Morning fall near bathroom; helped up safely.",
    severity: "warning",
    category: "Fall",
  },
  {
    id: "evt-sedative",
    timeLabel: "5 Days Ago",
    date: "2026-09-05",
    title: "Zolpidem 5mg Added",
    description: "Added for sleep; elevated fall risk flagged.",
    severity: "warning",
    category: "Meds",
  },
  {
    id: "evt-lab",
    timeLabel: "Aug 28, 2026",
    date: "2026-08-28",
    title: "Metabolic Panel",
    description: "HbA1c 7.4%, Fasting Glucose 132 mg/dL.",
    severity: "info",
    category: "Labs",
  },
];

export function RecentEventsList() {
  return (
    <div className={styles.eventsContainer}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={18} style={{ color: "var(--color-primary)" }} />
          <h3 className={styles.title}>Recent Events</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patient/timeline">
            <span>View Timeline</span>
            <ArrowRight size={14} />
          </Link>
        </Button>
      </div>

      <div className={styles.eventsList}>
        {RECENT_EVENTS_DATA.map((evt) => (
          <div key={evt.id} className={styles.eventItem}>
            <div
              className={clsx(
                styles.eventDot,
                evt.severity === "critical" && styles.dotCritical,
                evt.severity === "warning" && styles.dotWarning,
                evt.severity === "info" && styles.dotInfo
              )}
            />
            <div className={styles.eventContent}>
              <div className={styles.eventTopRow}>
                <h4 className={styles.eventTitle}>{evt.title}</h4>
                <span className={styles.eventDate}>{evt.timeLabel}</span>
              </div>
              <p className={styles.eventDescription}>{evt.description}</p>
              <div style={{ marginTop: 4 }}>
                <Badge variant={evt.severity === "critical" ? "danger" : evt.severity === "warning" ? "warning" : "secondary"}>
                  {evt.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
