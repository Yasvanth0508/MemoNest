"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { TimelineEvent } from "@/types";
import { timelineService } from "@/services";
import {
  TimelineCard,
  TimelineFilterPills,
  TimelineYearGroup,
  TimelineFilter,
} from "@/features/timeline";
import { EvidenceProvenanceDrawer } from "@/features/clinical-brief/EvidenceProvenanceDrawer";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, Calendar } from "lucide-react";
import styles from "./timeline.module.css";

export default function PatientTimelinePage() {
  const [events, setEvents] = React.useState<TimelineEvent[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<TimelineFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Evidence Drawer state
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await timelineService.getTimelineEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to load timeline events:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleViewEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setIsEvidenceOpen(true);
  };

  // Filter and search
  const filteredEvents = React.useMemo(() => {
    return events.filter((ev) => {
      const matchesCategory =
        selectedFilter === "all" ||
        ev.category.toLowerCase() === selectedFilter.toLowerCase() ||
        (selectedFilter === "falls" && (ev.type === "fall" || ev.category === "functional"));

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ev.title.toLowerCase().includes(query) ||
        ev.description.toLowerCase().includes(query) ||
        ev.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedFilter, searchQuery]);

  // Group by year
  const groupedEvents = React.useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach((ev) => {
      const year = ev.date.split("-")[0] || "2026";
      if (!groups[year]) groups[year] = [];
      groups[year].push(ev);
    });
    return groups;
  }, [filteredEvents]);

  const years = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  return (
    <AppShell activeRole="patient" showPatientHeader={true}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.badgeRow}>
              <Badge variant="default">
                <Calendar size={12} style={{ marginRight: 4 }} />
                2018 – Present
              </Badge>
            </div>
            <h1 className={styles.title}>Timeline</h1>
          </div>
        </div>

        {/* Filter Controls */}
        <div className={styles.controlsBar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Search timeline events by keyword, medication, condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <TimelineFilterPills
            activeFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        </div>

        {/* Timeline Content */}
        {isLoading ? (
          <div className={styles.loadingState}>
            <span>Synthesizing multi-year chronological events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No Timeline Events Found"
            description="No medical events or caregiver reports match your current filter or search criteria."
          />
        ) : (
          <div className={styles.timelineList}>
            {years.map((year) => (
              <TimelineYearGroup
                key={year}
                year={parseInt(year, 10) || 2026}
                events={groupedEvents[year]}
                onViewEvidence={handleViewEvidence}
              />
            ))}
          </div>
        )}

        {/* Evidence Provenance Drawer */}
        <EvidenceProvenanceDrawer
          selectedEvidenceId={selectedEvidenceId}
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
        />
      </div>
    </AppShell>
  );
}
