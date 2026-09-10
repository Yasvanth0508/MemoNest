"use client";

import * as React from "react";
import { TimelineEvent } from "@/types";
import { TimelineCard } from "./TimelineCard";
import styles from "./TimelineYearGroup.module.css";

export interface TimelineYearGroupProps {
  year: number;
  events: TimelineEvent[];
  onViewEvidence: (evidenceId: string) => void;
}

export function TimelineYearGroup({
  year,
  events,
  onViewEvidence,
}: TimelineYearGroupProps) {
  return (
    <div className={styles.yearSection}>
      <div className={styles.yearHeader}>
        <div className={styles.yearBadge}>{year}</div>
        <div className={styles.yearLine} />
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
          {events.length} {events.length === 1 ? "Event" : "Events"}
        </span>
      </div>

      <div className={styles.eventsColumn}>
        {events.map((event) => (
          <TimelineCard
            key={event.id}
            event={event}
            onViewEvidence={onViewEvidence}
          />
        ))}
      </div>
    </div>
  );
}
