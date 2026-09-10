"use client";

import * as React from "react";
import { TimelineEvent } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  FileSearch,
  AlertTriangle,
  FileText,
  Activity,
  HeartHandshake,
  Pill,
  Sparkles,
  Layers,
} from "lucide-react";
import clsx from "clsx";
import styles from "./TimelineCard.module.css";

export interface TimelineCardProps {
  event: TimelineEvent;
  onViewEvidence: (evidenceId: string) => void;
}

export function TimelineCard({ event, onViewEvidence }: TimelineCardProps) {
  const getSeverityBadgeVariant = (
    sev?: string
  ): "danger" | "warning" | "secondary" | "default" => {
    switch (sev) {
      case "critical":
        return "danger";
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
      default:
        return "secondary";
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "medical":
        return Activity;
      case "medication":
        return Pill;
      case "cognitive":
        return Sparkles;
      case "functional":
        return Layers;
      case "caregiver":
        return HeartHandshake;
      case "hospitalization":
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const CategoryIcon = getCategoryIcon(event.category);

  return (
    <div
      className={clsx(
        styles.card,
        event.severity === "critical" && styles.criticalCard,
        event.severity === "high" && styles.highCard,
        event.severity === "medium" && styles.mediumCard,
        event.severity === "low" && styles.lowCard
      )}
    >
      <div className={styles.topRow}>
        <div className={styles.badgeGroup}>
          <Badge variant="secondary">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <CategoryIcon size={12} />
              {event.category.toUpperCase()}
            </span>
          </Badge>

          {event.severity && (
            <Badge variant={getSeverityBadgeVariant(event.severity)}>
              {event.severity.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className={styles.dateGroup}>
          <Calendar size={13} />
          <span>{event.date}</span>
        </div>
      </div>

      <div className={styles.titleRow}>
        <h4 className={styles.title}>{event.title}</h4>
      </div>

      <p className={styles.description}>{event.description}</p>

      {/* Evidence Button */}
      {event.evidenceId && (
        <div className={styles.evidencePreview}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewEvidence(event.evidenceId!)}
            style={{ background: "#ffffff" }}
          >
            <FileSearch size={14} />
            <span>Evidence</span>
          </Button>
        </div>
      )}
    </div>
  );
}
