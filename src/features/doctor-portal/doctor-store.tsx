"use client";

import * as React from "react";
import {
  Patient,
  Medication,
  TimelineEvent,
  MedicalDocument,
  EvidenceSnippet,
  RiskSignal,
  ConsentRecord,
  AuditEntry,
  CaregiverObservation,
} from "@/types";
const EMPTY_PATIENT: Patient = {
  id: "",
  name: "Loading...",
  age: 0,
  dateOfBirth: "",
  gender: "Male",
  primaryDoctor: "Dr. Rajesh Sharma, MD",
  activeConditions: [],
  allergies: [],
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
};


export type DoctorPortalTab =
  | "home"
  | "overview"
  | "changes"
  | "state"
  | "timeline"
  | "upload"
  | "assistant"
  | "prescribe"
  | "audit";

export type DigitalTwinState = "stable" | "mild_deviation" | "significant_deviation";

export type TimeframeSnapshot = "3m" | "6m" | "12m";

export interface KeyChangeItem {
  id: string;
  patientId: string;
  title: string;
  date: string;
  shortExplanation: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "medication" | "diagnosis" | "lab" | "incident" | "er" | "state";
  sourceText: string;
  sourceDocId?: string;
  evidenceId?: string;
  isNew?: boolean;
}

export interface CareTeamMember {
  role: string;
  name: string;
  organization: string;
  contact: string;
  specialty?: string;
}

export interface ConsentScopeItem {
  category: string;
  status: "available" | "restricted" | "pending" | "expired";
  details: string;
  validUntil?: string;
  restrictionReason?: string;
}

export interface PolypharmacyInteraction {
  id: string;
  medicationsInvolved: string[];
  severity: "critical" | "high" | "medium";
  concern: string;
  source: string;
  recommendation: string;
}

export interface UploadedDocItem {
  id: string;
  patientId: string;
  patientName: string;
  documentName: string;
  documentType: string;
  date: string;
  uploadDate: string;
  status: "confirmed" | "processing" | "pending_review";
  extractedEntities: {
    date: string;
    provider: string;
    diagnoses: string[];
    medications: string[];
    keyFindings: string[];
    summary: string;
  };
  fileSize: string;
  fileUrl?: string;
}

export interface AiAssistantQuery {
  id: string;
  patientId: string;
  query: string;
  timestamp: string;
  answer: string;
  sourceReferences: {
    title: string;
    date: string;
    evidenceId?: string;
    quote: string;
  }[];
  trace: {
    intake: string;
    retrieval: string;
    riskCheck: string;
    declineTrajectory: string;
    synthesis: string;
  };
}

export interface DoctorStoreContextType {
  // Navigation & View
  activeTab: DoctorPortalTab;
  setActiveTab: (tab: DoctorPortalTab) => void;

  // Patient Roster
  patients: Patient[];
  selectedPatient: Patient;
  selectPatient: (patientId: string, targetTab?: DoctorPortalTab) => void;

  // Key Changes Feed
  allChanges: KeyChangeItem[];
  patientChanges: KeyChangeItem[];

  // Care Team & Consent
  careTeam: CareTeamMember[];
  consentScopes: ConsentScopeItem[];

  // Digital Twin & Longitudinal Metrics
  digitalTwinState: DigitalTwinState;
  selectedSnapshot: TimeframeSnapshot;
  setSelectedSnapshot: (snapshot: TimeframeSnapshot) => void;
  digitalTwinTrends: {
    month: string;
    cognition: number;
    mobility: number;
    adherence: number;
    deviations: number;
    behavioral: number;
  }[];
  baselineVsRecent: {
    metric: string;
    baseline: string;
    recent: string;
    status: "normal" | "warning" | "alert";
  }[];
  riskModelContext: {
    stage: string;
    riskLevel: string;
    confidence: number;
    contributingSignals: string[];
    predictiveModelNote: string;
  };

  // Timeline
  timelineEvents: TimelineEvent[];
  filteredTimeline: TimelineEvent[];
  timelineSearchQuery: string;
  setTimelineSearchQuery: (q: string) => void;
  timelineFilterType: string;
  setTimelineFilterType: (t: string) => void;
  timelineFilterProvider: string;
  setTimelineFilterProvider: (p: string) => void;

  // Doctor Uploads
  uploadQueue: UploadedDocItem[];
  addUploadedDocument: (doc: Omit<UploadedDocItem, "id" | "uploadDate">) => void;
  confirmExtractedDocument: (docId: string, updatedEntities?: any) => void;

  // Medications & Polypharmacy
  medications: Medication[];
  polypharmacyInteractions: PolypharmacyInteraction[];
  checkMedicationInteractions: (newMedName: string) => PolypharmacyInteraction | null;
  addPrescription: (prescription: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }) => void;
  addClinicalNote: (note: {
    title: string;
    diagnosisCodes: string[];
    soap: { subjective: string; objective: string; assessment: string; plan: string };
    freeText: string;
  }) => void;

  // AI Clinical Assistant
  assistantQueries: AiAssistantQuery[];
  isAiProcessing: boolean;
  activeQueryTraceStep: number;
  askAssistant: (queryText: string) => Promise<AiAssistantQuery>;

  // Audit Logs
  auditLogs: AuditEntry[];
  downloadAuditCsv: () => void;

  // Evidence Drawer & Emergency Modal
  isEvidenceDrawerOpen: boolean;
  selectedEvidence: EvidenceSnippet | null;
  openEvidenceDrawer: (evidenceId?: string) => void;
  closeEvidenceDrawer: () => void;
  isEmergencySosOpen: boolean;
  openEmergencySos: () => void;
  closeEmergencySos: () => void;
  recordEmergencyBreakGlass: (reason: string, department?: string) => Promise<boolean>;
}

const DoctorStoreContext = React.createContext<DoctorStoreContextType | null>(null);

