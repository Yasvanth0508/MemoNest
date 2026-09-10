"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ObservationCategory, CaregiverObservation } from "@/types";
import { caregiverService } from "@/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  AlertTriangle,
  Brain,
  Activity,
  Pill,
  Smile,
  Utensils,
  ClipboardList,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  Stethoscope,
  Users,
  Loader2,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import styles from "./ObservationForm.module.css";

export interface CategoryOption {
  id: ObservationCategory;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultSeverity: "low" | "medium" | "high" | "critical";
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "fall",
    label: "Fall",
    icon: AlertTriangle,
    defaultSeverity: "critical",
  },
  {
    id: "confusion",
    label: "Confusion",
    icon: Brain,
    defaultSeverity: "medium",
  },
  {
    id: "mobility",
    label: "Mobility",
    icon: Activity,
    defaultSeverity: "medium",
  },
  {
    id: "medication_adherence",
    label: "Meds",
    icon: Pill,
    defaultSeverity: "low",
  },
  {
    id: "behavior",
    label: "Mood",
    icon: Smile,
    defaultSeverity: "low",
  },
  {
    id: "appetite",
    label: "Meals",
    icon: Utensils,
    defaultSeverity: "low",
  },
  {
    id: "general",
    label: "General",
    icon: ClipboardList,
    defaultSeverity: "low",
  },
];

const PRESET_OBSERVATIONS = [
  "Ravi lost balance during bed-to-chair transfer. Minor right knee bruise, no head trauma.",
  "Ravi seemed confused and disoriented this morning while walking toward the bathroom.",
  "Patient had stiff gait upon rising from low armchair. Needed two-hand support.",
  "Drank 500ml water and finished lunch without choking or swallowing difficulty.",
  "Evening medications taken smoothly with applesauce at 19:00.",
];

export interface ObservationFormProps {
  patientId?: string;
  caregiverId?: string;
  caregiverName?: string;
  onSuccess?: (newObservation: CaregiverObservation) => void;
  className?: string;
}

