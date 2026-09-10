"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSearch,
  FileText,
  Filter,
  Heart,
  Pill,
  Search,
  Stethoscope,
  Volume2,
  X,
} from "lucide-react";
import clsx from "clsx";
import { PatientPortalShell } from "@/components/patient";
import {
  patientPortalStore,
} from "@/services/patient-portal.service";
import { TimelineEvent } from "@/types";
import styles from "./timeline.module.css";

export default function HealthTimelinePage() {
  const [events, setEvents] = React.useState<TimelineEvent[]>(() =>
    patientPortalStore.getTimelineEvents()
  );

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [conditionFilter, setConditionFilter] = React.useState("all");
  const [providerFilter, setProviderFilter] = React.useState("all");
  const [yearFilter, setYearFilter] = React.useState("all");
  const [episodeFilter, setEpisodeFilter] = React.useState("all");

  // Source Provenance Viewer Modal
  const [selectedSourceEvent, setSelectedSourceEvent] = React.useState<TimelineEvent | null>(null);

  React.useEffect(() => {
    const unsub = patientPortalStore.subscribe(() => {
      setEvents([...patientPortalStore.getTimelineEvents()]);
    });
    return unsub;
  }, []);

  // Filtered Events
  const filteredEvents = React.useMemo(() => {
    return events.filter((ev) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        (ev.author && ev.author.toLowerCase().includes(q)) ||
        (ev.sourceType && ev.sourceType.toLowerCase().includes(q));

      const matchesYear =
        yearFilter === "all" || ev.date.startsWith(yearFilter);

      const matchesProvider =
        providerFilter === "all" ||
        (ev.author && ev.author.toLowerCase().includes(providerFilter.toLowerCase()));

      const matchesCondition =
        conditionFilter === "all" ||
        ev.title.toLowerCase().includes(conditionFilter.toLowerCase()) ||
        ev.description.toLowerCase().includes(conditionFilter.toLowerCase());

      const matchesEpisode =
        episodeFilter === "all" ||
        (episodeFilter === "inpatient" && ev.type === "hospitalization") ||
        (episodeFilter === "incident" && ev.type === "fall") ||
        (episodeFilter === "routine" && (ev.type === "routine_visit" || ev.type === "lab_result"));

      return matchesSearch && matchesYear && matchesProvider && matchesCondition && matchesEpisode;
    });
  }, [events, searchQuery, yearFilter, providerFilter, conditionFilter, episodeFilter]);

  const handleReadItem = (ev: TimelineEvent) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `${ev.title}. Date: ${ev.date}. ${ev.description}. Provider: ${ev.author || "Your care team"}. Source: ${ev.sourceType || "Clinical Record"}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return dateStr;
  };

  const speechSummary = `You are on My Health Timeline. There are ${events.length} chronological medical events from 2018 to the present day, including your stroke recovery, blood pressure management, cognitive care with Donepezil, and caregiver notes. Every item shows its original clinical source.`;

  return (
    <PatientPortalShell pageSpeechSummary={speechSummary}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>My Health Timeline</h1>
            <p className={styles.subtitle}>
              A chronological health-memory journey combining your doctor visits, prescriptions, lab results, diagnoses, and caregiver logs.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/patient/reports"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#FFFFFF",
                color: "#0D9488",
                border: "1.5px solid #0D9488",
                borderRadius: "var(--radius-pill)",
                padding: "10px 20px",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <FileText size={18} />
              <span>View Source Reports</span>
            </Link>
          </div>
        </header>

        {/* Multi-Dimensional Filters Card */}
        <section className={styles.filterCard} aria-labelledby="timeline-filters-heading">
          <div className={styles.searchBar}>
            <Search size={20} color="#64748B" />
            <input
              type="text"
              placeholder="Search timeline by keyword (e.g. stroke, Amlodipine, Dr. Sharma, blood pressure)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search timeline entries"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B" }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className={styles.filtersRow}>
            {/* Filter: Condition */}
            <div className={styles.filterSelectGroup}>
              <label className={styles.filterSelectLabel}>Condition</label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Conditions</option>
                <option value="stroke">Ischemic Stroke</option>
                <option value="hypertension">Hypertension</option>
                <option value="mci">Cognitive / MCI</option>
                <option value="fall">Falls & Mobility</option>
                <option value="metabolic">Metabolic / Diabetes</option>
              </select>
            </div>

            {/* Filter: Provider */}
            <div className={styles.filterSelectGroup}>
              <label className={styles.filterSelectLabel}>Healthcare Provider</label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Providers</option>
                <option value="sharma">Dr. Rajesh Sharma</option>
                <option value="desai">Anita Desai (Caregiver)</option>
                <option value="quest">Quest Diagnostics</option>
                <option value="chang">Dr. Michael Chang (Neuro)</option>
                <option value="rostova">Elena Rostova (PT)</option>
              </select>
            </div>

            {/* Filter: Date / Year */}
            <div className={styles.filterSelectGroup}>
              <label className={styles.filterSelectLabel}>Date / Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Years (2018 – 2026)</option>
                <option value="2026">2026 (Recent)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2021">2021</option>
                <option value="2018">2018</option>
              </select>
            </div>

            {/* Filter: Care Episode */}
            <div className={styles.filterSelectGroup}>
              <label className={styles.filterSelectLabel}>Care Episode</label>
              <select
                value={episodeFilter}
                onChange={(e) => setEpisodeFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Episodes</option>
                <option value="routine">Routine Checkups & Labs</option>
                <option value="incident">Caregiver Home Incidents</option>
                <option value="inpatient">Inpatient Hospital Stays</option>
              </select>
            </div>
          </div>
        </section>

        {/* Timeline Events List */}
        {filteredEvents.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #DDE2E1",
              borderRadius: "var(--radius-lg)",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <Clock size={48} color="#94A3B8" style={{ margin: "0 auto 16px auto" }} />
            <h2 style={{ fontSize: "22px", color: "#1E293B", margin: "0 0 8px 0" }}>No timeline events found</h2>
            <p style={{ fontSize: "16px", color: "#64748B", margin: "0 0 20px 0" }}>
              Try adjusting your condition, provider, or year filters.
            </p>
            <button
              type="button"
              className={styles.viewSourceBtn}
              onClick={() => {
                setSearchQuery("");
                setConditionFilter("all");
                setProviderFilter("all");
                setYearFilter("all");
                setEpisodeFilter("all");
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className={styles.timelineFeed} role="feed" aria-label="Health Timeline Events">
            {filteredEvents.map((ev) => {
              const isCrit = ev.severity === "critical" || ev.type === "fall";
              const isMed = ev.type === "medication_change";

              return (
                <article key={ev.id} className={styles.timelineCard}>
                  <div
                    className={clsx(
                      styles.timelineDot,
                      isCrit && styles.dotCritical,
                      isMed && styles.dotMed
                    )}
                    aria-hidden="true"
                  />

                  <div className={styles.cardTopRow}>
                    <div className={styles.dateBadge}>
                      {formatDateDisplay(ev.date)} {ev.time && `• ${ev.time}`}
                    </div>
                    <span className={styles.categoryPill}>
                      {ev.category.toUpperCase()}
                    </span>
                  </div>

                  <h2 className={styles.cardTitle}>{ev.title}</h2>
                  <p className={styles.cardBody}>{ev.description}</p>

                  <div className={styles.metaInfoRow}>
                    <div>
                      <strong>Provider:</strong> {ev.author || "MetroHealth Senior Team"}
                    </div>
                    {ev.authorRole && (
                      <div>
                        <strong>Role:</strong> {ev.authorRole}
                      </div>
                    )}
                  </div>

                  {/* Explicit Source Provenance Banner */}
                  <div className={styles.sourceRow}>
                    <div className={styles.sourceLeft}>
                      <FileCheck size={18} color="#0D9488" />
                      <span>
                        Source: <span className={styles.sourceText}>{ev.sourceType || "Clinical Document"} — {ev.date}</span>
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        type="button"
                        className={styles.readAloudBtn}
                        onClick={() => handleReadItem(ev)}
                        aria-label={`Read event ${ev.title} aloud`}
                      >
                        <Volume2 size={16} />
                        <span>Read Aloud</span>
                      </button>

                      <button
                        type="button"
                        className={styles.viewSourceBtn}
                        onClick={() => setSelectedSourceEvent(ev)}
                        aria-label={`View source document for ${ev.title}`}
                      >
                        <ExternalLink size={15} />
                        <span>[View Source]</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Source Provenance Modal */}
        {selectedSourceEvent && (
          <div className={styles.modalBackdrop} onClick={() => setSelectedSourceEvent(null)}>
            <div
              className={styles.sourceModalCard}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="source-dialog-title"
            >
              <div className={styles.sourceModalHeader}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0D9488", textTransform: "uppercase" }}>
                    Source Verification & Clinical Provenance
                  </div>
                  <h2 id="source-dialog-title" style={{ fontSize: "22px", fontWeight: 800, color: "#122544", margin: "4px 0 0 0" }}>
                    {selectedSourceEvent.sourceType || "Medical Document"}
                  </h2>
                </div>
                <button
                  type="button"
                  style={{ background: "#F1F5F9", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}
                  onClick={() => setSelectedSourceEvent(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "17px", color: "#1E293B" }}>
                  <strong>Document Title:</strong> {selectedSourceEvent.title}
                </p>
                <p style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#475569" }}>
                  <strong>Originating Facility:</strong> {selectedSourceEvent.author || "MetroHealth System"}
                </p>
                <p style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#475569" }}>
                  <strong>Date Recorded:</strong> {formatDateDisplay(selectedSourceEvent.date)}
                </p>
                <p style={{ margin: 0, fontSize: "16px", color: "#475569" }}>
                  <strong>Clinical Observation / Summary:</strong> {selectedSourceEvent.description}
                </p>
              </div>

              <p style={{ fontSize: "14px", color: "#64748B", margin: "0 0 24px 0" }}>
                This record was extracted and verified from the primary medical document stored in your MemoNest Reports repository.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className={styles.viewSourceBtn}
                  onClick={() => setSelectedSourceEvent(null)}
                >
                  Close Provenance
                </button>
                <Link
                  href="/patient/reports"
                  style={{
                    background: "#122544",
                    color: "#FFFFFF",
                    borderRadius: "999px",
                    padding: "10px 22px",
                    fontSize: "15px",
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Go to Full Document in Reports</span>
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientPortalShell>
  );
}
