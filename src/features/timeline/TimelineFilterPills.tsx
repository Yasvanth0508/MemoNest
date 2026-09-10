"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./TimelineFilterPills.module.css";

export type TimelineFilter =
  | "all"
  | "medical"
  | "medication"
  | "cognitive"
  | "functional"
  | "falls"
  | "caregiver"
  | "labs";

export interface FilterPillItem {
  id: TimelineFilter;
  label: string;
}

export const TIMELINE_FILTERS: FilterPillItem[] = [
  { id: "all", label: "All" },
  { id: "medical", label: "Medical" },
  { id: "medication", label: "Meds" },
  { id: "cognitive", label: "Cognitive" },
  { id: "functional", label: "Mobility" },
  { id: "falls", label: "Falls" },
  { id: "caregiver", label: "Caregiver" },
  { id: "labs", label: "Labs" },
];

export interface TimelineFilterPillsProps {
  activeFilter: TimelineFilter;
  onSelectFilter: (filter: TimelineFilter) => void;
}

export function TimelineFilterPills({
  activeFilter,
  onSelectFilter,
}: TimelineFilterPillsProps) {
  return (
    <div className={styles.pillsContainer} role="toolbar" aria-label="Timeline Filters">
      {TIMELINE_FILTERS.map((pill) => {
        const isActive = activeFilter === pill.id;
        return (
          <button
            key={pill.id}
            type="button"
            className={clsx(styles.pill, isActive && styles.pillActive)}
            onClick={() => onSelectFilter(pill.id)}
            aria-pressed={isActive}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
