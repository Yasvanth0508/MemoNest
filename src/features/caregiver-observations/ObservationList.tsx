"use client";

import * as React from "react";
import Link from "next/link";
import { CaregiverObservation, ObservationCategory } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AlertTriangle,
  Brain,
  Activity,
  Pill,
  Smile,
  Utensils,
  ClipboardList,
  Clock,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  HelpCircle,
  FileSearch,
  Search,
  Check,
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";
import styles from "./ObservationList.module.css";

export interface ObservationListProps {
  observations: CaregiverObservation[];
  isLoading?: boolean;
  limit?: number;
  showFilters?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const CATEGORY_MAP: Record<
  ObservationCategory,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; variant: "danger" | "warning" | "default" | "secondary" | "success" }
> = {
  fall: { label: "Fall Incident", icon: AlertTriangle, variant: "danger" },
  confusion: { label: "Confusion / Cognition", icon: Brain, variant: "warning" },
  mobility: { label: "Mobility & Transfers", icon: Activity, variant: "default" },
  drowsiness: { label: "Drowsiness / Sedation", icon: Clock, variant: "warning" },
  medication_adherence: { label: "Medication Intake", icon: Pill, variant: "secondary" },
  behavior: { label: "Mood & Behavior", icon: Smile, variant: "default" },
  appetite: { label: "Meal & Hydration", icon: Utensils, variant: "success" },
  general: { label: "General Check", icon: ClipboardList, variant: "default" },
};

function formatObservationDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const timeStr = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Yesterday at ${timeStr}`;
    }

    return `${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} • ${timeStr}`;
  } catch {
    return dateString;
  }
}

export function ObservationList({
  observations = [],
  isLoading = false,
  limit,
  showFilters = true,
  className,
}: ObservationListProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredObservations = React.useMemo(() => {
    let list = [...observations];

    if (selectedCategory !== "all") {
      list = list.filter((obs) => obs.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (obs) =>
          obs.note?.toLowerCase().includes(q) ||
          obs.summary?.toLowerCase().includes(q) ||
          obs.location?.toLowerCase().includes(q) ||
          obs.actionTaken?.toLowerCase().includes(q)
      );
    }

    if (limit && limit > 0) {
      return list.slice(0, limit);
    }

    return list;
  }, [observations, selectedCategory, searchQuery, limit]);

  // Counts for category badges
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: observations.length };
    observations.forEach((obs) => {
      counts[obs.category] = (counts[obs.category] || 0) + 1;
    });
    return counts;
  }, [observations]);

  return (
    <div className={clsx(styles.container, className)}>
      {showFilters && (
        <div className={styles.controlsBar}>
          <div className={styles.filterRow}>
            <div className={styles.categoryChips}>
              <button
                type="button"
                className={clsx(
                  styles.chip,
                  selectedCategory === "all" && styles.chipActive
                )}
                onClick={() => setSelectedCategory("all")}
              >
                <span>All Signals</span>
                <span className={styles.chipCount}>{categoryCounts.all || 0}</span>
              </button>

              <button
                type="button"
                className={clsx(
                  styles.chip,
                  selectedCategory === "fall" && styles.chipActive
                )}
                onClick={() => setSelectedCategory("fall")}
              >
                <AlertTriangle size={13} />
                <span>Falls</span>
                <span className={styles.chipCount}>{categoryCounts.fall || 0}</span>
              </button>

              <button
                type="button"
                className={clsx(
                  styles.chip,
                  selectedCategory === "mobility" && styles.chipActive
                )}
                onClick={() => setSelectedCategory("mobility")}
              >
                <Activity size={13} />
                <span>Mobility</span>
                <span className={styles.chipCount}>{categoryCounts.mobility || 0}</span>
              </button>

              <button
                type="button"
                className={clsx(
                  styles.chip,
                  selectedCategory === "confusion" && styles.chipActive
                )}
                onClick={() => setSelectedCategory("confusion")}
              >
                <Brain size={13} />
                <span>Confusion</span>
                <span className={styles.chipCount}>{categoryCounts.confusion || 0}</span>
              </button>

              <button
                type="button"
                className={clsx(
                  styles.chip,
                  selectedCategory === "drowsiness" && styles.chipActive
                )}
                onClick={() => setSelectedCategory("drowsiness")}
              >
                <Clock size={13} />
                <span>Drowsiness</span>
                <span className={styles.chipCount}>{categoryCounts.drowsiness || 0}</span>
              </button>

              <button
                type="button"
                className={clsx(
                  styles.chip,
                  selectedCategory === "appetite" && styles.chipActive
                )}
                onClick={() => setSelectedCategory("appetite")}
              >
                <Utensils size={13} />
                <span>Meals / Hydration</span>
                <span className={styles.chipCount}>{categoryCounts.appetite || 0}</span>
              </button>
            </div>

            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <Input
                type="text"
                placeholder="Search notes, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>
      )}

      {/* Observations Stream */}
      {filteredObservations.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No caregiver observations found"
          description={
            searchQuery
              ? `No observation notes matched "${searchQuery}". Try clearing search filters.`
              : "No caregiver observations have been logged for this filter category yet."
          }
        />
      ) : (
        <div className={styles.list}>
          {filteredObservations.map((obs) => {
            const catConfig = CATEGORY_MAP[obs.category] || {
              label: obs.category,
              icon: ClipboardList,
              variant: "default" as const,
            };
            const CatIcon = catConfig.icon;

            const isReviewed = obs.status === "reviewed";

            return (
              <div key={obs.id} className={styles.observationCard}>
                <div className={styles.feedRow}>
                  <Badge variant={catConfig.variant}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <CatIcon size={12} />
                      {catConfig.label}
                    </span>
                  </Badge>
                  <span className={styles.timestamp}>
                    <Clock size={12} />
                    <span>{formatObservationDate(obs.timestamp)}</span>
                  </span>
                  <span className={styles.oneLineNote} title={obs.note}>
                    {obs.summary || obs.note}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
