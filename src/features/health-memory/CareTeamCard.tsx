"use client";

import * as React from "react";
import {
  Stethoscope,
  HeartHandshake,
  Phone,
  Building,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import styles from "./CareTeamCard.module.css";

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  organization: string;
  phone: string;
  availability: string;
  badge: string;
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  initials: string;
}

export const CARE_TEAM_MEMBERS: CareTeamMember[] = [
  {
    id: "member-1",
    name: "Dr. Rajesh Sharma",
    role: "Primary Care Physician",
    title: "Geriatric Medicine Specialist",
    organization: "MetroHealth Senior Clinic",
    phone: "+1-555-0140",
    availability: "Mon – Thu (Clinic)",
    badge: "Primary Clinician",
    badgeVariant: "default",
    icon: Stethoscope,
    initials: "RS",
  },
  {
    id: "member-3",
    name: "Anita Desai",
    role: "In-Home Caregiver",
    title: "Certified Nursing Assistant (CNA)",
    organization: "Compassionate Home Care",
    phone: "+1-555-0188",
    availability: "Daily 8 AM – 4 PM",
    badge: "Daily Logging Active",
    badgeVariant: "warning",
    icon: HeartHandshake,
    initials: "AD",
  },
];

export function CareTeamSection() {
  return (
    <div className={styles.teamGrid}>
      {CARE_TEAM_MEMBERS.map((member) => {
        return (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>{member.initials}</div>
              <div className={styles.nameGroup}>
                <h4 className={styles.memberName}>{member.name}</h4>
                <p className={styles.memberRole}>{member.role}</p>
              </div>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <Building size={14} className={styles.detailIcon} />
                <span>{member.organization}</span>
              </div>
              <div className={styles.detailItem}>
                <Phone size={14} className={styles.detailIcon} />
                <span>{member.phone}</span>
              </div>
              <div className={styles.detailItem}>
                <Clock size={14} className={styles.detailIcon} />
                <span>{member.availability}</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <Badge variant={member.badgeVariant || "default"}>
                {member.badge}
              </Badge>
              <span title="Verified Care Team Member">
                <ShieldCheck size={16} style={{ color: "var(--color-success)" }} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
