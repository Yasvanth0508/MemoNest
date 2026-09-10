"use client";

import * as React from "react";
import { useCaregiver, formatTimeDeterministic } from "./caregiver-store";
import { TimelineEvent } from "@/types";
import {
  HeartHandshake,
  Pill,
  Stethoscope,
  Activity,
  AlertTriangle,
  FileText,
  Search,
  MessageSquarePlus,
  Clock,
  Send,
  Check,
  Calendar,
  Filter,
} from "lucide-react";
import clsx from "clsx";
import styles from "./CombinedHealthTimeline.module.css";

export function CombinedHealthTimeline() {
  const { timelineEvents, followUpNotes, addFollowUpNote, activePatient } = useCaregiver();

  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Tracking open follow-up note input by eventId
  const [openNoteEventId, setOpenNoteEventId] = React.useState<string | null>(null);
  const [noteDraft, setNoteDraft] = React.useState<string>("");

  // Filter events
  const filteredEvents = React.useMemo(() => {
    let list = [...timelineEvents];

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((ev) => {
        if (selectedCategory === "caregiver") {
          return ev.category === "caregiver" || ev.sourceType.toLowerCase().includes("caregiver");
        }
        if (selectedCategory === "medication") {
          return ev.category === "medication" || ev.type === "medication_change";
        }
        if (selectedCategory === "medical") {
          return (
            ev.category === "medical" ||
            ev.type === "routine_visit" ||
            ev.type === "hospitalization"
          );
        }
        if (selectedCategory === "labs") {
          return ev.category === "labs" || ev.type === "lab_result";
        }
        if (selectedCategory === "cognitive") {
          return ev.category === "cognitive" || ev.type === "cognitive";
        }
        return true;
      });
    }

    // Date filter
    if (selectedDateFilter !== "all") {
      const now = new Date();
      list = list.filter((ev) => {
        const evDate = new Date(ev.date);
        const diffMs = now.getTime() - evDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (selectedDateFilter === "today") {
          return ev.date === now.toISOString().slice(0, 10);
        }
        if (selectedDateFilter === "week") {
          return diffDays <= 7;
        }
        if (selectedDateFilter === "month") {
          return diffDays <= 30;
        }
        return true;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          ev.sourceType?.toLowerCase().includes(q) ||
          ev.author?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [timelineEvents, selectedCategory, selectedDateFilter, searchQuery]);

  const handleSaveNote = (eventId: string) => {
    if (!noteDraft.trim()) return;
    addFollowUpNote(eventId, noteDraft.trim());
    setNoteDraft("");
    setOpenNoteEventId(null);
  };

  const getEventIcon = (ev: TimelineEvent) => {
    if (ev.type === "fall" || ev.severity === "critical") {
      return <AlertTriangle size={18} />;
    }
    if (ev.category === "caregiver" || ev.sourceType.toLowerCase().includes("caregiver")) {
      return <HeartHandshake size={18} />;
    }
    if (ev.category === "medication" || ev.type === "medication_change") {
      return <Pill size={18} />;
    }
    if (ev.category === "labs" || ev.type === "lab_result") {
      return <Activity size={18} />;
    }
    return <Stethoscope size={18} />;
  };

  const getNodeClass = (ev: TimelineEvent) => {
    if (ev.type === "fall" || ev.severity === "critical") {
      return styles.nodeCritical;
    }
    if (ev.category === "caregiver" || ev.sourceType.toLowerCase().includes("caregiver")) {
      return styles.nodeCaregiver;
    }
    if (ev.category === "medication" || ev.type === "medication_change") {
      return styles.nodeMedication;
    }
    if (ev.category === "labs" || ev.type === "lab_result") {
      return styles.nodeLab;
    }
    return "";
  };

  const getSeverityBadgeClass = (severity?: string) => {
    switch (severity) {
      case "critical":
        return styles.sevCritical;
      case "high":
        return styles.sevHigh;
      case "medium":
        return styles.sevMedium;
      default:
        return styles.sevLow;
    }
  };

  return (
    <div className={styles.container} role="region" aria-label="Combined health timeline">
      {/* Controls Bar: Category, Date, Search */}
      <div className={styles.controlsBar}>
        <div className={styles.filterRow}>
          <div className={styles.categoryChips} role="group" aria-label="Filter timeline by category">
            {[
              { id: "all", label: "All Events" },
              { id: "caregiver", label: "Caregiver Logs" },
              { id: "medication", label: "Medications" },
              { id: "medical", label: "Doctor Visits" },
              { id: "labs", label: "Lab Results" },
              { id: "cognitive", label: "Cognition" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={clsx(styles.chip, selectedCategory === cat.id && styles.chipActive)}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <select
            className={styles.dateSelect}
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            aria-label="Filter timeline by date"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>

        <div className={styles.searchBox}>
          <Search size={16} style={{ color: "var(--color-text-secondary)" }} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={`Search ${activePatient.name}'s health events...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search timeline events"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#68717C" }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Chronological Stream */}
      <div className={styles.timelineStream}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev) => {
            const eventNotes = followUpNotes[ev.id] || [];
            const isAddingNote = openNoteEventId === ev.id;

            return (
              <div key={ev.id} className={styles.timelineCard}>
                <div className={clsx(styles.timelineIconNode, getNodeClass(ev))}>
                  {getEventIcon(ev)}
                </div>

                <div className={styles.cardTopRow}>
                  <div className={styles.cardHeaderLeft}>
                    <h3 className={styles.cardTitle}>{ev.title}</h3>
                    <div className={styles.metaRow}>
                      <span>
                        <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                        {ev.date} {ev.time ? `· ${ev.time}` : ""}
                      </span>

                      <span className={styles.sourceBadge}>
                        {ev.sourceType || "Clinical Record"}
                        {ev.author ? ` (${ev.author})` : ""}
                      </span>
                    </div>
                  </div>

                  {ev.severity && (
                    <div className={clsx(styles.cardSeverityBadge, getSeverityBadgeClass(ev.severity))}>
                      Severity: {ev.severity}
                    </div>
                  )}
                </div>

                <p className={styles.cardDescription}>{ev.description}</p>

                {/* Follow-up Notes Display */}
                {eventNotes.length > 0 && (
                  <div className={styles.followUpSection}>
                    <div className={styles.followUpTitle}>
                      <FileText size={13} />
                      Follow-up Progress Notes ({eventNotes.length})
                    </div>
                    {eventNotes.map((note) => (
                      <div key={note.id} className={styles.noteItem}>
                        <div className={styles.noteAuthorRow}>
                          <strong>{note.author} ({note.authorRole})</strong>
                          <span>{formatTimeDeterministic(note.timestamp)}</span>
                        </div>
                        <div className={styles.noteText}>{note.note}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Add Follow-Up Note Action */}
                {isAddingNote ? (
                  <div className={styles.addNoteBox}>
                    <textarea
                      className={styles.noteTextarea}
                      placeholder="Add follow-up observations, vital checks, or patient response..."
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      rows={2}
                      autoFocus
                    />
                    <div className={styles.noteActionRow}>
                      <button
                        type="button"
                        className={styles.cancelNoteBtn}
                        onClick={() => {
                          setOpenNoteEventId(null);
                          setNoteDraft("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.saveNoteBtn}
                        onClick={() => handleSaveNote(ev.id)}
                      >
                        Save Follow-up Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      className={styles.addNoteButton}
                      onClick={() => {
                        setOpenNoteEventId(ev.id);
                        setNoteDraft("");
                      }}
                      aria-label={`Add follow-up note to ${ev.title}`}
                    >
                      <MessageSquarePlus size={14} />
                      <span>Add Follow-up Note</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Clock size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
            <h4 style={{ margin: "0 0 4px 0", color: "var(--color-primary)" }}>No events match your criteria</h4>
            <p style={{ margin: 0, fontSize: 14 }}>Try adjusting the category or date filter above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
