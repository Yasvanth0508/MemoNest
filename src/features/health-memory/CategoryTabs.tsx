"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./CategoryTabs.module.css";

export type MemoryCategory =
  | "all"
  | "medical_history"
  | "medication_memory"
  | "cognitive_memory"
  | "functional_memory"
  | "caregiver_observations"
  | "hospitalizations"
  | "labs";

export interface CategoryTabItem {
  id: MemoryCategory;
  label: string;
  count?: number;
}

export const MEMORY_CATEGORIES: CategoryTabItem[] = [
  { id: "all", label: "All" },
  { id: "medical_history", label: "Medical" },
  { id: "medication_memory", label: "Meds" },
  { id: "cognitive_memory", label: "Cognitive" },
  { id: "functional_memory", label: "Mobility" },
  { id: "caregiver_observations", label: "Notes" },
  { id: "labs", label: "Labs" },
];

export interface CategoryTabsProps {
  activeCategory: MemoryCategory;
  onSelectCategory: (category: MemoryCategory) => void;
  categoryCounts?: Record<string, number>;
}

export function CategoryTabs({
  activeCategory,
  onSelectCategory,
  categoryCounts = {},
}: CategoryTabsProps) {
  return (
    <div className={styles.tabsContainer} role="tablist" aria-label="Health Memory Categories">
      {MEMORY_CATEGORIES.map((tab) => {
        const isActive = activeCategory === tab.id;
        const count = categoryCounts[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={clsx(styles.tabButton, isActive && styles.tabActive)}
            onClick={() => onSelectCategory(tab.id)}
          >
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
                className={clsx(
                  styles.countPill,
                  isActive && styles.countPillActive
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
