"use client";

import * as React from "react";
import { Patient } from "@/types";
import {
  AlertTriangle,
  FileSearch,
  HeartHandshake,
  Pill,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import styles from "./PatientHeader.module.css";

export interface HealthBadgeItem {
  label: string;
  variant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface ConsentStatusItem {
  label: string;
  type: "success" | "warning" | "danger";
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface PatientHeaderProps {
  patient?: Partial<Patient>;
  doctorName?: string;
  activeMedsCount?: number;
  healthBadges?: HealthBadgeItem[];
  consentStatus?: ConsentStatusItem;
  onViewEvidence?: () => void;
  onReportObservation?: () => void;
  className?: string;
}

export function PatientHeader({
  patient = {
    id: "PT-001",
    name: "Ravi Kumar",
    age: 74,
    gender: "Male",
    primaryDoctor: "Dr. Rajesh Sharma",
    bloodType: "B+",
  },
  doctorName,
  activeMedsCount = 7,
  healthBadges,
  consentStatus = {
    label: "Consent Active: Full Access",
    type: "success",
    icon: ShieldCheck,
  },
  onViewEvidence,
  onReportObservation,
  className,
}: PatientHeaderProps) {
  const pName = patient.name || "Ravi Kumar";
  const pAge = patient.age || 74;
  const pGender = patient.gender || "Male";
  const genderShort = pGender.toLowerCase().startsWith("m") ? "M" : pGender.toLowerCase().startsWith("f") ? "F" : pGender;
  const pDoctor = (doctorName || patient.primaryDoctor || "Dr. Sharma")
    .replace("Dr. Rajesh Sharma", "Dr. Sharma")
    .replace("Rajesh ", "");

  // Default badges: Stroke, Fall Risk, 7 Meds
  const defaultBadges: HealthBadgeItem[] = React.useMemo(() => {
    if (healthBadges && healthBadges.length > 0) {
      return healthBadges;
    }
    return [
      {
        label: "Stroke",
        variant: "warning",
        icon: AlertTriangle,
      },
      {
        label: "Fall Risk",
        variant: "danger",
        icon: AlertTriangle,
      },
      {
        label: `${activeMedsCount} Meds`,
        variant: "secondary",
        icon: Pill,
      },
    ];
  }, [healthBadges, activeMedsCount]);

  // Initials for avatar
  const initials = React.useMemo(() => {
    const parts = pName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return pName.substring(0, 2).toUpperCase();
  }, [pName]);

  const ConsentIcon = consentStatus.icon || ShieldCheck;

  return (
    <div className={clsx(styles.headerCard, className)}>
      {/* Main Row: Minimal Patient Info & Quick Action Buttons */}
      <div className={styles.mainRow}>
        <div className={styles.patientIdentity}>
          <div className={styles.avatar} aria-hidden="true">
            {initials}
          </div>

          <div className={styles.patientDetails}>
            <div className={styles.nameRow}>
              <h1 className={styles.patientName}>
                {pName} • {pAge}{genderShort} • {pDoctor}
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewEvidence}
            aria-label="Evidence"
          >
            <FileSearch size={15} />
            <span>Evidence</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onReportObservation}
            aria-label="Report"
          >
            <HeartHandshake size={15} />
            <span>Report</span>
          </Button>
        </div>
      </div>

      {/* Badges Row */}
      <div className={styles.badgeRow}>
        <div className={styles.healthBadges}>
          {defaultBadges.map((badge, idx) => {
            const BadgeIcon = badge.icon;
            return (
              <Badge key={idx} variant={badge.variant || "default"}>
                <span className={styles.badgeContent}>
                  {BadgeIcon && <BadgeIcon size={12} />}
                  <span>{badge.label}</span>
                </span>
              </Badge>
            );
          })}
        </div>

        {consentStatus && (
          <div
            className={clsx(
              styles.consentStatusBadge,
              styles[`consentStatus_${consentStatus.type}`]
            )}
            title="Consent status"
          >
            <ConsentIcon size={13} />
            <span>{consentStatus.label.includes("Active") ? "Consent Active" : consentStatus.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
