"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useCaregiver,
} from "./caregiver-store";
import {
  ObservationCategory,
} from "@/types";
import {
  Mic,
  MicOff,
  AlertTriangle,
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  X,
  Send,
  Loader2,
  FileText,
  Clock,
  ShieldAlert,
  HelpCircle,
  Tag,
  Info,
} from "lucide-react";
import clsx from "clsx";
import styles from "./VoiceObservationInput.module.css";

export type SeverityOption = "mild" | "moderate" | "urgent";

export interface CategoryItem {
  id: ObservationCategory;
  label: string;
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  { id: "mobility", label: "Mobility & Transfers" },
  { id: "confusion", label: "Mood / Cognition" },
  { id: "appetite", label: "Appetite & Hydration" },
  { id: "drowsiness", label: "Sleep & Sedation" },
  { id: "medication_adherence", label: "Medication Adherence" },
  { id: "general", label: "Physical Symptom" },
];

export interface VoiceObservationInputProps {
  initialCategory?: ObservationCategory;
  initialTag?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VoiceObservationInput({
  initialCategory,
  initialTag,
  onSuccess,
  onCancel,
}: VoiceObservationInputProps) {
  const router = useRouter();
  const { activePatient, activePatientCare, addObservation } = useCaregiver();

  // Voice recording state
  const [isListening, setIsListening] = React.useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = React.useState<number>(0);
  const recognitionRef = React.useRef<any>(null);
  const timerRef = React.useRef<any>(null);

  // Form structured state
  const [transcription, setTranscription] = React.useState<string>(() => {
    if (initialTag) {
      return `Observation regarding: ${initialTag}. `;
    }
    return "";
  });

  const [severity, setSeverity] = React.useState<SeverityOption>(() => {
    if (initialCategory === "fall") return "urgent";
    return "moderate";
  });

  const [category, setCategory] = React.useState<ObservationCategory>(
    initialCategory || "mobility"
  );

  const [selectedQuickTags, setSelectedQuickTags] = React.useState<string[]>(() => {
    if (initialTag) return [initialTag];
    return [];
  });

  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Quick preset speech snippets for quick testing or fallback
  const SAMPLE_VOICE_SNIPPETS = [
    {
      label: "Fall & Knee Contusion",
      text: "Ravi lost his footing while transferring from the bedside to his walker. He bruised his right knee but did not strike his head.",
      cat: "fall" as ObservationCategory,
      sev: "urgent" as SeverityOption,
      tag: "Fall",
    },
    {
      label: "Missed Evening Dose",
      text: "Ravi refused his evening Donepezil and Metformin tablets due to tiredness. Advised drinking water.",
      cat: "medication_adherence" as ObservationCategory,
      sev: "moderate" as SeverityOption,
      tag: "Missed Dose",
    },
    {
      label: "Morning Disorientation",
      text: "Ravi woke up confused about the day of the week and asked where his wife was. Took 20 minutes to reorient him with tea and family album.",
      cat: "confusion" as ObservationCategory,
      sev: "moderate" as SeverityOption,
      tag: "Confusion Episode",
    },
    {
      label: "Lunch Refused",
      text: "Refused lunchtime soup and only drank 100ml water. Complained of mild nausea.",
      cat: "appetite" as ObservationCategory,
      sev: "moderate" as SeverityOption,
      tag: "Refused Food",
    },
  ];

  // Web Speech Recognition setup
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            setTranscription((prev) => {
              // Combine initial prompt with incoming speech
              if (!prev.trim()) return currentTranscript;
              return currentTranscript;
            });
          };

