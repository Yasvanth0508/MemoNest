"use client";

import * as React from "react";
import Link from "next/link";
import { Patient, CaregiverObservation } from "@/types";
import { caregiverService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ObservationList } from "./ObservationList";
import {
  AlertTriangle,
  ClipboardEdit,
  TrendingUp,
  CheckCircle2,
  Check,
} from "lucide-react";
import clsx from "clsx";
import styles from "./CaregiverDashboard.module.css";

export interface ChecklistItem {
  id: string;
  title: string;
  timeSlot: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  incidentFlag?: boolean;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: "check-meds",
    title: "Meds 08:00",
    timeSlot: "08:00",
    description: "",
    completed: true,
    completedAt: "08:15",
  },
  {
    id: "check-hydration",
    title: "Hydration",
    timeSlot: "10:30",
    description: "",
    completed: true,
    completedAt: "10:45",
  },
  {
    id: "check-transfer",
    title: "Transfer Assist",
    timeSlot: "12:00",
    description: "",
    completed: true,
    completedAt: "12:15",
  },
  {
    id: "check-dinner",
    title: "Dinner",
    timeSlot: "18:30",
    description: "",
    completed: false,
  },
];

export interface CaregiverDashboardProps {
  patient?: Patient;
  caregiverName?: string;
  caregiverTitle?: string;
  organization?: string;
  className?: string;
}

export function CaregiverDashboard({
  patient = {
    id: "patient-001",
    name: "Ravi Kumar",
    age: 74,
    gender: "Male",
    dateOfBirth: "1952-04-12",
    primaryDoctor: "Dr. Rajesh Sharma",
    bloodType: "B+",
    activeConditions: [
      "Hypertension",
      "Type 2 Diabetes",
      "Ischemic Stroke (2018)",
      "Mild Cognitive Impairment",
      "Osteoarthritis",
    ],
    allergies: [],
    emergencyContact: {
      name: "Priya Kumar",
      relationship: "Daughter",
      phone: "+1-555-0192",
      email: "priya@healthmemory.demo",
    },
    mobilityStatus: "Requires four-wheel walker; elevated fall risk during transfers",
  },
  caregiverName = "Anita Desai",
  caregiverTitle = "Certified Nursing Assistant (CNA)",
  organization = "Grace Senior Home Care",
  className,
}: CaregiverDashboardProps) {
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [observations, setObservations] = React.useState<CaregiverObservation[]>([]);
  const [isLoadingObs, setIsLoadingObs] = React.useState<boolean>(true);

  // Load observations
  const loadObservations = React.useCallback(async () => {
    setIsLoadingObs(true);
    try {
      const data = await caregiverService.getObservations(patient.id);
      setObservations(data);
    } catch (err) {
      console.error("Failed to load caregiver observations:", err);
    } finally {
      setIsLoadingObs(false);
    }
  }, [patient.id]);

  React.useEffect(() => {
    loadObservations();
  }, [loadObservations]);

  // Toggle checklist item completion
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          return {
            ...item,
            completed: nextCompleted,
            completedAt: nextCompleted
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        }
        return item;
      })
    );
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className={clsx(styles.container, className)}>
      {/* 1. Header & Actions */}
      <div className={styles.shiftHeader}>
        <div className={styles.shiftInfo}>
          <div className={styles.caregiverAvatar} aria-hidden="true">
            AD
          </div>
          <div className={styles.shiftDetails}>
            <div className={styles.greetingRow}>
              <h2 className={styles.greeting}>Caregiver Dashboard</h2>
              <Badge variant="secondary">CNA</Badge>
            </div>
          </div>
        </div>

        {/* Actions: 1-2 words */}
        <div className={styles.quickActionsBar}>
          <Button variant="primary" asChild size="md">
            <Link href="/caregiver/report" className={styles.actionBtn}>
              <ClipboardEdit size={16} />
              <span>Log Note</span>
            </Link>
          </Button>

          <Button variant="danger" asChild size="md">
            <Link
              href="/caregiver/report?category=fall&incident=true"
              className={styles.actionBtn}
            >
              <AlertTriangle size={16} />
              <span>Report Fall</span>
            </Link>
          </Button>

          <Button variant="outline" asChild size="md">
            <Link href="/caregiver/trends" className={styles.actionBtn}>
              <TrendingUp size={16} />
              <span>Trends</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Alert: 1-line warning */}
      <div className={styles.fallAlertBanner} role="alert">
        <div className={styles.alertLeft}>
          <AlertTriangle size={18} className={styles.alertIcon} />
          <span className={styles.alertTitle}>
            Alert: High Fall Risk — Standby Assist Required
          </span>
        </div>
      </div>

      {/* 3. Checklist */}
      <div className={styles.checklistCard}>
        <div className={styles.checklistHeader}>
          <h3 className={styles.checklistTitle}>
            <CheckCircle2 size={18} style={{ color: "var(--color-success)" }} />
            Checklist
          </h3>
          <Badge variant={completedCount === totalCount ? "success" : "warning"}>
            {completedCount}/{totalCount} Done
          </Badge>
        </div>

        <div className={styles.checklistItems}>
          {checklist.map((item) => (
            <div
              key={item.id}
              className={clsx(
                styles.checklistItem,
                item.completed && styles.checklistItemCompleted
              )}
              onClick={() => handleToggleChecklist(item.id)}
              role="checkbox"
              aria-checked={item.completed}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggleChecklist(item.id);
                }
              }}
            >
              <div
                className={clsx(
                  styles.checkboxSquare,
                  item.completed && styles.checkboxSquareChecked
                )}
              >
                <Check size={14} />
              </div>

              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span
                    className={clsx(
                      styles.itemLabel,
                      item.completed && styles.itemLabelCompleted
                    )}
                  >
                    {item.title}
                  </span>
                  <span className={styles.itemTime}>
                    {item.completed && item.completedAt
                      ? item.completedAt
                      : item.timeSlot}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Feed */}
      <div className={styles.streamSection}>
        <div className={styles.streamHeader}>
          <h3 className={styles.streamTitle}>
            <ClipboardEdit size={18} style={{ color: "var(--color-primary)" }} />
            Recent Feed
          </h3>
        </div>

        <ObservationList
          observations={observations}
          isLoading={isLoadingObs}
          showFilters={true}
        />
      </div>
    </div>
  );
}
