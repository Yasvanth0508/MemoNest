"use client";

import * as React from "react";
import Link from "next/link";
import {
  Stethoscope,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import styles from "./RoleViewsSection.module.css";

interface RoleViewData {
  id: string;
  name: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  chips: string[];
  mockTitle: string;
  mockSubtitle: string;
  mockHighlightTitle: string;
  mockHighlightStatus: string;
  mockHighlightStatusVariant: "danger" | "warning" | "success" | "secondary";
  mockListItems: { label: string; tag: string }[];
  mockFooterAction: string;
}

const ROLE_VIEWS: RoleViewData[] = [
  {
    id: "clinician",
    name: "Clinician",
    badge: "Clinical",
    badgeVariant: "default",
    icon: Stethoscope,
    chips: [
      "15-Second Clinical Brief",
      "Correlated Risk Signals",
      "Decade Timeline",
      "1-Click Evidence Citations",
    ],
    mockTitle: "Clinical Brief",
    mockSubtitle: "Point of Care View",
    mockHighlightTitle: "Correlated Risk Detection",
    mockHighlightStatus: "High Priority",
    mockHighlightStatusVariant: "danger",
    mockListItems: [
      { label: "Cerebrovascular History", tag: "Synthesized" },
      { label: "Recent Sedative Introduction", tag: "Recent Change" },
      { label: "Morning Ataxia Signal", tag: "Active Signal" },
    ],
    mockFooterAction: "Provenance Citations",
  },
  {
    id: "caregiver",
    name: "Caregiver",
    badge: "Care Team",
    badgeVariant: "success",
    icon: HeartHandshake,
    chips: [
      "Rapid Observation Logging",
      "Mobility & Fall Incident Tracking",
      "Medication Compliance Checks",
      "Care Coordination Sync",
    ],
    mockTitle: "Care Log",
    mockSubtitle: "Observation Interface",
    mockHighlightTitle: "Incident Logged",
    mockHighlightStatus: "Memory Synced",
    mockHighlightStatusVariant: "success",
    mockListItems: [
      { label: "Transfer Imbalance Logged", tag: "Observation" },
      { label: "Regimen Compliance Complete", tag: "Verified" },
      { label: "Assistive Device Utilized", tag: "Tracked" },
    ],
    mockFooterAction: "New Observation Log",
  },
  {
    id: "patient",
    name: "Patient",
    badge: "Sovereign",
    badgeVariant: "outline",
    icon: ShieldCheck,
    chips: [
      "Plain-Language Health Summary",
      "Category-by-Category Consent",
      "Real-Time Permission Revocation",
      "Immutable Access Audit Log",
    ],
    mockTitle: "Consent Matrix",
    mockSubtitle: "Governance Console",
    mockHighlightTitle: "Active Permissions",
    mockHighlightStatus: "Enforced",
    mockHighlightStatusVariant: "secondary",
    mockListItems: [
      { label: "Primary Care: Full Clinical", tag: "Active (30d)" },
      { label: "Pharmacy: Medication Ledger", tag: "Active" },
      { label: "Genetic Records: Restricted", tag: "Blocked" },
    ],
    mockFooterAction: "Access Audit Log",
  },
];

export function RoleViewsSection() {
  const [activeId, setActiveId] = React.useState<string>("clinician");
  const activeRole = ROLE_VIEWS.find((r) => r.id === activeId) || ROLE_VIEWS[0];
  const ActiveIcon = activeRole.icon;

  return (
    <section id="roles" className={styles.section} aria-labelledby="roles-title">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <UserCheck size={14} />
            <span>Portals</span>
          </div>
          <h2 id="roles-title" className={styles.title}>
            Workspaces
          </h2>
        </div>

        {/* Tab Selection Row */}
        <div className={styles.tabListCustom} role="tablist">
          {ROLE_VIEWS.map((role) => {
            const Icon = role.icon;
            const isActive = role.id === activeId;
            return (
              <button
                key={role.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(role.id)}
                className={`${styles.roleTabButton} ${
                  isActive ? styles.roleTabButtonActive : ""
                }`}
              >
                <Icon size={16} />
                <span>{role.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Display Showcase */}
        <div className={styles.roleDisplayCard}>
          {/* Left Column: Role Details & Chips */}
          <div className={styles.roleInfo}>
            <div className={styles.roleHeaderGroup}>
              <Badge variant={activeRole.badgeVariant}>{activeRole.badge}</Badge>
              <h3 className={styles.roleTitle}>{activeRole.name}</h3>
            </div>

            <ul className={styles.featuresList}>
              {activeRole.chips.map((chip) => (
                <li key={chip} className={styles.featureItem}>
                  <CheckCircle2 size={16} className={styles.featureCheck} />
                  <span>{chip}</span>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <Button asChild variant="primary" size="md">
                <Link href="/login">
                  Sign In
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/signup">
                  Register
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Clean Mockup Card */}
          <div className={styles.previewUiCard}>
            <div className={styles.previewHeader}>
              <div className={styles.previewTitleGroup}>
                <ActiveIcon size={18} />
                <span>{activeRole.mockTitle}</span>
              </div>
              <Badge variant="outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>
                Role Interface
              </Badge>
            </div>

            <div className={styles.previewBody}>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                {activeRole.mockSubtitle}
              </div>

              <div className={styles.mockHighlightBox}>
                <div className={styles.mockHighlightTitle}>
                  <span>{activeRole.mockHighlightTitle}</span>
                  <Badge variant={activeRole.mockHighlightStatusVariant}>
                    {activeRole.mockHighlightStatus}
                  </Badge>
                </div>
              </div>

              <div className={styles.mockItemsList}>
                {activeRole.mockListItems.map((item, idx) => (
                  <div key={idx} className={styles.mockItemRow}>
                    <span>{item.label}</span>
                    <Badge variant="outline" style={{ fontSize: "10px" }}>
                      {item.tag}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.previewFooter}>
              <span>{activeRole.mockFooterAction}</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