export function ObservationForm({
  patientId = "patient-001",
  caregiverId = "user-caregiver-001",
  caregiverName = "Anita Desai",
  onSuccess,
  className,
}: ObservationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategoryParam = searchParams.get("category") as ObservationCategory | null;
  const initialIncidentParam = searchParams.get("incident") === "true";

  const [category, setCategory] = React.useState<ObservationCategory>(
    initialCategoryParam && CATEGORY_OPTIONS.some((c) => c.id === initialCategoryParam)
      ? initialCategoryParam
      : initialIncidentParam
      ? "fall"
      : "mobility"
  );

  const [isIncident, setIsIncident] = React.useState<boolean>(
    initialIncidentParam || initialCategoryParam === "fall"
  );

  const [timestamp, setTimestamp] = React.useState<string>(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  });

  const [location, setLocation] = React.useState<string>("Bedroom (bedside transfer)");
  const [severity, setSeverity] = React.useState<"low" | "medium" | "high" | "critical">(
    initialIncidentParam || initialCategoryParam === "fall" ? "critical" : "medium"
  );
  const [note, setNote] = React.useState<string>("");
  const [actionTaken, setActionTaken] = React.useState<string>("");
  const [vitalsChecked, setVitalsChecked] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Update incident & severity when category changes to fall
  const handleCategorySelect = (newCategory: ObservationCategory) => {
    setCategory(newCategory);
    if (newCategory === "fall") {
      setIsIncident(true);
      setSeverity("critical");
      if (!location) setLocation("Bedroom (bedside transfer)");
    } else {
      const match = CATEGORY_OPTIONS.find((c) => c.id === newCategory);
      if (match && !isIncident) {
        setSeverity(match.defaultSeverity);
      }
    }
  };

  const toggleIncident = () => {
    const next = !isIncident;
    setIsIncident(next);
    if (next) {
      setSeverity("high");
    } else if (category !== "fall") {
      setSeverity("low");
    }
  };

  // Structured AI preview generated dynamically from input
  const aiStructuring = React.useMemo(() => {
    const lowerNote = note.toLowerCase();

    let primaryClassification = "Routine Activity Observation";
    let extractedTags = ["#CaregiverObservation", "#AnitaDesai"];
    let suggestedPhysicianAction = "Standard documentation in routine memory stream.";
    let guardianAlert = "Standard shift recap for Priya Kumar";
    let confidence = 88;

    if (category === "fall" || lowerNote.includes("fall") || lowerNote.includes("balance") || lowerNote.includes("slip")) {
      primaryClassification = "Acute Transfer Instability & Fall Event Signal";
      extractedTags.push("#FallIncident", "#TransferInstability", "#HighFallRisk");
      confidence = 96;
      suggestedPhysicianAction = "Immediate review recommended for PT gait evaluation & post-fall vitals review.";
      guardianAlert = "Urgent SMS alert queued for daughter Priya Kumar";
      if (lowerNote.includes("knee") || lowerNote.includes("bruise")) {
        extractedTags.push("#MinorContusion", "#RightKnee");
      }
      if (lowerNote.includes("head")) {
        extractedTags.push("#NoHeadTrauma");
      }
    } else if (category === "confusion" || lowerNote.includes("confused") || lowerNote.includes("disoriented") || lowerNote.includes("foggy")) {
      primaryClassification = "Cognitive Fluctuations / Morning Disorientation";
      extractedTags.push("#CognitiveSignal", "#MorningConfusion", "#MCIProgressionWatch");
      confidence = 92;
      suggestedPhysicianAction = "Correlate with sleep medications and evening sedative residual effects.";
      guardianAlert = "Noted in daily care digest for family guardian";
    } else if (category === "mobility" || lowerNote.includes("stiff") || lowerNote.includes("walker") || lowerNote.includes("gait")) {
      primaryClassification = "Ambulation & Transfer Assistance Requirement";
      extractedTags.push("#MobilitySupport", "#WalkerUse", "#SitToStandHesitation");
      confidence = 90;
      suggestedPhysicianAction = "Monitor joint stiffness; assess assistive device adjustments.";
      guardianAlert = "Logged for weekly mobility recap";
    } else if (category === "medication_adherence" || lowerNote.includes("med") || lowerNote.includes("pill") || lowerNote.includes("dose")) {
      primaryClassification = "Medication Administration & Ingestion Verification";
      extractedTags.push("#MedicationAdherence", "#ConfirmedIngestion");
      confidence = 94;
      suggestedPhysicianAction = "Recorded to active medication audit trail.";
      guardianAlert = "Daily medication administration confirmed";
    } else if (category === "appetite" || lowerNote.includes("meal") || lowerNote.includes("water") || lowerNote.includes("appetite")) {
      primaryClassification = "Nutritional & Hydration Intake Signal";
      extractedTags.push("#HydrationIntake", "#DietaryCompliance");
      confidence = 91;
      suggestedPhysicianAction = "Maintain 2.0L fluid goal monitoring to prevent postural hypotension.";
      guardianAlert = "Logged for weekly nutritional recap";
    }

    if (vitalsChecked) {
      extractedTags.push("#VitalsChecked");
    }
    if (isIncident) {
      extractedTags.push("#PriorityIncident");
    }

    return {
      classification: primaryClassification,
      tags: extractedTags,
      confidence,
      suggestedPhysicianAction,
      guardianAlert,
    };
  }, [category, note, isIncident, vitalsChecked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim()) {
      toast.error("Please enter observation details or notes.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create concise summary from note or classification
      const firstSentence = note.trim().split(".")[0];
      const summary = firstSentence.length > 80 ? firstSentence.slice(0, 80) + "..." : firstSentence;

      const created = await caregiverService.submitObservation({
        patientId,
        caregiverId,
        caregiverName,
        category,
        note: note.trim(),
        summary,
        severity,
        incidentReported: isIncident,
        location: location.trim() || undefined,
        actionTaken: actionTaken.trim() || undefined,
        vitalsChecked,
        notes: note.trim(),
      });

      toast.success("Caregiver observation successfully recorded and structured!", {
        description: `Logged under "${aiStructuring.classification}" for patient Ravi Kumar.`,
      });

      if (onSuccess) {
        onSuccess(created);
      } else {
        router.push("/caregiver");
      }
    } catch (err) {
      console.error("Failed to submit observation:", err);
      toast.error("Failed to submit observation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      {/* Minimal banner */}
      <div className={styles.governanceBanner} role="alert">
        <ShieldAlert size={18} className={styles.governanceIcon} />
        <span className={styles.governanceText}>
          Notice: Care signal for physician review
        </span>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)", color: "var(--color-primary)" }}>
          Report Observation
        </h2>

        {/* Category chips */}
        <div className={styles.formSection}>
          <label className={styles.label}>Category</label>
          <div className={styles.categoryGrid}>
            {CATEGORY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = category === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={clsx(
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected,
                    opt.id === "fall" && styles.categoryButton_fall
                  )}
                  onClick={() => handleCategorySelect(opt.id)}
                >
                  <div className={styles.categoryIcon}>
                    <Icon size={16} />
                  </div>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date/time */}
        <div className={styles.formSection}>
          <label className={styles.label} htmlFor="obs-timestamp">
            Date / Time
          </label>
          <Input
            id="obs-timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
          />
        </div>

        {/* Note */}
        <div className={styles.formSection}>
          <label className={styles.label} htmlFor="obs-notes">
            Note
          </label>
          <textarea
            id="obs-notes"
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            rows={4}
            required
          />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" type="submit" disabled={isSubmitting} size="md">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