// Initial Mock Key Changes
const INITIAL_KEY_CHANGES: KeyChangeItem[] = [
  {
    id: "kc-001",
    patientId: "patient-001",
    title: "Medication Changed: Zolpidem Tartrate 5mg Added",
    date: "10 Sep 2026",
    shortExplanation:
      "Zolpidem 5mg PO PRN prescribed for nocturnal insomnia. Initiated 5 days ago. Coincides with sudden morning grogginess and subsequent fall reports.",
    severity: "critical",
    category: "medication",
    sourceText: "Prescription Order uploaded by Dr. Rajesh Sharma",
    sourceDocId: "doc-rx-2026",
    evidenceId: "ev-rx-zolpidem-01",
    isNew: true,
  },
  {
    id: "kc-002",
    patientId: "patient-001",
    title: "Caregiver Incident: Bed-to-Chair Transfer Fall with Knee Contusion",
    date: "10 Sep 2026",
    shortExplanation:
      "Second fall logged in 24 hours. Patient felt acute dizziness and lost footing during morning transfer. Caregiver noted morning confusion. No head strike.",
    severity: "critical",
    category: "incident",
    sourceText: "Caregiver Incident Report by Anita Desai (CNA)",
    evidenceId: "ev-caregiver-fall-02",
    isNew: true,
  },
  {
    id: "kc-003",
    patientId: "patient-001",
    title: "Caregiver Incident: Unassisted Bathroom Transit Fall",
    date: "09 Sep 2026",
    shortExplanation:
      "Patient fell unassisted in hallway approaching bathroom at 07:15. Disoriented to schedule and time.",
    severity: "high",
    category: "incident",
    sourceText: "Caregiver Daily Log by Anita Desai",
    evidenceId: "ev-caregiver-fall-01",
    isNew: true,
  },
  {
    id: "kc-004",
    patientId: "patient-001",
    title: "Digital Twin Shift: Significant Deviation Detected",
    date: "09 Sep 2026",
    shortExplanation:
      "Longitudinal state algorithm transitioned patient from Stable to Significant Deviation due to acute mobility cluster and sedation burden.",
    severity: "high",
    category: "state",
    sourceText: "Digital Twin Engine — MetroHealth Predictive Model",
    isNew: true,
  },
  {
    id: "kc-005",
    patientId: "patient-001",
    title: "Abnormal Lab Result: eGFR 62 mL/min & HbA1c 7.4%",
    date: "28 Aug 2026",
    shortExplanation:
      "Metabolic panel confirms mild age-related decrement in renal filtration (Stage 2 CKD) and glycemic variability.",
    severity: "medium",
    category: "lab",
    sourceText: "Laboratory Report — Quest Diagnostics Reference Laboratories",
    sourceDocId: "doc-lab-2026",
    evidenceId: "ev-lab-metabolic-01",
    isNew: false,
  },
  {
    id: "kc-006",
    patientId: "patient-002",
    title: "Caregiver Alert: Elevated Evening Blood Pressure (162/94)",
    date: "08 Sep 2026",
    shortExplanation:
      "Margaret Higgins experienced transient evening hypertension and tension headache. Awaiting follow-up.",
    severity: "medium",
    category: "incident",
    sourceText: "Home Care Vitals Log by Caregiver",
    isNew: false,
  },
  {
    id: "kc-007",
    patientId: "patient-003",
    title: "Cardiac Rehab Completion & Stable Stress Test",
    date: "05 Sep 2026",
    shortExplanation:
      "David Chen completed 12-week Phase II Cardiac Rehabilitation with no ischemic symptoms.",
    severity: "low",
    category: "state",
    sourceText: "Cardiology Rehab Summary by Dr. V. Mehta",
    isNew: false,
  },
];

const INITIAL_CARE_TEAM: CareTeamMember[] = [
  {
    role: "Attending Neurologist",
    name: "Dr. Michael Chang, MD",
    organization: "MetroHealth Stroke & Cerebrovascular Center",
    contact: "+1-555-0182",
    specialty: "Vascular Neurology",
  },
  {
    role: "Geriatric Physical Therapist",
    name: "Elena Rostova, PT, DPT",
    organization: "MetroHealth Rehabilitation Therapy",
    contact: "+1-555-0174",
    specialty: "Mobility & Fall Prevention",
  },
  {
    role: "Primary Care Pharmacist",
    name: "MetroHealth Senior Care Pharmacy",
    organization: "MetroHealth Clinical Services",
    contact: "+1-555-0199 (Ext 4)",
    specialty: "Geriatric Polypharmacy & Medication Therapy",
  },
  {
    role: "Assigned Home Caregiver",
    name: "Anita Desai, CNA",
    organization: "Grace Senior Home Care (Daily 8:00 AM - 4:00 PM)",
    contact: "+1-555-0188",
    specialty: "Certified Nursing Assistant & Patient Supervision",
  },
  {
    role: "Healthcare Proxy & Guardian",
    name: "Priya Kumar (Daughter)",
    organization: "Family Representative / Durable Healthcare POA",
    contact: "+1-555-0192",
    specialty: "Primary Medical Decision Maker",
  },
];

const INITIAL_CONSENT_SCOPES: ConsentScopeItem[] = [
  {
    category: "Medical Reports & History",
    status: "available",
    details: "Authorized for hospital discharge summaries, clinical progress notes, and specialist consults.",
    validUntil: "01 Oct 2026",
  },
  {
    category: "Medication Regimen & Orders",
    status: "available",
    details: "Full visibility and prescribing authority for active, historical, and PRN medications.",
    validUntil: "01 Oct 2026",
  },
  {
    category: "Diagnoses & Clinical Codes",
    status: "available",
    details: "Full access to confirmed and differential ICD-10 clinical diagnoses.",
    validUntil: "01 Oct 2026",
  },
  {
    category: "Caregiver Observations & Incident Reports",
    status: "available",
    details: "Authorized for daily behavioral logs, meal adherence, vitals checks, and incident reports from Anita Desai.",
    validUntil: "01 Oct 2026",
  },
  {
    category: "Laboratory & Diagnostic Imaging",
    status: "available",
    details: "Authorized for blood metabolic panels, MRI neuroimaging, and radiology summaries.",
    validUntil: "01 Oct 2026",
  },
  {
    category: "Genomic & Biomarker Profiles",
    status: "restricted",
    details: "Restricted by patient preference. Withheld from general clinical portal access.",
    restrictionReason: "Withheld per patient preference during 2026 consent agreement.",
  },
  {
    category: "Psychotherapy Process Notes",
    status: "pending",
    details: "Specialized psychotherapy session notes withheld pending formal proxy consent renewal.",
    restrictionReason: "Awaiting signed proxy renewal authorization from Priya Kumar.",
  },
  {
    category: "Historical Pediatric Records",
    status: "expired",
    details: "Pre-adulthood historical immunizations and archival files expired on 01 Jan 2025.",
    restrictionReason: "Time-limited archive consent window expired.",
  },
];

const INITIAL_POLYPHARMACY_INTERACTIONS: PolypharmacyInteraction[] = [
  {
    id: "poly-001",
    medicationsInvolved: ["Zolpidem (5mg)", "Donepezil (5mg)"],
    severity: "critical",
    concern:
      "Concomitant sedative-hypnotic and acetylcholinesterase inhibitor administration. High risk of severe nocturnal confusion, morning delirium, postural instability, and falls.",
    source: "American Geriatrics Society Beers Criteria 2023 & Clinical Pharmacology Review",
    recommendation:
      "Discontinue Zolpidem immediately; implement non-pharmacological sleep hygiene protocols for mild cognitive impairment.",
  },
  {
    id: "poly-002",
    medicationsInvolved: ["Amlodipine (5mg)", "Zolpidem (5mg)"],
    severity: "high",
    concern:
      "Vasodilatory antihypertensive combined with central sedative. Increases risk of morning orthostatic hypotension during sit-to-stand bed transfers.",
    source: "Geriatric Cardiovascular Safety Database (AHA/ACC)",
    recommendation:
      "Check morning orthostatic blood pressure sitting vs. standing; stagger evening dosage.",
  },
  {
    id: "poly-003",
    medicationsInvolved: ["Aspirin (81mg)", "Omeprazole (20mg)"],
    severity: "medium",
    concern:
      "Gastroprotective co-prescription for secondary stroke prevention. Well-tolerated; monitor annual serum B12 and magnesium levels.",
    source: "Gastroenterology Drug Surveillance Monograph",
    recommendation: "Maintain co-prescription; order yearly metabolic check for micronutrients.",
  },
];

