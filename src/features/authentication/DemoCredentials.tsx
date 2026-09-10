"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";
import { useAuth } from "./useAuth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User as UserIcon,
  HeartHandshake,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Loader2,
  Mail,
  AlertCircle,
  X,
} from "lucide-react";
import clsx from "clsx";
import styles from "./DemoCredentials.module.css";

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  workspace: string;
  description: string;
  badgeVariant: "default" | "secondary" | "outline" | "success" | "warning";
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "user-patient-001",
    name: "Ravi Kumar",
    email: "ravi@healthmemory.demo",
    role: "patient",
    roleLabel: "Patient",
    title: "Patient (72yo, Mild Cognitive Impairment & Polymorbidity)",
    workspace: "/patient",
    description:
      "Access personal longitudinal health memory, simplified medication schedules, and review granted permissions.",
    badgeVariant: "default",
    icon: UserIcon,
  },
  {
    id: "user-clinician-001",
    name: "Dr. Rajesh Sharma",
    email: "dr.sharma@hospital.demo",
    role: "doctor",
    roleLabel: "Doctor",
    title: "MD, Geriatric & Internal Medicine (MetroHealth)",
    workspace: "/clinician",
    description:
      "Review AI clinical briefs, inspect multi-source timeline events, and evaluate flagged diagnostic risks.",
    badgeVariant: "secondary",
    icon: Stethoscope,
  },
  {
    id: "user-caregiver-001",
    name: "Anita Desai",
    email: "anita@caregiver.demo",
    role: "caregiver",
    roleLabel: "Caregiver",
    title: "Certified Nursing Assistant (Grace Senior Home Care)",
    workspace: "/caregiver",
    description:
      "Log daily observations, record meal adherence, and submit patient behavioral notes to the shared memory.",
    badgeVariant: "warning",
    icon: HeartHandshake,
  },
];

export interface DemoCredentialsProps {
  onSelectPersona?: (persona: DemoPersona) => void;
  className?: string;
}

export function DemoCredentials({
  onSelectPersona,
  className,
}: DemoCredentialsProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [loadingPersonaId, setLoadingPersonaId] = React.useState<string | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

  const handleLoginAsPersona = async (persona: DemoPersona) => {
    setLoadingPersonaId(persona.id);
    setError(null);

    try {
      if (onSelectPersona) {
        onSelectPersona(persona);
      }
      await login(persona.email, persona.role);
      router.push(persona.workspace);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : `Failed to authenticate as ${persona.name}.`;
      setError(msg);
      setLoadingPersonaId(null);
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      {/* Intro Panel */}
      <div className={styles.intro}>
        <Sparkles size={18} className={styles.introIcon} />
        <div className={styles.introText}>
          <span className={styles.introTitle}>One-Click Demo</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={16} />
          <span className={styles.errorText}>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className={styles.errorClose}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Persona Cards List */}
      <div className={styles.personaList} role="list" aria-label="Demo personas">
        {DEMO_PERSONAS.map((persona) => {
          const isLoading = loadingPersonaId === persona.id;
          const isAnyLoading = loadingPersonaId !== null;
          const Icon = persona.icon;

          return (
            <div
              key={persona.id}
              role="listitem"
              tabIndex={0}
              className={clsx(
                styles.personaCard,
                isLoading && styles.personaCardActive
              )}
              onClick={() => {
                if (!isAnyLoading) {
                  handleLoginAsPersona(persona);
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isAnyLoading) {
                  e.preventDefault();
                  handleLoginAsPersona(persona);
                }
              }}
            >
              <div className={styles.personaHeader}>
                <div className={styles.personaMainInfo}>
                  <div className={styles.personaAvatarWrapper}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.personaDetails}>
                    <span className={styles.personaName}>{persona.name}</span>
                    <span className={styles.personaTitle}>{persona.roleLabel}</span>
                  </div>
                </div>
                <Badge variant={persona.badgeVariant}>{persona.roleLabel}</Badge>
              </div>

              <div className={styles.personaFooter}>
                <div className={styles.personaMeta}>
                  <span className={styles.metaEmail}>
                    <Mail size={12} />
                    {persona.email}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isAnyLoading}
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoginAsPersona(persona);
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className={styles.spin} />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
