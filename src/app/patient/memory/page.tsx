"use client";

import * as React from "react";
import { PatientPortalShell } from "@/components/patient";
import { patientService } from "@/services";
import { Patient, TimelineEvent, Medication, CaregiverObservation } from "@/types";
import {
  LongitudinalSummary,
  CategoryTabs,
  MemoryCategory,
  MemoryCard,
  MemoryCardData,
} from "@/features/health-memory";
import { EvidenceDrawer } from "@/components/evidence";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, Database, Loader2 } from "lucide-react";
import styles from "./memory.module.css";

export default function HealthMemoryPage() {
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [observations, setObservations] = React.useState<CaregiverObservation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [activeCategory, setActiveCategory] = React.useState<MemoryCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isEvidenceOpen, setIsEvidenceOpen] = React.useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const p = await patientService.getPatient();
        setPatient(p);

        if (p?.id) {
          const [tlRes, medRes, obsRes] = await Promise.all([
            fetch(`/api/timeline?patientId=${p.id}&email=${encodeURIComponent(p.email || "")}`).catch(() => null),
            fetch(`/api/medications?patientId=${p.id}`).catch(() => null),
            fetch(`/api/caregiver/observations?patientId=${p.id}`).catch(() => null),
          ]);

          if (tlRes && tlRes.ok) {
            const data = await tlRes.json();
            if (data.events) setTimelineEvents(data.events);
          }
          if (medRes && medRes.ok) {
            const data = await medRes.json();
            if (data.medications) setMedications(data.medications);
          }
          if (obsRes && obsRes.ok) {
            const data = await obsRes.json();
            if (data.observations) setObservations(data.observations);
          }
        }
      } catch (err) {
        console.error("Failed to load patient health memory data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setIsEvidenceOpen(true);
  };

  // Synthesize memory cards dynamically from live database
  const memoryItems = React.useMemo<MemoryCardData[]>(() => {
    const items: MemoryCardData[] = [];

    // 1. Conditions -> Medical History
    if (patient?.activeConditions) {
      patient.activeConditions.forEach((cond: string, idx: number) => {
        items.push({
          id: `mem-cond-${idx}`,
          category: "medical_history",
          categoryLabel: "Medical",
          title: cond,
          date: "Established",
          description: `Longitudinal diagnosis active on record for ${patient.name}. Monitored during outpatient geriatric consults.`,
          sourceDocument: "EHR Diagnoses",
          author: patient.primaryDoctor || "Primary Care",
          confidenceScore: 0.98,
          badgeVariant: "success",
          status: "managed",
        });
      });
    }

    // 2. Medications -> Medication Memory
    if (medications.length > 0) {
      medications.forEach((med) => {
        const isWarning = med.fallRiskWarning || med.sedationRisk || med.name.toLowerCase().includes("zolpidem");
        items.push({
          id: `mem-med-${med.id}`,
          category: "medication_memory",
          categoryLabel: "Meds",
          title: `${med.name} ${med.dosage || ""}`,
          date: med.startDate ? new Date(med.startDate).toISOString().split("T")[0] : "Current",
          description: `${med.frequency || "Daily"}. Indication: ${med.indication || "Regimen"}. ${isWarning ? "High fall/sedation risk warning." : ""}`,
          sourceDocument: med.prescriber ? `Rx by ${med.prescriber}` : "Prescription Order",
          author: med.prescriber || "Prescribing Physician",
          confidenceScore: 0.97,
          evidenceId: med.evidenceIds?.[0],
          badgeVariant: isWarning ? "danger" : med.isRecentChange ? "warning" : "secondary",
          status: med.status,
        });
      });
    }

    // 3. Timeline Events -> Categorized Health Memory
    if (timelineEvents.length > 0) {
      timelineEvents.forEach((evt) => {
        let category: MemoryCategory = "medical_history";
        let catLabel = "Medical";

        const titleLower = (evt.title || "").toLowerCase();
        const descLower = (evt.description || "").toLowerCase();

        if (evt.category === "labs" || evt.type === "lab_result" || titleLower.includes("panel") || titleLower.includes("lab")) {
          category = "labs";
          catLabel = "Labs";
        } else if (
          evt.category === "hospitalization" ||
          titleLower.includes("hospital") ||
          titleLower.includes("emergency") ||
          titleLower.includes("admission") ||
          descLower.includes("inpatient")
        ) {
          category = "hospitalizations";
          catLabel = "Hospital";
        } else if (
          evt.category === "cognitive" ||
          titleLower.includes("moca") ||
          titleLower.includes("cognitive") ||
          descLower.includes("memory")
        ) {
          category = "cognitive_memory";
          catLabel = "Cognitive";
        } else if (
          evt.category === "functional" ||
          titleLower.includes("walker") ||
          titleLower.includes("fall") ||
          descLower.includes("mobility")
        ) {
          category = "functional_memory";
          catLabel = "Mobility";
        }

        items.push({
          id: `mem-tl-${evt.id}`,
          category,
          categoryLabel: catLabel,
          title: evt.title,
          date: evt.date,
          description: evt.description,
          sourceDocument: evt.sourceType || "Clinical Encounter",
          author: evt.author || "Healthcare Provider",
          confidenceScore: 0.96,
          evidenceId: evt.sourceId,
          badgeVariant: evt.severity === "high" ? "danger" : evt.severity === "medium" ? "warning" : "secondary",
          status: "verified",
        });
      });
    }

    // 4. Caregiver Observations -> Notes / Mobility / Cognitive
    if (observations.length > 0) {
      observations.forEach((obs) => {
        let cat: MemoryCategory = "caregiver_observations";
        let catLabel = "Notes";

        if (obs.category === "mobility" || obs.category === "fall") {
          cat = "functional_memory";
          catLabel = "Mobility";
        } else if (obs.category === "confusion" || obs.category === "behavior") {
          cat = "cognitive_memory";
          catLabel = "Cognitive";
        }

        items.push({
          id: `mem-obs-${obs.id}`,
          category: cat,
          categoryLabel: catLabel,
          title: `${obs.category.replace(/_/g, " ").toUpperCase()}: Observation`,
          date: obs.timestamp ? new Date(obs.timestamp).toISOString().split("T")[0] : "Recent",
          description: obs.note || obs.notes || obs.summary || "Caregiver daily observation recorded.",
          sourceDocument: "Caregiver Telemetry",
          author: obs.caregiverName || "Caregiver",
          confidenceScore: 0.94,
          badgeVariant: obs.severity === "high" ? "danger" : obs.severity === "medium" ? "warning" : "secondary",
          status: "observed",
        });
      });
    }

    return items;
  }, [patient, medications, timelineEvents, observations]);

  // Derive dynamic milestones for LongitudinalSummary
  const milestones = React.useMemo(() => {
    if (!timelineEvents || timelineEvents.length === 0) {
      return [
        { year: 2014, label: "Hypertension" },
        { year: 2016, label: "Diabetes" },
        { year: 2018, label: "Stroke" },
        { year: 2021, label: "Amlodipine" },
        { year: 2022, label: "Osteoarthritis" },
        { year: 2024, label: "MCI" },
        { year: 2026, label: "Falls" },
      ];
    }

    const yearMap = new Map<number | string, string>();
    timelineEvents.forEach((e) => {
      const yr = e.date ? e.date.split("-")[0] : "2026";
      if (!yearMap.has(yr)) {
        yearMap.set(yr, e.title.split(" ")[0]);
      }
    });

    const list = Array.from(yearMap.entries())
      .map(([year, label]) => ({ year, label }))
      .sort((a, b) => Number(a.year) - Number(b.year));

    return list.length > 0 ? list : undefined;
  }, [timelineEvents]);

  // Category counts calculation
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: memoryItems.length };
    for (const item of memoryItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [memoryItems]);

  // Filtered items
  const filteredItems = React.useMemo(() => {
    return memoryItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.sourceDocument.toLowerCase().includes(q) ||
        (item.author && item.author.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, memoryItems]);

  return (
    <PatientPortalShell>
      <div className={styles.container}>
        {/* Longitudinal Memory Representation */}
        <LongitudinalSummary milestones={milestones} domainCount={Object.keys(categoryCounts).length - 1 || 7} />

        {/* Category Selector Tabs */}
        <CategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          categoryCounts={categoryCounts}
        />

        {/* Search & Stats Bar */}
        <div className={styles.searchBarRow}>
          <div className={styles.searchInputWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search memories"
            />
          </div>

          <div className={styles.statsText}>
            {isLoading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Loader2 size={14} className="animate-spin" /> Syncing database...
              </span>
            ) : (
              `${filteredItems.length} records`
            )}
          </div>
        </div>

        {/* Memory Cards Grid */}
        {filteredItems.length === 0 && !isLoading ? (
          <EmptyState
            icon={Database}
            title="No records found"
            description="No memories match your filter criteria."
          />
        ) : (
          <div className={styles.cardsGrid}>
            {filteredItems.map((item) => (
              <MemoryCard
                key={item.id}
                data={item}
                onViewEvidence={handleOpenEvidence}
              />
            ))}
          </div>
        )}
      </div>

      {/* Integrated Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        evidenceId={selectedEvidenceId}
      />
    </PatientPortalShell>
  );
}