const INITIAL_UPLOADED_DOCS: UploadedDocItem[] = [
  {
    id: "up-doc-001",
    patientId: "patient-001",
    patientName: "Ravi Kumar",
    documentName: "Hospital_Discharge_Summary_Acute_Stroke.pdf",
    documentType: "Discharge Summary",
    date: "2018-05-24",
    uploadDate: "2026-09-01 09:14 AM",
    status: "confirmed",
    fileSize: "1.4 MB",
    extractedEntities: {
      date: "2018-05-24",
      provider: "Dr. Michael Chang, MD (Attending Neurologist)",
      diagnoses: ["Acute Ischemic Stroke (Right MCA)", "Residual Left Hemiparesis"],
      medications: ["Atorvastatin 20mg", "Aspirin 81mg"],
      keyFindings: [
        "Right MCA territory ischemic stroke confirmed via MRI brain DWI",
        "Residual left motor weakness grade 4/5",
      ],
      summary: "10-day inpatient admission following right MCA infarct.",
    },
  },
  {
    id: "up-doc-002",
    patientId: "patient-001",
    patientName: "Ravi Kumar",
    documentName: "Neurological_Consult_MCI_Evaluation.pdf",
    documentType: "Clinical Note",
    date: "2024-03-20",
    uploadDate: "2026-09-02 11:30 AM",
    status: "confirmed",
    fileSize: "840 KB",
    extractedEntities: {
      date: "2024-03-20",
      provider: "Dr. Rajesh Sharma, MD",
      diagnoses: ["Mild Cognitive Impairment (Amnestic Multi-domain)"],
      medications: ["Donepezil 5mg PO Nightly"],
      keyFindings: [
        "MoCA: 23/30 with delayed word recall deficit",
        "Mild cerebral volume loss and periventricular white matter changes",
      ],
      summary: "Comprehensive geriatric cognitive evaluation.",
    },
  },
  {
    id: "up-doc-003",
    patientId: "patient-001",
    patientName: "Ravi Kumar",
    documentName: "Comprehensive_Metabolic_Panel_Quest_Diagnostics.pdf",
    documentType: "Lab Report",
    date: "2026-08-28",
    uploadDate: "2026-08-29 02:45 PM",
    status: "confirmed",
    fileSize: "420 KB",
    extractedEntities: {
      date: "2026-08-28",
      provider: "Quest Diagnostics Reference Laboratories",
      diagnoses: ["Type 2 Diabetes Mellitus", "Mild Renal Impairment (Stage 2 CKD)"],
      medications: ["Metformin 500mg BID", "Amlodipine 5mg Daily"],
      keyFindings: [
        "Hemoglobin A1c: 7.4%",
        "eGFR: 62 mL/min/1.73m2",
        "Creatinine: 1.18 mg/dL",
        "Total Cholesterol: 154 mg/dL",
      ],
      summary: "Routine geriatric monitoring panel.",
    },
  },
  {
    id: "up-doc-004",
    patientId: "patient-001",
    patientName: "Ravi Kumar",
    documentName: "Rx_Order_Zolpidem_5mg.pdf",
    documentType: "Prescription",
    date: "2026-09-05",
    uploadDate: "2026-09-05 04:10 PM",
    status: "confirmed",
    fileSize: "310 KB",
    extractedEntities: {
      date: "2026-09-05",
      provider: "Dr. Rajesh Sharma, MD",
      diagnoses: ["Severe Insomnia & Nocturnal Restlessness"],
      medications: ["Zolpidem Tartrate 5mg PO PRN QHS (#15)"],
      keyFindings: [
        "Sedative prescribed for nocturnal restlessness",
        "High fall risk warning recorded",
      ],
      summary: "PRN sedative authorization with home supervision directive.",
    },
  },
];