          recognition.onerror = (err: any) => {
            console.warn("Speech recognition error:", err);
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("Could not initialize SpeechRecognition:", e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer interval when listening
  React.useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    } else {
      // Start listening
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Recognition start failed, switching to simulated listening:", e);
          simulateSpeechRecognition();
        }
      } else {
        // Fallback speech simulation
        simulateSpeechRecognition();
      }
    }
  };

  // Graceful voice simulation fallback for browsers without mic permission or non-Chrome environments
  const simulateSpeechRecognition = () => {
    const sample =
      category === "fall"
        ? SAMPLE_VOICE_SNIPPETS[0]
        : category === "medication_adherence"
        ? SAMPLE_VOICE_SNIPPETS[1]
        : category === "confusion"
        ? SAMPLE_VOICE_SNIPPETS[2]
        : SAMPLE_VOICE_SNIPPETS[0];

    let currentIdx = 0;
    const words = sample.text.split(" ");

    const interval = setInterval(() => {
      if (currentIdx < words.length) {
        setTranscription((prev) => (currentIdx === 0 ? words[0] : `${prev} ${words[currentIdx]}`));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 240);
  };

  // Quick tags toggle
  const handleToggleTag = (tag: string) => {
    if (selectedQuickTags.includes(tag)) {
      setSelectedQuickTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedQuickTags((prev) => [...prev, tag]);

      // Auto-set category & severity for relevant tags
      if (tag === "Fall") {
        setCategory("fall");
        setSeverity("urgent");
      } else if (tag === "Missed Dose") {
        setCategory("medication_adherence");
        setSeverity("moderate");
      } else if (tag === "Confusion Episode") {
        setCategory("confusion");
        setSeverity("moderate");
      } else if (tag === "Refused Food") {
        setCategory("appetite");
        setSeverity("moderate");
      }

      // Add to note if not already mentioned
      if (!transcription.toLowerCase().includes(tag.toLowerCase())) {
        setTranscription((prev) => (prev ? `${prev} [${tag}]` : `[${tag}] `));
      }
    }
  };

  // Quick Preset Sample load
  const loadPresetSample = (sample: (typeof SAMPLE_VOICE_SNIPPETS)[0]) => {
    setTranscription(sample.text);
    setCategory(sample.cat);
    setSeverity(sample.sev);
    if (!selectedQuickTags.includes(sample.tag)) {
      setSelectedQuickTags((prev) => [...prev, sample.tag]);
    }
  };

  // Handle Photo Attachment
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Attach sample photo shortcut
  const handleAttachDemoPhoto = () => {
    // SVG Data URI for demo transfer photo / bruise documentation
    const svgDemo =
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23eaf2f1'/><rect x='40' y='40' width='320' height='220' rx='16' fill='%23ffffff' stroke='%2367B8BA' stroke-width='4'/><circle cx='200' cy='150' r='50' fill='%23fee2e2' stroke='%23f87171' stroke-width='3'/><text x='200' y='155' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23991b1b' text-anchor='middle'>Right Knee Contusion Log</text><text x='200' y='230' font-family='sans-serif' font-size='12' fill='%2368717C' text-anchor='middle'>Photo Attached by Caregiver</text></svg>";
    setPhotoUrl(svgDemo);
  };

  const isUrgent = severity === "urgent" || category === "fall" || selectedQuickTags.includes("Fall");

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcription.trim()) return;

    setIsSubmitting(true);
    try {
      // First sentence as concise summary
      const firstSentence = transcription.trim().split(".")[0];
      const summary =
        firstSentence.length > 80 ? firstSentence.slice(0, 80) + "..." : firstSentence;

      await addObservation({
        patientId: activePatient.id,
        caregiverId: "user-caregiver-001",
        caregiverName: "Anita Desai",
        category,
        severity: severity === "urgent" ? "critical" : severity === "moderate" ? "medium" : "low",
        note: transcription.trim(),
        summary,
        incidentReported: isUrgent,
        location: category === "fall" ? "Bedroom / Bathroom Corridor" : "Living Area",
        actionTaken: isUrgent
          ? "Provided standby support, seated patient safely, alerted primary guardian."
          : "Logged in daily care stream.",
        vitalsChecked: isUrgent,
        evidenceId: photoUrl ? "ev-photo-attachment" : undefined,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/caregiver");
      }
    } catch (err) {
      console.error("Failed to submit observation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit} role="form" aria-label="Log an Observation">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.mainTitle}>
            <Mic size={24} style={{ color: "var(--color-secondary)" }} />
            Log an Observation
          </h2>
          <p className={styles.subtitle}>
            Voice-first documentation for <strong>{activePatient.name}</strong>. Speak naturally or type below.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            aria-label="Cancel and close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 1. Voice Record Button (Tap to Speak) */}
      <div className={styles.voiceSection}>
        <button
          type="button"
          className={clsx(styles.micButton, isListening && styles.micButtonListening)}
          onClick={toggleListening}
          aria-label={isListening ? "Stop listening and review transcription" : "Tap to speak and record observation"}
          aria-pressed={isListening}
        >
          {isListening ? <MicOff size={38} /> : <Mic size={38} />}
        </button>

        <div className={styles.micStatusLabel}>
          {isListening ? "Listening... Speak now" : "Tap to Speak"}
        </div>

        {isListening ? (
          <div className={styles.recordingTimer}>
            <Clock size={16} />
            <span>00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
            <div className={styles.audioWave}>
              <div className={styles.audioWaveBar} />
              <div className={styles.audioWaveBar} />
              <div className={styles.audioWaveBar} />
              <div className={styles.audioWaveBar} />
              <div className={styles.audioWaveBar} />
            </div>
          </div>
        ) : (
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            Tap the microphone to dictate your observation in real time
          </span>
        )}

        {/* Quick Voice Demo Presets */}
        <div className={styles.presetVoicesRow}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#68717C" }}>
            Or load sample voice text:
          </span>
          {SAMPLE_VOICE_SNIPPETS.map((snip, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.presetButton}
              onClick={() => loadPresetSample(snip)}
              title={snip.text}
            >
              🎙️ {snip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Transcription & Edit Box */}
      <div className={styles.transcriptionBox}>
        <div className={styles.transcriptionHeader}>
          <label htmlFor="transcription-input" className={styles.transcriptionLabel}>
            <FileText size={16} />
            Transcription & Notes
          </label>
          {transcription && (
            <button
              type="button"
              onClick={() => setTranscription("")}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear Text
            </button>
          )}
        </div>

        <textarea
          id="transcription-input"
          className={styles.textarea}
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder="Describe what happened: patient transfer, mood, meal completion, or symptoms..."
          required
          rows={4}
        />
      </div>

      {/* 3. Quick Tags */}
      <div className={styles.quickTagsSection}>
        <span className={styles.quickTagsLabel}>Quick Event Tags</span>
        <div className={styles.quickTagsRow}>
          {["Missed Dose", "Confusion Episode", "Fall", "Refused Food"].map((tag) => {
            const isSelected = selectedQuickTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={clsx(styles.tagPill, isSelected && styles.tagPillActive)}
                onClick={() => handleToggleTag(tag)}
                aria-pressed={isSelected}
              >
                <Tag size={13} />
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Structured Information: Severity & Category */}
      <div className={styles.formGrid}>
        {/* Severity */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Severity Level</label>
          <div className={styles.severityGroup} role="radiogroup" aria-label="Severity level">
            <button
              type="button"
              className={clsx(
                styles.severityButton,
                styles.severity_mild,
                severity === "mild" && styles.severity_mild_active
              )}
              onClick={() => setSeverity("mild")}
              role="radio"
              aria-checked={severity === "mild"}
            >
              Mild
            </button>

            <button
              type="button"
              className={clsx(
                styles.severityButton,
                styles.severity_moderate,
                severity === "moderate" && styles.severity_moderate_active
              )}
              onClick={() => setSeverity("moderate")}
              role="radio"
              aria-checked={severity === "moderate"}
            >
              Moderate
            </button>

            <button
              type="button"
              className={clsx(
                styles.severityButton,
                styles.severity_urgent,
                severity === "urgent" && styles.severity_urgent_active
              )}
              onClick={() => setSeverity("urgent")}
              role="radio"
              aria-checked={severity === "urgent"}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Category */}
        <div className={styles.fieldGroup}>
          <label htmlFor="category-select" className={styles.fieldLabel}>
            Observation Category
          </label>
          <select
            id="category-select"
            className={styles.categorySelect}
            value={category}
            onChange={(e) => setCategory(e.target.value as ObservationCategory)}
          >
            {CATEGORY_ITEMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
            <option value="fall">Fall Incident (Urgent)</option>
          </select>
        </div>
      </div>

      {/* 5. Optional Photo Attachment */}
      <div className={styles.photoSection}>
        <label className={styles.fieldLabel}>Photo Attachment (Optional)</label>

        {photoUrl ? (
          <div className={styles.photoPreviewCard}>
            <div className={styles.photoPreviewLeft}>
              <img src={photoUrl} alt="Attached observation" className={styles.thumbnailImg} />
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, display: "block" }}>
                  Photo Attached
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  Ready to be saved with observation record
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#c81e1e",
              }}
              aria-label="Remove photo"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label className={styles.dropzone} style={{ flex: 1, minWidth: 200 }}>
              <UploadCloud size={20} style={{ color: "var(--color-secondary)" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Choose file or take photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
              />
            </label>

            <button
              type="button"
              className={styles.presetButton}
              onClick={handleAttachDemoPhoto}
              style={{ padding: "10px 16px", minHeight: 48 }}
            >
              <Camera size={16} />
              <span>Attach Demo Contusion Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Observation Routing Preview Notice */}
      <div
        className={clsx(
          styles.routingPreviewCard,
          isUrgent ? styles.routingUrgent : styles.routingRoutine
        )}
      >
        {isUrgent ? (
          <>
            <AlertTriangle size={20} style={{ color: "#c81e1e", flexShrink: 0 }} />
            <div>
              <strong>High-Priority Escalation Routing:</strong> This observation will be flagged as an{" "}
              <strong>Urgent Event</strong> and immediately routed to family guardian{" "}
              <strong>Priya Kumar (+1-555-0192)</strong> and Dr. Rajesh Sharma&apos;s triage desk.
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 size={20} style={{ color: "#1a6b6d", flexShrink: 0 }} />
            <div>
              <strong>Routine Care Routing:</strong> This observation will be logged into{" "}
              {activePatient.name}&apos;s combined health timeline and included in daily physician review digests.
            </div>
          </>
        )}
      </div>

      {/* Submit Button Row */}
      <div className={styles.buttonRow}>
        {onCancel && (
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || !transcription.trim()}
          aria-label="Submit observation"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Recording...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Submit Observation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
