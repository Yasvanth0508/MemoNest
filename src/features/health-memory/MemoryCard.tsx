"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileSearch } from "lucide-react";
import styles from "./MemoryCard.module.css";

export interface MemoryCardData {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  date: string;
  description: string;
  sourceDocument: string;
  author?: string;
  confidenceScore: number;
  evidenceId?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
  status?: string;
}

export interface MemoryCardProps {
  data: MemoryCardData;
  onViewEvidence: (evidenceId: string) => void;
}

export function MemoryCard({ data, onViewEvidence }: MemoryCardProps) {
  return (
    <div className={styles.memoryCard}>
      <div className={styles.topRow}>
        <div className={styles.badgeGroup}>
          <Badge variant={data.badgeVariant || "secondary"}>
            {data.categoryLabel}
          </Badge>
          <Badge variant="outline">{data.sourceDocument}</Badge>
        </div>
        <span className={styles.date}>{data.date}</span>
      </div>

      <div className={styles.titleRow}>
        <h4 className={styles.title}>{data.title}</h4>
      </div>

      <p className={styles.description}>{data.description}</p>

      {data.evidenceId && (
        <div className={styles.footer}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewEvidence(data.evidenceId!)}
            aria-label="Evidence"
          >
            <FileSearch size={14} />
            <span>Evidence</span>
          </Button>
        </div>
      )}
    </div>
  );
}