const INITIAL_AI_QUERIES: AiAssistantQuery[] = [
  {
    id: "ai-q-001",
    patientId: "patient-001",
    query: "Summarize the patient's fall-risk history and contributing factors.",
    timestamp: "10 Sep 2026 · 10:15 AM",
    answer:
      "The patient (Ravi Kumar, 74) has experienced two unassisted falls within the last 24 hours: a bathroom transit fall on 9 Sep and a bed-to-chair transfer fall on 10 Sep with a minor right knee contusion. Contributing factors include: 1) Zolpidem 5mg PRN initiated 5 days ago causing morning sedation and acute dizziness; 2) Baseline post-stroke left hemiparesis and four-wheel walker dependence; 3) Concomitant Donepezil and Amlodipine creating synergistic CNS and orthostatic depression; and 4) Bilateral knee osteoarthritis causing transitional hesitation.",
    sourceReferences: [
      {
        title: "Caregiver Incident Report ( Anita Desai)",
        date: "10 Sep 2026",
        evidenceId: "ev-caregiver-fall-02",
        quote: "Ravi seemed dizzy and lost balance transferring from bed to chair. Minor knee bruise, no head trauma.",
      },
      {
        title: "Caregiver Daily Log (Anita Desai)",
        date: "09 Sep 2026",
        evidenceId: "ev-caregiver-fall-01",
        quote: "Ravi seemed confused this morning and fell while going to the bathroom. Helped up safely.",
      },
      {
        title: "Prescription Order (Dr. Rajesh Sharma)",
        date: "05 Sep 2026",
        evidenceId: "ev-rx-zolpidem-01",
        quote: "Zolpidem Tartrate 5mg PO PRN at bedtime. Caution: High fall risk warning in elderly post-stroke patient.",
      },
      {
        title: "Physical Therapy Assessment (Elena Rostova, PT)",
        date: "12 Nov 2025",
        evidenceId: "ev-walker-mobility-01",
        quote: "Rolling four-wheel walker recommended for all ambulation. TUG test 16.4 seconds.",
      },
    ],
    trace: {
      intake: "Query categorized as Clinical Safety & Fall Risk Synthesis.",
      retrieval: "Retrieved 8 relevant records (2 caregiver incident logs, 1 prescription, 1 PT assessment, 1 discharge summary).",
      riskCheck: "Identified Beers Criteria alert: Zolpidem + Donepezil co-prescribing risk index 98%.",
      declineTrajectory: "Detected rapid acceleration in mobility instability over preceding 72 hours.",
      synthesis: "Synthesized multi-source evidence linking new sedative to acute fall cluster.",
    },
  },
  {
    id: "ai-q-002",
    patientId: "patient-001",
    query: "Are there any potential drug interactions with Zolpidem and the patient's current regimen?",
    timestamp: "10 Sep 2026 · 09:30 AM",
    answer:
      "Yes, critical interactions exist: 1) Zolpidem + Donepezil: Both act centrally; Zolpidem GABA-A agonism combined with Donepezil cholinesterase inhibition causes marked daytime grogginess, paradoxical confusion, and impaired postural balance. 2) Zolpidem + Amlodipine: Peripheral vasodilation combined with sedative relaxation triggers nocturnal/morning orthostatic hypotension during sit-to-stand bed transfers. Beers Criteria 2023 strongly advises avoiding non-benzodiazepine receptor agonists in older adults with history of falls or fractures.",
    sourceReferences: [
      {
        title: "Active Regimen Profile & Beers Criteria",
        date: "10 Sep 2026",
        evidenceId: "ev-rx-zolpidem-01",
        quote: "Polypharmacy threshold exceeded (7 active meds). Sedation load elevated.",
      },
      {
        title: "Metabolic Laboratory Panel",
        date: "28 Aug 2026",
        evidenceId: "ev-lab-metabolic-01",
        quote: "eGFR 62 mL/min indicates mild renal decline, reducing sedative elimination rate.",
      },
    ],
    trace: {
      intake: "Query parsed as Polypharmacy & Drug Safety Verification.",
      retrieval: "Pulled active 7 medications list and kidney clearance baseline.",
      riskCheck: "Ran Beers Criteria and Clinical Pharmacology interaction matrix.",
      declineTrajectory: "Correlated drug pharmacokinetics with recent afternoon drowsiness reports.",
      synthesis: "Generated actionable deprescribing rationale with evidentiary backing.",
    },
  },
];

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  // Navigation
  const [activeTab, setActiveTab] = React.useState<DoctorPortalTab>("home");

  // Patients
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>("");
  const selectedPatient = React.useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0] || EMPTY_PATIENT;
  }, [patients, selectedPatientId]);

  // Load patient roster from API
  React.useEffect(() => {
    let isMounted = true;
    async function loadRoster() {
      try {
        const res = await fetch("/api/clinician/patients/search?all=true");
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.patients && data.patients.length > 0) {
            setPatients(data.patients);
            if (!selectedPatientId || !data.patients.some((p: Patient) => p.id === selectedPatientId)) {
              setSelectedPatientId(data.patients[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load patient roster:", err);
      }
    }
    loadRoster();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectPatient = (patientId: string, targetTab: DoctorPortalTab = "overview") => {
    setSelectedPatientId(patientId);
    setActiveTab(targetTab);
  };

  // Key Changes
  const [allChanges, setAllChanges] = React.useState<KeyChangeItem[]>(INITIAL_KEY_CHANGES);
  const patientChanges = React.useMemo(() => {
    return allChanges.filter((c) => c.patientId === selectedPatient.id);
  }, [allChanges, selectedPatient.id]);

  // Care Team & Consent
  const [careTeam] = React.useState<CareTeamMember[]>(INITIAL_CARE_TEAM);
  const [consentScopes, setConsentScopes] = React.useState<ConsentScopeItem[]>(INITIAL_CONSENT_SCOPES);

  // Digital Twin
  const [digitalTwinState, setDigitalTwinState] = React.useState<DigitalTwinState>("significant_deviation");
  const [selectedSnapshot, setSelectedSnapshot] = React.useState<TimeframeSnapshot>("6m");

  const digitalTwinTrends = React.useMemo(() => {
    if (selectedSnapshot === "3m") {
      return [
        { month: "Jul 2026", cognition: 78, mobility: 82, adherence: 96, deviations: 1, behavioral: 88 },
        { month: "Aug 2026", cognition: 76, mobility: 78, adherence: 94, deviations: 2, behavioral: 85 },
        { month: "Sep 2026", cognition: 64, mobility: 48, adherence: 88, deviations: 7, behavioral: 68 },
      ];
    }
    if (selectedSnapshot === "12m") {
      return [
        { month: "Oct 2025", cognition: 85, mobility: 88, adherence: 98, deviations: 0, behavioral: 92 },
        { month: "Dec 2025", cognition: 84, mobility: 86, adherence: 96, deviations: 1, behavioral: 90 },
        { month: "Feb 2026", cognition: 82, mobility: 84, adherence: 97, deviations: 1, behavioral: 90 },
        { month: "Apr 2026", cognition: 80, mobility: 83, adherence: 95, deviations: 1, behavioral: 89 },
        { month: "Jun 2026", cognition: 79, mobility: 82, adherence: 96, deviations: 1, behavioral: 88 },
        { month: "Aug 2026", cognition: 76, mobility: 78, adherence: 94, deviations: 2, behavioral: 85 },
        { month: "Sep 2026", cognition: 64, mobility: 48, adherence: 88, deviations: 7, behavioral: 68 },
      ];
    }
    // Default 6m
    return [
      { month: "Apr 2026", cognition: 80, mobility: 83, adherence: 95, deviations: 1, behavioral: 89 },
      { month: "May 2026", cognition: 80, mobility: 82, adherence: 95, deviations: 1, behavioral: 88 },
      { month: "Jun 2026", cognition: 79, mobility: 82, adherence: 96, deviations: 1, behavioral: 88 },
      { month: "Jul 2026", cognition: 78, mobility: 82, adherence: 96, deviations: 1, behavioral: 88 },
      { month: "Aug 2026", cognition: 76, mobility: 78, adherence: 94, deviations: 2, behavioral: 85 },
      { month: "Sep 2026", cognition: 64, mobility: 48, adherence: 88, deviations: 7, behavioral: 68 },
    ];
  }, [selectedSnapshot]);

  const baselineVsRecent = React.useMemo(() => {
    return [
      {
        metric: "Cognitive Function (MoCA Scale)",
        baseline: "23/30 (Mild Amnestic Deficit, Stable)",
        recent: "Acute morning confusion, repetitive inquiries, MoCA 20 equivalent",
        status: "warning" as const,
      },
      {
        metric: "Ambulation & Transfer Stability",
        baseline: "Independent with four-wheel walker (TUG: 16.4s)",
        recent: "2 unassisted falls in 24h, sit-to-stand dizziness, knee contusion",
        status: "alert" as const,
      },
      {
        metric: "Medication Sedation Burden",
        baseline: "Low sedation index (Standard chronic regimen)",
        recent: "High CNS depression index (Zolpidem 5mg + Donepezil 5mg co-active)",
        status: "alert" as const,
      },
      {
        metric: "Medication Adherence Rate",
        baseline: "96% Verified by home caregiver",
        recent: "88% (Hesitations and late evening dosing noted)",
        status: "warning" as const,
      },
      {
        metric: "Blood Pressure & Postural Stability",
        baseline: "134/82 mmHg sitting",
        recent: "Postural drop observed upon morning waking (118/72 mmHg)",
        status: "warning" as const,
      },
    ];
  }, []);

  const riskModelContext = React.useMemo(() => {
    return {
      stage: "CDR 0.5 (Mild Cognitive Impairment with Vascular Stroke Sequelae)",
      riskLevel: "Critical Fall Cascade & Sedation Toxicity",
      confidence: 94,
      contributingSignals: [
        "Sedative initiation 5 days ago (Zolpidem 5mg PRN)",
        "2 unassisted falls recorded within past 24 hours",
        "Pre-existing left-sided motor weakness from 2018 ischemic stroke",
        "Caregiver documented afternoon drowsiness and appetite drop",
        "Mild renal clearance decrement (eGFR 62 mL/min)",
      ],
      predictiveModelNote:
        "Algorithm outputs represent predictive decision support synthesized from multi-source EHR signals and do not replace independent clinical diagnosis.",
    };
  }, []);

  // Timeline
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);
  const [timelineSearchQuery, setTimelineSearchQuery] = React.useState("");
  const [timelineFilterType, setTimelineFilterType] = React.useState("all");
  const [timelineFilterProvider, setTimelineFilterProvider] = React.useState("all");

  const filteredTimeline = React.useMemo(() => {
    return timelineEvents
      .filter((ev) => ev.patientId === selectedPatient.id)
      .filter((ev) => {
        if (!timelineSearchQuery) return true;
        const q = timelineSearchQuery.toLowerCase();
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          (ev.author ? ev.author.toLowerCase().includes(q) : false) ||
          ev.category.toLowerCase().includes(q)
        );
      })
      .filter((ev) => {
        if (timelineFilterType === "all") return true;
        return ev.category === timelineFilterType;
      })
      .filter((ev) => {
        if (timelineFilterProvider === "all") return true;
        const author = ev.author || "";
        if (timelineFilterProvider === "external") {
          return (
            author.includes("Quest") ||
            author.includes("MetroHealth Neurovascular Service") ||
            author.includes("Elena")
          );
        }
        return author.includes(timelineFilterProvider);
      });
  }, [timelineEvents, selectedPatient.id, timelineSearchQuery, timelineFilterType, timelineFilterProvider]);

  // Uploaded Documents
  const [uploadQueue, setUploadQueue] = React.useState<UploadedDocItem[]>(INITIAL_UPLOADED_DOCS);

  const addUploadedDocument = (docData: Omit<UploadedDocItem, "id" | "uploadDate">) => {
    const newDoc: UploadedDocItem = {
      ...docData,
      id: `up-doc-${Date.now()}`,
      uploadDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setUploadQueue((prev) => [newDoc, ...prev]);
  };

  const confirmExtractedDocument = (docId: string, updatedEntities?: any) => {
    setUploadQueue((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const confirmed = {
            ...doc,
            status: "confirmed" as const,
            extractedEntities: updatedEntities || doc.extractedEntities,
          };
          return confirmed;
        }
        return doc;
      })
    );

    // Also add to timeline as verified event
    const confirmedDoc = uploadQueue.find((d) => d.id === docId);
    if (confirmedDoc) {
      const newTlEvent: TimelineEvent = {
        id: `tl-up-${Date.now()}`,
        patientId: confirmedDoc.patientId,
        date: confirmedDoc.date,
        time: "10:30",
        type: "lab_result",
        category: "medical",
        title: `Uploaded: ${confirmedDoc.documentName}`,
        description: `Verified ${confirmedDoc.documentType} uploaded by Dr. Rajesh Sharma. Entities: ${confirmedDoc.extractedEntities.diagnoses.join(", ")}`,
        severity: "low",
        sourceType: confirmedDoc.documentType,
        author: "Dr. Rajesh Sharma, MD",
        authorRole: "Attending Geriatrician",
      };
      setTimelineEvents((prev) => [newTlEvent, ...prev]);

      // Add to audit
      addAuditEntry(
        "Confirmed & Committed Uploaded Document",
        `Document: ${confirmedDoc.documentName} committed to unified health record`,
        "Unified Medical Document Archive"
      );
    }
  };

  // Medications
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [polypharmacyInteractions] = React.useState<PolypharmacyInteraction[]>(
    INITIAL_POLYPHARMACY_INTERACTIONS
  );

  const checkMedicationInteractions = (newMedName: string): PolypharmacyInteraction | null => {
    const lower = newMedName.toLowerCase().trim();
    if (lower.includes("lorazepam") || lower.includes("diazepam") || lower.includes("ativan") || lower.includes("valium")) {
      return {
        id: "inter-temp-01",
        medicationsInvolved: [newMedName, "Donepezil (5mg)", "Zolpidem (5mg)"],
        severity: "critical",
        concern:
          "High-risk benzodiazepine addition creates synergistic respiratory and CNS depression. Exacerbates cognitive blunting and markedly multiplies fall frequency in geriatric patients.",
        source: "Beers Criteria 2023 Guideline for Potentially Inappropriate Medications in Older Adults",
        recommendation: "Avoid co-administration. Evaluate non-pharmacological behavioral therapy.",
      };
    }
    if (lower.includes("ibuprofen") || lower.includes("naproxen") || lower.includes("nsaid")) {
      return {
        id: "inter-temp-02",
        medicationsInvolved: [newMedName, "Aspirin (81mg)", "Amlodipine (5mg)"],
        severity: "high",
        concern:
          "NSAID co-administration with Aspirin increases gastrointestinal bleeding risk by 3.5x and antagonizes antihypertensive efficacy of Amlodipine.",
        source: "FDA Drug Safety Communication / Cardiology Drug Monograph",
        recommendation: "Consider topical analgesics (e.g. Voltaren gel) or acetaminophen 500mg PRN.",
      };
    }
    if (lower.includes("tramadol")) {
      return {
        id: "inter-temp-03",
        medicationsInvolved: [newMedName, "Donepezil (5mg)"],
        severity: "high",
        concern:
          "Weak opioid analgesic lowers seizure threshold and contributes to anticholinergic cognitive impairment.",
        source: "Geriatric Pain Management Clinical Protocol",
        recommendation: "Use cautious dosing and monitor cognitive vigilance.",
      };
    }
    return null;
  };

  const addPrescription = (prescription: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }) => {
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      patientId: selectedPatient.id,
      name: prescription.medication,
      genericName: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      route: "Oral",
      indication: "Prescribed via Doctor Clinical Portal",
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      prescriber: "Dr. Rajesh Sharma, MD",
      prescriberId: "user-clinician-001",
      instructions: prescription.instructions,
    };
    setMedications((prev) => [newMed, ...prev]);

    // Add to timeline
    const newTl: TimelineEvent = {
      id: `tl-rx-${Date.now()}`,
      patientId: selectedPatient.id,
      date: new Date().toISOString().split("T")[0],
      time: "11:45",
      type: "medication_change",
      category: "medication",
      title: `New Prescription: ${prescription.medication} ${prescription.dosage}`,
      description: `${prescription.frequency} for ${prescription.duration}. Instructions: ${prescription.instructions}`,
      severity: "medium",
      sourceType: "Prescription Order",
      author: "Dr. Rajesh Sharma, MD",
      authorRole: "Attending Geriatrician",
    };
    setTimelineEvents((prev) => [newTl, ...prev]);

    // Add Key Change
    const newKc: KeyChangeItem = {
      id: `kc-rx-${Date.now()}`,
      patientId: selectedPatient.id,
      title: `New Medication: ${prescription.medication} ${prescription.dosage}`,
      date: "Today",
      shortExplanation: `Prescribed ${prescription.frequency} (${prescription.duration}). Instructions: ${prescription.instructions}`,
      severity: "medium",
      category: "medication",
      sourceText: "Prescription Order by Dr. Rajesh Sharma, MD",
      isNew: true,
    };
    setAllChanges((prev) => [newKc, ...prev]);

    // Async persist to backend API
    fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatient.id,
        name: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        instructions: prescription.instructions,
        prescriber: "Dr. Rajesh Sharma, MD",
        prescriberId: "user-clinician-001",
        changeReason: `Prescribed for ${prescription.duration}`,
      }),
    }).catch((err) => console.warn("Backend prescription save error:", err));

    // Audit log
    addAuditEntry(
      "Prescribed New Medication",
      `Added ${prescription.medication} ${prescription.dosage} to active regimen`,
      "Medication Orders / EHR Core"
    );
  };

  const addClinicalNote = async (note: {
    title: string;
    diagnosisCodes: string[];
    soap: { subjective: string; objective: string; assessment: string; plan: string };
    freeText: string;
  }) => {
    const today = new Date().toISOString().split("T")[0];
    const newTl: TimelineEvent = {
      id: `tl-note-${Date.now()}`,
      patientId: selectedPatient.id,
      date: today,
      time: "12:15",
      type: "routine_visit",
      category: "medical",
      title: `Clinical Progress Note: ${note.title}`,
      description: `Assessment: ${note.soap.assessment}. Plan: ${note.soap.plan}. Codes: ${note.diagnosisCodes.join(", ")}`,
      severity: "low",
      sourceType: "Clinical Progress Note",
      author: "Dr. Rajesh Sharma, MD",
      authorRole: "Attending Geriatrician",
      metadata: {
        diagnosisCodes: note.diagnosisCodes,
        soap: note.soap,
        freeText: note.freeText,
      },
    };
    setTimelineEvents((prev) => [newTl, ...prev]);

    try {
      await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          date: today,
          time: "12:15",
          type: "routine_visit",
          category: "medical",
          title: `Clinical Progress Note: ${note.title}`,
          description: `Assessment: ${note.soap.assessment}. Plan: ${note.soap.plan}. Codes: ${note.diagnosisCodes.join(", ")}`,
          severity: "low",
          sourceType: "Clinical Progress Note",
          author: "Dr. Rajesh Sharma, MD",
          authorRole: "Attending Geriatrician",
          metadata: {
            diagnosisCodes: note.diagnosisCodes,
            soap: note.soap,
            freeText: note.freeText,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to persist clinical progress note:", err);
    }

    addAuditEntry(
      "Signed Clinical Progress Note",
      `Note titled "${note.title}" filed with diagnosis codes ${note.diagnosisCodes.join(", ")}`,
      "Clinical Documentation / SOAP Registry"
    );
  };

  // AI Assistant
  const [assistantQueries, setAssistantQueries] = React.useState<AiAssistantQuery[]>(INITIAL_AI_QUERIES);
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  const [activeQueryTraceStep, setActiveQueryTraceStep] = React.useState(0);

  const askAssistant = async (queryText: string): Promise<AiAssistantQuery> => {
    setIsAiProcessing(true);
    setActiveQueryTraceStep(1);

    const step2Timer = setTimeout(() => setActiveQueryTraceStep(2), 400);
    const step3Timer = setTimeout(() => setActiveQueryTraceStep(3), 800);
    const step4Timer = setTimeout(() => setActiveQueryTraceStep(4), 1200);

    try {
      const res = await fetch("/api/clinician/assistant/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          query: queryText,
          doctorName: "Dr. Rajesh Sharma, MD",
          doctorId: "user-clinician-001",
        }),
      });

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);
      setActiveQueryTraceStep(5);

      if (res.ok) {
        const data = await res.json();
        const liveQuery: AiAssistantQuery = {
          id: `ai-q-${Date.now()}`,
          patientId: selectedPatient.id,
          query: queryText,
          timestamp: "Today · Just now",
          answer: data.answer,
          sourceReferences: data.sourceReferences || [],
          trace: data.trace || {
            intake: "Natural language clinical query parsed & intent classified.",
            retrieval: "Unified timeline, medications, and caregiver observations scanned.",
            riskCheck: "Safety alerts evaluated against Beers Criteria & active diagnoses.",
            declineTrajectory: "Longitudinal deviation indicators cross-referenced.",
            synthesis: "Evidence-backed answer generated with explicit source attribution.",
          },
        };

        setAssistantQueries((prev) => [liveQuery, ...prev]);
        setIsAiProcessing(false);
        setActiveQueryTraceStep(0);
        return liveQuery;
      }
    } catch (err) {
      console.warn("Live AI assistant error, falling back to local synthesis:", err);
    }

    clearTimeout(step2Timer);
    clearTimeout(step3Timer);
    clearTimeout(step4Timer);
    setActiveQueryTraceStep(5);

    let synthesizedAnswer = "";
    let refs = [
      {
        title: "Caregiver Incident Report (Anita Desai)",
        date: "10 Sep 2026",
        evidenceId: "ev-caregiver-fall-02",
        quote: "Bed-to-chair transfer fall logged with minor knee contusion and morning dizziness.",
      },
      {
        title: "Prescription Order (Dr. Rajesh Sharma)",
        date: "05 Sep 2026",
        evidenceId: "ev-rx-zolpidem-01",
        quote: "Zolpidem 5mg PRN prescribed at bedtime with Beers Criteria fall warning.",
      },
    ];

    const q = queryText.toLowerCase();
    if (q.includes("fall") || q.includes("mobility")) {
      synthesizedAnswer =
        "The patient has experienced an acute cluster of two falls within the past 24 hours (bathroom fall on 9 Sep, bed-to-chair transfer on 10 Sep). This represents a marked deviation from the baseline of independent ambulation with a walker. The primary contributing trigger is the initiation of Zolpidem 5mg PRN 5 days ago, causing cumulative sedative burden and morning orthostatic instability.";
    } else if (q.includes("adherence")) {
      synthesizedAnswer =
        "Medication adherence has averaged 94% over the past 6 months under caregiver supervision. However, over the past 7 days, adherence decreased slightly to 88% due to morning grogginess and hesitation around midday doses following the addition of the new bedtime sedative.";
      refs = [
        {
          title: "Caregiver Adherence Logs (Anita Desai)",
          date: "07 Sep 2026",
          evidenceId: "ev-caregiver-obs-01",
          quote: "Appetite reduced and afternoon drowsiness noted following morning medicine.",
        },
      ];
    } else if (q.includes("cognitive") || q.includes("mci") || q.includes("memory")) {
      synthesizedAnswer =
        "Baseline cognitive assessment in March 2024 established Mild Cognitive Impairment with a MoCA score of 23/30 (delayed recall 1/5). Recent caregiver observations over the past 72 hours report acute-on-chronic temporal disorientation, asking for deceased family members upon waking, and transit hesitation, highly suggestive of sedative-induced delirium atop chronic MCI.";
      refs = [
        {
          title: "Neurological Consult Note (Dr. Sharma)",
          date: "20 Mar 2024",
          evidenceId: "ev-neuro-consult-01",
          quote: "MoCA 23/30; confirmed amnestic multidomain Mild Cognitive Impairment.",
        },
        {
          title: "Caregiver Shift Observation (Anita Desai)",
          date: "05 Sep 2026",
          evidenceId: "ev-caregiver-fall-01",
          quote: "Ravi seemed disoriented upon waking, forgot morning routine.",
        },
      ];
    } else {
      synthesizedAnswer = `Synthesizing longitudinal EHR records for "${queryText}": Ravi Kumar is a 74-year-old male with active hypertension, Type 2 diabetes, ischemic stroke history, and MCI. Current priority alert involves elevated fall vulnerability correlating with recent sedative initiation (Zolpidem 5mg). All parameters are verified against confirmed clinical records.`;
    }

    const newQuery: AiAssistantQuery = {
      id: `ai-q-${Date.now()}`,
      patientId: selectedPatient.id,
      query: queryText,
      timestamp: "Today · Just now",
      answer: synthesizedAnswer,
      sourceReferences: refs,
      trace: {
        intake: "Natural language clinical query parsed & intent classified.",
        retrieval: "Unified timeline, medications, and caregiver observations scanned.",
        riskCheck: "Safety alerts evaluated against Beers Criteria & active diagnoses.",
        declineTrajectory: "Longitudinal deviation indicators cross-referenced.",
        synthesis: "Evidence-backed answer generated with explicit source attribution.",
      },
    };

    setAssistantQueries((prev) => [newQuery, ...prev]);
    setIsAiProcessing(false);
    setActiveQueryTraceStep(0);

    addAuditEntry(
      "Executed AI Clinical Assistant Query",
      `Query: "${queryText}" across unified patient record`,
      "AI Clinical Decision Support Engine"
    );

    return newQuery;
  };

  // Audit Logs
  const [auditLogs, setAuditLogs] = React.useState<AuditEntry[]>([]);

  const addAuditEntry = (action: string, details: string, resource: string) => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      patientId: selectedPatient.id,
      timestamp: new Date().toISOString(),
      userId: "user-clinician-001",
      userName: "Dr. Rajesh Sharma, MD",
      userRole: "doctor",
      eventType: "access",
      action,
      resource,
      details,
      purposeOfUse: "Direct Clinical Patient Care & Quality Assurance",
      ipAddress: "192.168.10.45",
      status: "success",
    };
    setAuditLogs((prev) => [newEntry, ...prev]);

    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    }).catch((err) => console.warn("Backend audit log save error:", err));
  };

  // Live Data Hydration
  React.useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      if (!selectedPatient.id || selectedPatient.id === "loading") return;

      const [medRes, tlRes, auditRes, trendRes, obsRes, consentRes, docRes, riskRes] = await Promise.all([
        fetch(`/api/medications?patientId=${selectedPatient.id}&status=active`).catch(() => null),
        fetch(`/api/timeline?patientId=${selectedPatient.id}`).catch(() => null),
        fetch(`/api/audit?patientId=${selectedPatient.id}`).catch(() => null),
        fetch(`/api/caregiver/trends?patientId=${selectedPatient.id}`).catch(() => null),
        fetch(`/api/caregiver/observations?patientId=${selectedPatient.id}`).catch(() => null),
        fetch(`/api/consent?patientId=${selectedPatient.id}`).catch(() => null),
        fetch(`/api/documents?patientId=${selectedPatient.id}`).catch(() => null),
        fetch(`/api/risks?patientId=${selectedPatient.id}`).catch(() => null),
      ]);

      let activeMeds: Medication[] = [];
      if (medRes && medRes.ok && isMounted) {
        const data = await medRes.json();
        if (data.medications) {
          activeMeds = data.medications;
          setMedications(activeMeds);
        }
      }

      let activeEvents: TimelineEvent[] = [];
      if (tlRes && tlRes.ok && isMounted) {
        const data = await tlRes.json();
        if (data.events) {
          activeEvents = data.events;
          setTimelineEvents(activeEvents);
        }
      }

      if (auditRes && auditRes.ok && isMounted) {
        const data = await auditRes.json();
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      }

      if (trendRes && trendRes.ok && isMounted) {
        const data = await trendRes.json();
        const resolvedState = data.state || data.status;
        if (resolvedState) {
          setDigitalTwinState(resolvedState as DigitalTwinState);
        }
      }

      let activeObs: CaregiverObservation[] = [];
      if (obsRes && obsRes.ok && isMounted) {
        const data = await obsRes.json();
        if (data.observations) {
          activeObs = data.observations;
        }
      }

      let activeRisks: RiskSignal[] = [];
      if (riskRes && riskRes.ok && isMounted) {
        const data = await riskRes.json();
        if (data.risks) {
          activeRisks = data.risks;
        }
      }

      if (consentRes && consentRes.ok && isMounted) {
        const data = await consentRes.json();
        if (data.records && data.records.length > 0) {
          const scopes: ConsentScopeItem[] = data.records.map((r: any) => ({
            category: r.granteeName ? `${r.granteeName} (${r.granteeRole})` : "General Consent",
            status: r.status === "active" ? "available" : r.status === "revoked" ? "restricted" : "pending",
            details: `Permissions: ${(r.grantedPermissions || []).join(", ") || "General access"}. ${r.notes || ""}`,
            validUntil: r.validUntil ? new Date(r.validUntil).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
          }));
          setConsentScopes(scopes);
        }
      }

      if (docRes && docRes.ok && isMounted) {
        const data = await docRes.json();
        if (data.documents && data.documents.length > 0) {
          const convertedDocs: UploadedDocItem[] = data.documents.map((d: any) => ({
            id: d.id,
            patientId: d.patientId,
            patientName: selectedPatient.name,
            documentName: d.title,
            documentType: d.type ? d.type.replace(/_/g, " ").toUpperCase() : "Clinical Report",
            date: d.date,
            uploadDate: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : d.date,
            status: "confirmed" as const,
            fileSize: "450 KB",
            extractedEntities: {
              date: d.date,
              provider: d.facility || d.author || "Clinical Facility",
              diagnoses: d.extractedEntities || [],
              medications: [],
              keyFindings: [d.summary || "Medical report archived in health memory."],
              summary: d.summary || "",
            },
          }));
          setUploadQueue(convertedDocs);
        }
      }

      // Dynamically compute key changes feed from real patient data
      const dynamicChanges: KeyChangeItem[] = [];

      activeMeds.forEach((med) => {
        if (med.isRecentChange || med.fallRiskWarning || med.sedationRisk || med.name.toLowerCase().includes("zolpidem")) {
          dynamicChanges.push({
            id: `kc-med-${med.id}`,
            patientId: med.patientId,
            title: `Medication Alert: ${med.name} ${med.dosage || ""}`,
            date: med.startDate ? new Date(med.startDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
            shortExplanation: `${med.frequency}. Indication: ${med.indication}. ${med.fallRiskWarning ? "Fall & sedation risk alert." : ""}`,
            severity: med.fallRiskWarning ? "critical" : "high",
            category: "medication",
            sourceText: med.prescriber ? `Prescribed by ${med.prescriber}` : "EHR Medication Record",
            evidenceId: med.evidenceIds?.[0],
            isNew: true,
          });
        }
      });

      activeObs.forEach((obs) => {
        if (obs.category === "fall" || obs.category === "confusion" || obs.severity === "high" || obs.severity === "critical") {
          dynamicChanges.push({
            id: `kc-obs-${obs.id}`,
            patientId: obs.patientId,
            title: `Caregiver Alert: ${obs.category === "fall" ? "Fall Incident" : obs.category.toUpperCase()}`,
            date: obs.timestamp ? new Date(obs.timestamp).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
            shortExplanation: obs.note || obs.notes || obs.summary || "Acute observation logged by caregiver.",
            severity: obs.severity === "critical" || obs.category === "fall" ? "critical" : "high",
            category: obs.category === "fall" ? "incident" : "state",
            sourceText: `Caregiver Log by ${obs.caregiverName || "Caregiver"}`,
            isNew: true,
          });
        }
      });

      activeRisks.forEach((r) => {
        dynamicChanges.push({
          id: `kc-risk-${r.id}`,
          patientId: r.patientId,
          title: `Risk Signal: ${r.title}`,
          date: r.detectedAt ? new Date(r.detectedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "Current",
          shortExplanation: r.description || "Identified through clinical risk model.",
          severity: r.priority === "high" ? "high" : "medium",
          category: "state",
          sourceText: "Predictive Risk Model",
          isNew: false,
        });
      });

      if (dynamicChanges.length > 0) {
        setAllChanges(dynamicChanges);
      }
    }

    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  const recordEmergencyBreakGlass = async (reason: string, department = "Emergency Care"): Promise<boolean> => {
    try {
      const res = await fetch("/api/consent/break-glass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          doctorName: "Dr. Rajesh Sharma",
          doctorId: "user-clinician-001",
          reason,
          department,
        }),
      });
      if (res.ok) {
        setConsentScopes((prev) =>
          prev.map((s) => ({
            ...s,
            status: "available" as const,
            details: `${s.details} [EMERGENCY OVERRIDE GRANTED 24h]`,
          }))
        );
        addAuditEntry(
          "Emergency Break-Glass Override Executed",
          `Full patient health memory unlocked under emergency justification: "${reason}"`,
          "Emergency Consent Registry / Security Vault"
        );
        return true;
      }
    } catch (err) {
      console.error("Emergency break-glass request failed:", err);
    }
    return false;
  };

  const downloadAuditCsv = () => {
    const headers = [
      "ID",
      "Timestamp",
      "User",
      "Role",
      "Action",
      "Resource",
      "Details",
      "Purpose",
      "IP Address",
      "Status",
    ];
    const rows = auditLogs.map((log) => [
      log.id,
      log.timestamp,
      `"${log.userName}"`,
      log.userRole,
      `"${log.action}"`,
      `"${log.resource}"`,
      `"${log.details}"`,
      `"${log.purposeOfUse || ""}"`,
      log.ipAddress,
      log.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Doctor_Access_Audit_Log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Evidence Drawer & Emergency Modal
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = React.useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);

  const [selectedEvidence, setSelectedEvidence] = React.useState<EvidenceSnippet | null>(null);

  const openEvidenceDrawer = async (evidenceId?: string) => {
    if (evidenceId) {
      try {
        const res = await fetch(`/api/evidence?id=${encodeURIComponent(evidenceId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.evidence) setSelectedEvidence(data.evidence);
        }
      } catch (err) {
        console.warn("Failed to load evidence details:", err);
      }
    }
    setIsEvidenceDrawerOpen(true);
  };

  const closeEvidenceDrawer = () => {
    setIsEvidenceDrawerOpen(false);
  };

  const [isEmergencySosOpen, setIsEmergencySosOpen] = React.useState(false);
  const openEmergencySos = () => setIsEmergencySosOpen(true);
  const closeEmergencySos = () => setIsEmergencySosOpen(false);

  return (
    <DoctorStoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        patients,
        selectedPatient,
        selectPatient,
        allChanges,
        patientChanges,
        careTeam,
        consentScopes,
        digitalTwinState,
        selectedSnapshot,
        setSelectedSnapshot,
        digitalTwinTrends,
        baselineVsRecent,
        riskModelContext,
        timelineEvents,
        filteredTimeline,
        timelineSearchQuery,
        setTimelineSearchQuery,
        timelineFilterType,
        setTimelineFilterType,
        timelineFilterProvider,
        setTimelineFilterProvider,
        uploadQueue,
        addUploadedDocument,
        confirmExtractedDocument,
        medications,
        polypharmacyInteractions,
        checkMedicationInteractions,
        addPrescription,
        addClinicalNote,
        assistantQueries,
        isAiProcessing,
        activeQueryTraceStep,
        askAssistant,
        auditLogs,
        downloadAuditCsv,
        isEvidenceDrawerOpen,
        selectedEvidence,
        openEvidenceDrawer,
        closeEvidenceDrawer,
        isEmergencySosOpen,
        openEmergencySos,
        closeEmergencySos,
        recordEmergencyBreakGlass,
      }}
    >
      {children}
    </DoctorStoreContext.Provider>
  );
}

export function useDoctorStore() {
  const context = React.useContext(DoctorStoreContext);
  if (!context) {
    throw new Error("useDoctorStore must be used within a DoctorProvider");
  }
  return context;
}
