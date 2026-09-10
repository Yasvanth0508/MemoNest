"use client";

import * as React from "react";
import { PatientPortalShell } from "@/components/patient";
import { PATIENT_SIDEBAR_SECTIONS } from "@/features/patient-nav";
import { patientService } from "@/services";
import { Patient } from "@/types";
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
import { Search, Database } from "lucide-react";
import styles from "./memory.module.css";

const HEALTH_MEMORY_ITEMS: MemoryCardData[] = [
  // 1. Medical History
  {
    id: "mem-med-01",
    category: "medical_history",
    categoryLabel: "Medical",
    title: "Essential Hypertension",
    date: "2014-06-12",
    description: "Diagnosed 2014; managed with Amlodipine 5mg daily. BP stable.",
    sourceDocument: "MetroHealth Clinic Note",
    author: "Dr. Sharma",
    confidenceScore: 0.96,
    evidenceId: "ev-htn-rx-01",
    badgeVariant: "success",
    status: "managed",
  },
  {
    id: "mem-med-02",
    category: "medical_history",
    categoryLabel: "Medical",
    title: "Type 2 Diabetes Mellitus",
    date: "2016-04-10",
    description: "Diagnosed 2016; Metformin 500mg BID. HbA1c 7.4% stable.",
    sourceDocument: "Endocrine Clinic Note",
    author: "Dr. Sharma",
    confidenceScore: 0.99,
    evidenceId: "ev-lab-metabolic-01",
    badgeVariant: "success",
    status: "managed",
  },
  {
    id: "mem-med-03",
    category: "medical_history",
    categoryLabel: "Medical",
    title: "Knee Osteoarthritis",
    date: "2022-09-18",
    description: "Bilateral grade 3 osteoarthritis; rolling walker prescribed.",
    sourceDocument: "Orthopedic Consult",
    author: "Dr. Campbell",
    confidenceScore: 0.95,
    evidenceId: "ev-walker-mobility-01",
    badgeVariant: "danger",
    status: "active",
  },

  // 2. Medication Memory
  {
    id: "mem-rx-01",
    category: "medication_memory",
    categoryLabel: "Meds",
    title: "Amlodipine 5mg Daily",
    date: "2021-08-10",
    description: "Switched from Lisinopril due to cough; BP controlled.",
    sourceDocument: "Clinic Progress Note",
    author: "Dr. Sharma",
    confidenceScore: 0.96,
    evidenceId: "ev-htn-rx-01",
    badgeVariant: "warning",
    status: "active",
  },
  {
    id: "mem-rx-02",
    category: "medication_memory",
    categoryLabel: "Meds",
    title: "Donepezil 5mg Nightly",
    date: "2024-03-20",
    description: "Initiated for MCI baseline (MoCA 23/30); bedtime dosing.",
    sourceDocument: "Neurological Note",
    author: "Dr. Sharma",
    confidenceScore: 0.97,
    evidenceId: "ev-neuro-consult-01",
    badgeVariant: "secondary",
    status: "active",
  },
  {
    id: "mem-rx-03",
    category: "medication_memory",
    categoryLabel: "Meds",
    title: "Zolpidem 5mg PRN",
    date: "2026-09-05",
    description: "Added for sleep; flagged for high fall risk.",
    sourceDocument: "Prescription Order",
    author: "Dr. Sharma",
    confidenceScore: 0.98,
    evidenceId: "ev-rx-zolpidem-01",
    badgeVariant: "danger",
    status: "high alert",
  },
  {
    id: "mem-rx-04",
    category: "medication_memory",
    categoryLabel: "Meds",
    title: "Aspirin 81mg Daily",
    date: "2018-06-15",
    description: "Post-stroke secondary prophylaxis; Warfarin discontinued.",
    sourceDocument: "Discharge Review",
    author: "Neuro Service",
    confidenceScore: 0.99,
    evidenceId: "ev-stroke-discharge-01",
    badgeVariant: "secondary",
    status: "active",
  },

  // 3. Cognitive Memory
  {
    id: "mem-cog-01",
    category: "cognitive_memory",
    categoryLabel: "Cognitive",
    title: "MCI Baseline (MoCA 23/30)",
    date: "2024-03-20",
    description: "Mild short-term recall delay; supervised ADLs intact.",
    sourceDocument: "Neuropsych Exam",
    author: "Dr. Sharma",
    confidenceScore: 0.97,
    evidenceId: "ev-neuro-consult-01",
    badgeVariant: "warning",
    status: "active",
  },
  {
    id: "mem-cog-02",
    category: "cognitive_memory",
    categoryLabel: "Cognitive",
    title: "Morning Disorientation",
    date: "2026-09-05",
    description: "Caregiver noted episodic morning confusion upon waking.",
    sourceDocument: "Caregiver Shift Note",
    author: "Anita Desai",
    confidenceScore: 0.94,
    badgeVariant: "warning",
    status: "monitoring",
  },

  // 4. Functional Memory
  {
    id: "mem-func-01",
    category: "functional_memory",
    categoryLabel: "Mobility",
    title: "Four-Wheel Walker",
    date: "2025-11-12",
    description: "TUG 16.4s; rolling walker prescribed for ambulation safety.",
    sourceDocument: "PT Assessment",
    author: "Elena Rostova, PT",
    confidenceScore: 0.95,
    evidenceId: "ev-walker-mobility-01",
    badgeVariant: "secondary",
    status: "active device",
  },
  {
    id: "mem-func-02",
    category: "functional_memory",
    categoryLabel: "Mobility",
    title: "Sit-to-Stand Stiffness",
    date: "2026-09-04",
    description: "Requires two-hand leverage and steadying assist from low chairs.",
    sourceDocument: "Caregiver Log",
    author: "Anita Desai",
    confidenceScore: 0.92,
    badgeVariant: "secondary",
    status: "active",
  },

  // 5. Caregiver Observations
  {
    id: "mem-obs-01",
    category: "caregiver_observations",
    categoryLabel: "Notes",
    title: "Bed-to-Chair Fall",
    date: "2026-09-10",
    description: "Dizziness on transfer; minor knee bruise. Second fall in 24h.",
    sourceDocument: "Caregiver Incident Report",
    author: "Anita Desai",
    confidenceScore: 0.99,
    evidenceId: "ev-caregiver-fall-02",
    badgeVariant: "danger",
    status: "urgent",
  },
  {
    id: "mem-obs-02",
    category: "caregiver_observations",
    categoryLabel: "Notes",
    title: "Bathroom Transit Fall",
    date: "2026-09-09",
    description: "Morning fall near bathroom with confusion; no fracture.",
    sourceDocument: "Caregiver Incident Report",
    author: "Anita Desai",
    confidenceScore: 0.98,
    evidenceId: "ev-caregiver-fall-01",
    badgeVariant: "danger",
    status: "urgent",
  },
  {
    id: "mem-obs-03",
    category: "caregiver_observations",
    categoryLabel: "Notes",
    title: "Afternoon Sedation",
    date: "2026-09-07",
    description: "Post-lunch drowsiness and reduced intake following Zolpidem.",
    sourceDocument: "Caregiver Observation",
    author: "Anita Desai",
    confidenceScore: 0.93,
    evidenceId: "ev-caregiver-obs-01",
    badgeVariant: "warning",
    status: "reviewed",
  },

  // 6. Hospitalizations
  {
    id: "mem-hosp-01",
    category: "medical_history",
    categoryLabel: "Medical",
    title: "Ischemic Stroke (10 Days)",
    date: "2018-05-14",
    description: "Right MCA stroke; 10-day rehab; residual left motor weakness.",
    sourceDocument: "Discharge Summary",
    author: "Dr. Chang",
    confidenceScore: 0.99,
    evidenceId: "ev-stroke-discharge-01",
    badgeVariant: "danger",
    status: "historical",
  },

  // 7. Labs
  {
    id: "mem-lab-01",
    category: "labs",
    categoryLabel: "Labs",
    title: "Metabolic & Lipid Panel",
    date: "2026-08-28",
    description: "HbA1c 7.4%, Glucose 132 mg/dL, eGFR 62, Creatinine 1.18.",
    sourceDocument: "Laboratory Report",
    author: "Quest Labs",
    confidenceScore: 0.99,
    evidenceId: "ev-lab-metabolic-01",
    badgeVariant: "secondary",
    status: "completed",
  },
];

export default function HealthMemoryPage() {
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<MemoryCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isEvidenceOpen, setIsEvidenceOpen] = React.useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const p = await patientService.getPatient();
        setPatient(p);
      } catch (err) {
        console.error("Failed to load patient:", err);
      }
    }
    loadData();
  }, []);

  const handleOpenEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setIsEvidenceOpen(true);
  };

  // Category counts calculation
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: HEALTH_MEMORY_ITEMS.length };
    for (const item of HEALTH_MEMORY_ITEMS) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered items
  const filteredItems = React.useMemo(() => {
    return HEALTH_MEMORY_ITEMS.filter((item) => {
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
  }, [activeCategory, searchQuery]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Patient", href: "/patient" },
    { label: "Health Memory" },
  ];

  return (
    <PatientPortalShell>
      <div className={styles.container}>
        {/* Longitudinal Memory Representation */}
        <LongitudinalSummary />

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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search memories"
            />
          </div>

          <div className={styles.statsText}>
            {filteredItems.length} records
          </div>
        </div>

        {/* Memory Cards Grid */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No records found"
            description="No memories match your query."
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
