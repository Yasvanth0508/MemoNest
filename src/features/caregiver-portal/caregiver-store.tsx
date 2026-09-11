"use client";

import * as React from "react";
import {
  Patient,
  CaregiverObservation,
  TimelineEvent,
  ObservationCategory,
} from "@/types";
const FALLBACK_PATIENT: Patient = {
  id: "patient-001",
  name: "Ravi Kumar",
  age: 74,
  dateOfBirth: "1952-04-12",
  gender: "Male",
  primaryDoctor: "Dr. Rajesh Sharma, MD",
  activeConditions: ["Hypertension", "Type 2 Diabetes", "Ischemic Stroke", "Mild Cognitive Impairment"],
  allergies: [],
  emergencyContact: {
    name: "Meera Kumar",
    relationship: "Daughter / Legal Healthcare Proxy",
    phone: "+1-555-0199",
  },
};

export type CaregiverRelationship = "paid_caregiver" | "family_member" | "agency_staff";
export type CaregiverPermissionLevel = "view_only" | "observation_input" | "full_proxy";

export interface CaregiverProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  relationship: CaregiverRelationship;
  permissionLevel: CaregiverPermissionLevel;
  permissionDeterminedBy: string;
  organization: string;
  phone: string;
}

export interface RiskIndicator {
  id: string;
  title: string;
  category: ObservationCategory;
  severity: "mild" | "moderate" | "urgent";
  description: string;
  doctorInstructions: string;
  suggestedAction: string;
  signals: string[];
}

export interface DigitalTwinSignalComparison {
  name: string;
  baseline: string;
  current: string;
  status: "normal" | "mild_change" | "significant_change";
}

export interface PatientStateData {
  state: "stable" | "mild_deviation" | "significant_deviation";
  label: string;
  plainExplanation: string;
  lastCalculated: string;
  baselineSummary: string;
  trendSignals: DigitalTwinSignalComparison[];
  contributingFactors: string[];
  whatThisMightMean: {
    interpretation: string;
    clinicalContext: string;
    actionableAdvice: string;
    whenToContactDoctor: string;
  };
}

export interface PatientCareDetails {
  patient: Patient;
  escalationProtocol: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    triagePhone: string;
    emergencyRoom: string;
  };
  watchList: RiskIndicator[];
  medicationsList: {
    id: string;
    name: string;
    dosage: string;
    schedule: string;
    timing: string;
    purpose: string;
    specialInstructions?: string;
  }[];
  digitalTwin: PatientStateData;
  restrictedItems: {
    title: string;
    category: string;
    reason: string;
    restrictedBy: string;
  }[];
}

export interface FollowUpNote {
  id: string;
  eventId: string;
  author: string;
  authorRole: string;
  note: string;
  timestamp: string;
}

const DEFAULT_CAREGIVER: CaregiverProfile = {
  id: "user-caregiver-001",
  name: "Anita Desai",
  email: "anita@caregiver.demo",
  title: "Certified Nursing Assistant (CNA)",
  relationship: "paid_caregiver",
  permissionLevel: "observation_input",
  permissionDeterminedBy: "Priya Kumar (Guardian & Daughter)",
  organization: "Grace Senior Home Care",
  phone: "+1-555-0188",
};

// Rich Patient Care Details for Ravi Kumar
const RAVI_CARE_DETAILS: PatientCareDetails = {
  patient: FALLBACK_PATIENT,
  escalationProtocol: {
    step1: "Ensure patient safety: Sit patient down immediately, lock walker wheels, remove floor obstacles.",
    step2: "Check vital signs & orientation: Take blood pressure, ask patient today's date & location, check for contusions or head strike.",
    step3: "Alert designated family contact: Call Priya Kumar (+1-555-0192) and notify about status.",
    step4: "Contact clinic triage desk: Page Dr. Sharma's on-call nurse line at (+1-555-0100) if confusion or instability persists >15 minutes.",
    triagePhone: "+1-555-0100",
    emergencyRoom: "MetroHealth Emergency Department (Bay 4), 100 Hospital Way",
  },
  watchList: [
    {
      id: "risk-fall",
      title: "Fall Risk & Bed-to-Chair Transfers",
      category: "fall",
      severity: "urgent",
      description: "Elevated fall risk during unassisted morning transfers and bathroom transit.",
      doctorInstructions: "Standby assist required for all transfers. Ensure four-wheel walker is locked before sit-to-stand.",
      suggestedAction: "Log any near-miss, wobble, or fall immediately.",
      signals: ["Bedside transfer dizziness", "Bathroom transit hesitation", "Requires standby contact"],
    },
    {
      id: "risk-med-adherence",
      title: "Evening Medication Adherence",
      category: "medication_adherence",
      severity: "moderate",
      description: "Missed doses or delayed ingestion due to evening drowsiness and mild swallow hesitation.",
      doctorInstructions: "Administer evening Donepezil and Zolpidem with applesauce; observe for 5 minutes post-ingestion.",
      suggestedAction: "Confirm ingestion time and note any refusal or dysphagia.",
      signals: ["3 missed dose flags in 7 days", "Sleepiness at 20:00", "Swallowing hesitation"],
    },
    {
      id: "risk-dementia-behavior",
      title: "Dementia & Behavioral Sundowning",
      category: "behavior",
      severity: "moderate",
      description: "Restlessness, pacing, or mild agitation emerging in late afternoon / early evening.",
      doctorInstructions: "Promote calm environment with warm lighting and family photo album reassurance.",
      suggestedAction: "Log behavioral triggers, duration of restlessness, and soothing measures.",
      signals: ["Late afternoon agitation", "Asking for past events", "Sleep cycle shift"],
    },
    {
      id: "risk-confusion",
      title: "Morning Confusion & Foggy Cognition",
      category: "confusion",
      severity: "moderate",
      description: "Disorientation upon waking between 07:00 and 09:00; mistaking days of the week.",
      doctorInstructions: "Cross-reference with bedtime sedative (Zolpidem) timing. Offer gentle orientation calendar.",
      suggestedAction: "Record time of onset and how long reorientation took.",
      signals: ["Bathroom hallway disorientation", "Forgot breakfast routine", "Took 20 mins to reorient"],
    },
    {
      id: "risk-mobility",
      title: "Knee Stiffness & Sit-to-Stand Delay",
      category: "mobility",
      severity: "moderate",
      description: "Right knee osteoarthritis flare-up causing hesitancy when rising from deep armchairs.",
      doctorInstructions: "Encourage high-firm chairs with arms. Supervise 15-minute daily corridor walk.",
      suggestedAction: "Note joint stiffness severity and whether patient needed 1 or 2 hands for support.",
      signals: ["2-handed push off needed", "Slow initial strides", "Hesitation after sitting >30 mins"],
    },
    {
      id: "risk-appetite",
      title: "Hydration & Nutritional Intake",
      category: "appetite",
      severity: "mild",
      description: "Fluid intake dropping below 1.5L daily, increasing risk of orthostatic hypotension & dizziness.",
      doctorInstructions: "Maintain target of 2.0L fluids daily. Track meal completion at lunch and dinner.",
      suggestedAction: "Log fluid volumes and note if lunch or snack is refused.",
      signals: ["Reduced midday fluid intake", "Skipped afternoon tea", "Mild dry mouth noted"],
    },
  ],
  medicationsList: [
    {
      id: "med-1",
      name: "Amlodipine",
      dosage: "5 mg",
      schedule: "Once daily in the morning",
      timing: "08:00 AM with breakfast",
      purpose: "Blood pressure regulation",
      specialInstructions: "Take with water; check sitting blood pressure if dizziness reported.",
    },
    {
      id: "med-2",
      name: "Metformin",
      dosage: "500 mg",
      schedule: "Twice daily with meals",
      timing: "08:00 AM & 06:30 PM",
      purpose: "Type 2 Diabetes blood glucose control",
      specialInstructions: "Must be taken with full meal to prevent stomach upset.",
    },
    {
      id: "med-3",
      name: "Donepezil",
      dosage: "5 mg",
      schedule: "Once daily at bedtime",
      timing: "09:00 PM",
      purpose: "Mild Cognitive Impairment & memory support",
      specialInstructions: "Take right before sleep to minimize daytime nausea.",
    },
    {
      id: "med-4",
      name: "Zolpidem",
      dosage: "5 mg",
      schedule: "PRN (As needed for insomnia)",
      timing: "10:00 PM (maximum 3 nights/week)",
      purpose: "Short-term sleep induction",
      specialInstructions: "WARNING: High fall risk! Supervise any nighttime or early morning bathroom visits.",
    },
    {
      id: "med-5",
      name: "Atorvastatin",
      dosage: "20 mg",
      schedule: "Once daily in the evening",
      timing: "07:00 PM",
      purpose: "Cholesterol management & stroke prevention",
      specialInstructions: "Take with evening meal.",
    },
  ],
  digitalTwin: {
    state: "significant_deviation",
    label: "Significant Deviation",
    plainExplanation:
      "Ravi's current health patterns show a significant departure from his usual steady baseline, driven by two recent falls and morning balance hesitation.",
    lastCalculated: "Today at 08:30 AM (after transfer incident log)",
    baselineSummary:
      "Normal Baseline: Steady mobility using 4-wheel walker with single-hand standby assist; clear morning orientation; regular meal and water intake (>1.8L/day).",
    trendSignals: [
      {
        name: "Mobility & Transfers",
        baseline: "Independent with 4-wheel walker; smooth transfers",
        current: "2 falls in 24h during transfers; knee bruise; unsteady stance",
        status: "significant_change",
      },
      {
        name: "Cognition & Alertness",
        baseline: "Mild occasional lapses; fully oriented by 08:00 AM",
        current: "Morning confusion episodes; 20-min reorientation required",
        status: "mild_change",
      },
      {
        name: "Medication Adherence",
        baseline: "100% adherence verified by family & caregiver",
        current: "3 missed or delayed evening doses logged this past week",
        status: "significant_change",
      },
      {
        name: "Appetite & Hydration",
        baseline: "Normal meal finish; ~2.0L fluid intake daily",
        current: "Reduced water intake for 3 consecutive days (~1.1L/day)",
        status: "mild_change",
      },
      {
        name: "Sleep & Sedation",
        baseline: "7-8 hours restful sleep without daytime grogginess",
        current: "Restless night followed by heavy morning drowsiness from new sedative",
        status: "significant_change",
      },
      {
        name: "Behavior & Mood",
        baseline: "Calm, engaged in daytime reading & family calls",
        current: "Mild late afternoon restlessness and anxiety about balance",
        status: "mild_change",
      },
      {
        name: "Functional Independence",
        baseline: "ADL Level 2 (supervision only for hygiene)",
        current: "Requires 2-person standby assist during early transfers",
        status: "significant_change",
      },
    ],
    contributingFactors: [
      "2 fall incidents recorded within past 24 hours (Bedside & Bathroom)",
      "3 missed or delayed medication logs over the past 7 days",
      "2 morning confusion episodes logged this week",
      "Reduced water intake logged for 3 consecutive days",
    ],
    whatThisMightMean: {
      interpretation:
        "The cluster of recent falls and morning confusion strongly correlates with the recent addition of bedtime Zolpidem (Sep 5). Sedative residual effects can linger into the next morning, causing dizziness upon sitting up.",
      clinicalContext:
        "When bedtime sedatives interact with blood pressure medications (Amlodipine), postural blood pressure drops become more pronounced during morning bed-to-chair transfers.",
      actionableAdvice:
        "Do not allow unassisted morning transfers. Provide a glass of water before Ravi sits up, and wait 2 full minutes before standing.",
      whenToContactDoctor:
        "Contact Dr. Sharma's clinic today for a medication review. If Ravi displays facial weakness, speech slurring, or cannot bear weight, call 911 immediately.",
    },
  },
  restrictedItems: [
    {
      title: "Full Psychiatric Psychotherapy Notes",
      category: "Mental Health",
      reason: "Patient consent scope restricts clinical therapy notes to licensed psychiatric clinicians only.",
      restrictedBy: "Patient Consent Policy #CR-881",
    },
    {
      title: "Comprehensive Genomic Risk Sequencing Panel",
      category: "Genetics",
      reason: "Genetic risk data is withheld per patient's explicit privacy election.",
      restrictedBy: "Patient Consent Policy #CR-882",
    },
    {
      title: "Unredacted Financial & Insurance Claims Record",
      category: "Administrative",
      reason: "Caregiver permissions are limited to clinical care observation and daily routine monitoring.",
      restrictedBy: "Guardian Authorization #GA-2025",
    },
  ],
};

// Margaret Higgins Care Details
const MARGARET_CARE_DETAILS: PatientCareDetails = {
  patient: {
    ...FALLBACK_PATIENT,
    id: "patient-002",
    name: "Margaret Higgins",
    age: 82,
    gender: "Female",
    activeConditions: ["Macular Degeneration", "Osteoporosis", "Mild Cognitive Decline"],
  },
  escalationProtocol: {
    step1: "Provide physical stability: Seat Margaret immediately with single-point cane accessible.",
    step2: "Assess vision and comfort: Check for acute eye pain or sudden vision dimming.",
    step3: "Contact Son: Call Robert Higgins (+1-555-0210).",
    step4: "Contact Clinic: Page Dr. Sharma's Geriatric Team (+1-555-0100).",
    triagePhone: "+1-555-0100",
    emergencyRoom: "Springfield General Emergency, 400 Pine St",
  },
  watchList: [
    {
      id: "risk-vision",
      title: "Glaucoma Eye Drop Compliance",
      category: "medication_adherence",
      severity: "moderate",
      description: "Ensure evening Latanoprost eye drops are instilled correctly without missing the conjunctival sac.",
      doctorInstructions: "Administer drops at 20:00. Verify bottle tip does not touch eyelashes.",
      suggestedAction: "Log whether drops were instilled smoothly or needed repetition.",
      signals: ["Eye drop hesitation", "Mild eye stinging report"],
    },
    {
      id: "risk-osteoporosis",
      title: "Osteoporosis Spine & Hip Safety",
      category: "mobility",
      severity: "moderate",
      description: "Avoid sudden twisting motions or heavy lifting. Maintain clear walkways.",
      doctorInstructions: "Verify non-slip socks or firm footwear when moving around home.",
      suggestedAction: "Record mobility stability and cane usage.",
      signals: ["Mild lumbar stiffness", "Steady ambulation with cane"],
    },
  ],
  medicationsList: [
    {
      id: "med-m1",
      name: "Latanoprost 0.005%",
      dosage: "1 drop each eye",
      schedule: "Once daily in the evening",
      timing: "08:00 PM",
      purpose: "Glaucoma intraocular pressure reduction",
    },
    {
      id: "med-m2",
      name: "Alendronate",
      dosage: "70 mg",
      schedule: "Weekly on Monday mornings",
      timing: "07:30 AM (empty stomach)",
      purpose: "Osteoporosis bone density support",
      specialInstructions: "Must remain upright for 30 minutes after taking with full glass of water.",
    },
  ],
  digitalTwin: {
    state: "mild_deviation",
    label: "Mild Deviation",
    plainExplanation:
      "Margaret is generally steady, with a minor deviation noted in eye drop administration timing and mild morning lumbar stiffness.",
    lastCalculated: "Yesterday at 17:00 PM",
    baselineSummary: "Normal Baseline: Independent ambulation with single-point cane, good compliance with weekly medications.",
    trendSignals: [
      { name: "Mobility & Transfers", baseline: "Steady with cane", current: "Mild lumbar stiffness upon rising", status: "mild_change" },
      { name: "Cognition & Alertness", baseline: "Clear and alert", current: "Fully oriented and cheerful", status: "normal" },
      { name: "Medication Adherence", baseline: "100% adherence", current: "Eye drop delayed by 1 hour yesterday", status: "mild_change" },
      { name: "Appetite & Hydration", baseline: "Good appetite", current: "Finished all meals", status: "normal" },
      { name: "Sleep & Sedation", baseline: "Restful sleep", current: "Sleeping well, 7.5 hours", status: "normal" },
      { name: "Behavior & Mood", baseline: "Engaged & positive", current: "Active in morning gardening", status: "normal" },
      { name: "Functional Independence", baseline: "Independent with cane", current: "Supervision only needed for stairs", status: "normal" },
    ],
    contributingFactors: [
      "1 delayed eye drop administration logged yesterday",
      "Mild lumbar stiffness noted on Monday morning transfer",
    ],
    whatThisMightMean: {
      interpretation: "Margaret's minor deviation is well-managed and does not suggest acute deterioration. The back stiffness responds well to gentle morning stretching.",
      clinicalContext: "Consistent timing for intraocular pressure drops is key to protecting the optic nerve.",
      actionableAdvice: "Set a reminder alarm at 20:00 for eye drops. Assist with gentle warm-up before morning walks.",
      whenToContactDoctor: "Notify clinic if eye redness or sharp ocular pain develops.",
    },
  },
  restrictedItems: [
    {
      title: "Mental Health Evaluation Records",
      category: "Psychiatry",
      reason: "Restricted per patient consent preferences.",
      restrictedBy: "Patient Consent #MH-401",
    },
  ],
};

// David Chen Care Details
const DAVID_CARE_DETAILS: PatientCareDetails = {
  patient: {
    ...FALLBACK_PATIENT,
    id: "patient-003",
    name: "David Chen",
    age: 69,
    gender: "Male",
    activeConditions: ["Coronary Artery Disease", "Post-CABG Recovery", "Hyperlipidemia"],
  },
  escalationProtocol: {
    step1: "Have David sit comfortably and rest.",
    step2: "Check heart rate and pulse oximeter reading.",
    step3: "Contact Spouse: Call Susan Chen (+1-555-0322).",
    step4: "Contact Cardiology: Page Post-Op Care Desk (+1-555-0155).",
    triagePhone: "+1-555-0155",
    emergencyRoom: "Cardiac Emergency Center, 200 Heart Way",
  },
  watchList: [
    {
      id: "risk-sternal",
      title: "Sternal Precautions Post-CABG",
      category: "mobility",
      severity: "moderate",
      description: "Do not push or pull with arms when rising from chair; use leg power.",
      doctorInstructions: "Hug chest pillow during coughing or sit-to-stand movements.",
      suggestedAction: "Log adherence to sternal safety during transfers.",
      signals: ["Hugs pillow during cough", "Uses legs for chair rise"],
    },
    {
      id: "risk-cardiac-vitals",
      title: "Heart Rate & Blood Pressure Stability",
      category: "physical_symptom",
      severity: "moderate",
      description: "Monitor resting pulse (target 60-85 bpm) and watch for shortness of breath.",
      doctorInstructions: "Log daily morning blood pressure and pulse.",
      suggestedAction: "Record vital sign readings.",
      signals: ["Pulse 72 bpm steady", "No chest tightness reported"],
    },
  ],
  medicationsList: [
    {
      id: "med-d1",
      name: "Clopidogrel",
      dosage: "75 mg",
      schedule: "Once daily with lunch",
      timing: "12:30 PM",
      purpose: "Antiplatelet therapy for coronary bypass graft patency",
    },
    {
      id: "med-d2",
      name: "Metoprolol Succinate",
      dosage: "25 mg",
      schedule: "Once daily in the morning",
      timing: "08:00 AM",
      purpose: "Heart rate and blood pressure control",
    },
  ],
  digitalTwin: {
    state: "stable",
    label: "Stable",
    plainExplanation:
      "David's surgical recovery is proceeding right on schedule. Vital signs, walking endurance, and wound healing are steady.",
    lastCalculated: "Today at 07:00 AM",
    baselineSummary: "Normal Baseline: Independent ambulation, recovering endurance following CABG, strict adherence to meds.",
    trendSignals: [
      { name: "Mobility & Transfers", baseline: "Independent walking", current: "Walking 25 mins daily smoothly", status: "normal" },
      { name: "Cognition & Alertness", baseline: "Sharp and oriented", current: "Alert and focused", status: "normal" },
      { name: "Medication Adherence", baseline: "100% adherence", current: "All scheduled doses taken", status: "normal" },
      { name: "Appetite & Hydration", baseline: "Low sodium diet", current: "Eating healthy cardiac diet", status: "normal" },
      { name: "Sleep & Sedation", baseline: "7 hours restful", current: "Comfortable sleep on back", status: "normal" },
      { name: "Behavior & Mood", baseline: "Optimistic", current: "High morale and motivated", status: "normal" },
      { name: "Functional Independence", baseline: "Self-sufficient", current: "Adhering to sternal precautions", status: "normal" },
    ],
    contributingFactors: [
      "No adverse symptoms reported in 14 days",
      "Daily 25-minute hallway walk completed with steady pulse",
      "100% adherence to antiplatelet medication",
    ],
    whatThisMightMean: {
      interpretation: "David's digital twin reflects optimal post-surgical recovery. Sternal bone healing is advancing steadily.",
      clinicalContext: "Regular walking without shortness of breath indicates strong cardiac functional capacity.",
      actionableAdvice: "Continue encouraging daily walking sessions and low-sodium hydration.",
      whenToContactDoctor: "Notify doctor if sudden shortness of breath, chest pressure, or incision redness occurs.",
    },
  },
  restrictedItems: [],
};

const PATIENT_DETAILS_MAP: Record<string, PatientCareDetails> = {
  "patient-001": RAVI_CARE_DETAILS,
  "patient-002": MARGARET_CARE_DETAILS,
  "patient-003": DAVID_CARE_DETAILS,
};

export interface CaregiverContextType {
  // Caregiver Profile & Auth
  caregiver: CaregiverProfile;
  setCaregiverRelationship: (rel: CaregiverRelationship) => void;
  setCaregiverPermission: (perm: CaregiverPermissionLevel) => void;

  // Patient Roster & Selection
  patients: Patient[];
  activePatientId: string;
  activePatient: Patient;
  activePatientCare: PatientCareDetails;
  switchPatient: (patientId: string) => void;

  // Observations
  observations: CaregiverObservation[];
  addObservation: (obs: Omit<CaregiverObservation, "id" | "timestamp" | "status">) => Promise<CaregiverObservation>;

  // Combined Timeline
  timelineEvents: TimelineEvent[];
  followUpNotes: Record<string, FollowUpNote[]>;
  addFollowUpNote: (eventId: string, noteText: string) => void;

  // Observation Routing Escalation State
  lastSubmittedObservation: CaregiverObservation | null;
  routingNotice: {
    isOpen: boolean;
    type: "routine" | "urgent";
    observation: CaregiverObservation | null;
  };
  dismissRoutingNotice: () => void;

  // Modals & Drawers
  isEmergencyModalOpen: boolean;
  openEmergencyModal: () => void;
  closeEmergencyModal: () => void;

  isPatientStateModalOpen: boolean;
  openPatientStateModal: () => void;
  closePatientStateModal: () => void;

  isObservationDrawerOpen: boolean;
  openObservationDrawer: (category?: ObservationCategory, tag?: string) => void;
  closeObservationDrawer: () => void;
  preselectedCategory?: ObservationCategory;
  preselectedTag?: string;
}

const CaregiverContext = React.createContext<CaregiverContextType | null>(null);

const STORAGE_KEY_OBS = "kinsphere_caregiver_obs_v2";
const STORAGE_KEY_PATIENT = "kinsphere_caregiver_active_patient_v2";
const STORAGE_KEY_REL = "kinsphere_caregiver_relationship_v2";
const STORAGE_KEY_NOTES = "kinsphere_caregiver_notes_v2";

export function formatTimeDeterministic(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "08:00 AM";
    let hours = d.getUTCHours();
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  } catch {
    return "08:00 AM";
  }
}

export function CaregiverProvider({ children }: { children: React.ReactNode }) {
  const [caregiver, setCaregiver] = React.useState<CaregiverProfile>(DEFAULT_CAREGIVER);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = React.useState<string>("patient-001");
  const [observations, setObservations] = React.useState<CaregiverObservation[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_OBS);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [followUpNotes, setFollowUpNotes] = React.useState<Record<string, FollowUpNote[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_NOTES);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // fallback
      }
    }
    return {
      "obs-20260910-01": [
        {
          id: "fn-1",
          eventId: "obs-20260910-01",
          author: "Anita Desai",
          authorRole: "Caregiver (CNA)",
          note: "Checked right knee at 11:30 AM. Swelling reduced after cold compress; patient is resting in recliner with ice pack.",
          timestamp: "2026-09-10T11:30:00Z",
        },
      ],
      "obs-20260909-01": [
        {
          id: "fn-2",
          eventId: "obs-20260909-01",
          author: "Priya Kumar",
          authorRole: "Guardian / Daughter",
          note: "Spoke with Dr. Sharma's nurse. They advise holding bedtime Zolpidem tonight to assess morning stability.",
          timestamp: "2026-09-09T14:15:00Z",
        },
      ],
    };
  });

  // Modals state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = React.useState(false);
  const [isPatientStateModalOpen, setIsPatientStateModalOpen] = React.useState(false);
  const [isObservationDrawerOpen, setIsObservationDrawerOpen] = React.useState(false);
  const [preselectedCategory, setPreselectedCategory] = React.useState<ObservationCategory | undefined>(undefined);
  const [preselectedTag, setPreselectedTag] = React.useState<string | undefined>(undefined);

  // Routing confirmation notice
  const [lastSubmittedObservation, setLastSubmittedObservation] = React.useState<CaregiverObservation | null>(null);
  const [routingNotice, setRoutingNotice] = React.useState<{
    isOpen: boolean;
    type: "routine" | "urgent";
    observation: CaregiverObservation | null;
  }>({
    isOpen: false,
    type: "routine",
    observation: null,
  });

  // Restore stored active patient and relationship on mount + load roster
  React.useEffect(() => {
    fetch("/api/clinician/patients/search?all=true")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.patients && data.patients.length > 0) {
          setPatients(data.patients);
          const savedPatient = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY_PATIENT) : null;
          if (savedPatient && data.patients.some((p: Patient) => p.id === savedPatient)) {
            setActivePatientId(savedPatient);
          } else {
            setActivePatientId(data.patients[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load caregiver patients roster:", err));

    if (typeof window !== "undefined") {
      try {
        const savedRel = window.localStorage.getItem(STORAGE_KEY_REL) as CaregiverRelationship | null;
        if (savedRel) {
          setCaregiver((prev) => ({
            ...prev,
            relationship: savedRel,
            title:
              savedRel === "family_member"
                ? "Family Caregiver"
                : savedRel === "agency_staff"
                ? "Agency Registered Care Coordinator"
                : "Certified Nursing Assistant (CNA)",
            organization:
              savedRel === "family_member"
                ? "Family & Guardian Circle"
                : savedRel === "agency_staff"
                ? "Apex Caregiver Staffing Network"
                : "Grace Senior Home Care",
          }));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const [clinicalEvents, setClinicalEvents] = React.useState<TimelineEvent[]>([]);
  const [liveMedications, setLiveMedications] = React.useState<any[]>([]);
  const [liveRisks, setLiveRisks] = React.useState<RiskIndicator[]>([]);

  // Hydrate clinical timeline, observations, medications, and risks for active patient
  React.useEffect(() => {
    let isMounted = true;
    fetch(`/api/timeline?patientId=${activePatientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.events && isMounted) {
          setClinicalEvents(data.events);
        }
      })
      .catch(() => {});

    fetch(`/api/caregiver/observations?patientId=${activePatientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.observations && isMounted) {
          setObservations(data.observations);
        }
      })
      .catch(() => {});

    Promise.all([
      fetch(`/api/medications?patientId=${activePatientId}&status=active`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/risks?patientId=${activePatientId}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([medData, riskData]) => {
      if (!isMounted) return;
      if (medData?.medications) {
        const mapped = medData.medications.map((m: any) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage || "Standard",
          schedule: m.frequency || "Daily",
          timing: m.frequency || "Morning",
          purpose: m.indication || "Prescribed regimen",
          specialInstructions: m.instructions || (m.fallRiskWarning ? "Fall risk precaution" : undefined),
        }));
        setLiveMedications(mapped);
      }
      if (riskData?.risks) {
        const mappedRisks: RiskIndicator[] = riskData.risks.map((r: any) => ({
          id: r.id,
          title: r.title,
          category: r.category as ObservationCategory,
          severity: r.priority === "high" ? "urgent" : r.priority === "medium" ? "moderate" : "mild",
          description: r.description || "Identified risk factor",
          doctorInstructions: (r.recommendations && r.recommendations.join(". ")) || "Follow standard caregiver observation protocol.",
          suggestedAction: "Log any symptom deviations immediately.",
          signals: r.factors || [],
        }));
        setLiveRisks(mappedRisks);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activePatientId]);

  // Save observations & followUpNotes when changed
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY_OBS, JSON.stringify(observations));
        window.localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(followUpNotes));
      } catch {
        // ignore
      }
    }
  }, [observations, followUpNotes]);

  const setCaregiverRelationship = React.useCallback((rel: CaregiverRelationship) => {
    setCaregiver((prev) => {
      const updated: CaregiverProfile = {
        ...prev,
        relationship: rel,
        title:
          rel === "family_member"
            ? "Family Caregiver"
            : rel === "agency_staff"
            ? "Agency Registered Care Coordinator"
            : "Certified Nursing Assistant (CNA)",
        organization:
          rel === "family_member"
            ? "Family & Guardian Circle"
            : rel === "agency_staff"
            ? "Apex Caregiver Staffing Network"
            : "Grace Senior Home Care",
      };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY_REL, rel);
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const setCaregiverPermission = React.useCallback((perm: CaregiverPermissionLevel) => {
    setCaregiver((prev) => ({
      ...prev,
      permissionLevel: perm,
    }));
  }, []);

  const switchPatient = React.useCallback(
    (patientId: string) => {
      if (patients.some((p) => p.id === patientId) || PATIENT_DETAILS_MAP[patientId]) {
        setActivePatientId(patientId);
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(STORAGE_KEY_PATIENT, patientId);
          } catch {
            // ignore
          }
        }
      }
    },
    [patients]
  );

  // Live Digital Twin State from Backend API
  const [liveDigitalTwin, setLiveDigitalTwin] = React.useState<PatientStateData | null>(null);

  const fetchTrends = React.useCallback(async (patId: string) => {
    try {
      const res = await fetch(`/api/caregiver/trends?patientId=${patId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setLiveDigitalTwin({
            state: data.state,
            label: data.label,
            plainExplanation: data.plainExplanation,
            lastCalculated: data.lastCalculated || "Just now",
            baselineSummary: data.baselineSummary || "74-year-old male baseline",
            trendSignals: data.trendSignals || [],
            contributingFactors: data.contributingFactors || [],
            whatThisMightMean: data.whatThisMightMean || {
              interpretation: "Patient status synchronized with live observation telemetry.",
              clinicalContext: "Baseline monitoring active.",
              actionableAdvice: "Continue current care plan.",
              whenToContactDoctor: "Notify attending physician if unsteadiness persists.",
            },
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live digital twin trends:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchTrends(activePatientId);
  }, [activePatientId, fetchTrends]);

  const activePatient = React.useMemo(() => {
    return patients.find((p) => p.id === activePatientId) || patients[0] || FALLBACK_PATIENT;
  }, [patients, activePatientId]);

  const basePatientCare = PATIENT_DETAILS_MAP[activePatientId] || RAVI_CARE_DETAILS;
  const activePatientCare = React.useMemo(() => {
    return {
      ...basePatientCare,
      patient: activePatient,
      medicationsList: liveMedications.length > 0 ? liveMedications : basePatientCare.medicationsList,
      watchList: liveRisks.length > 0 ? liveRisks : basePatientCare.watchList,
      digitalTwin: liveDigitalTwin || basePatientCare.digitalTwin,
    };
  }, [basePatientCare, activePatient, liveMedications, liveRisks, liveDigitalTwin]);

  // Add observation
  const addObservation = React.useCallback(
    async (
      obsData: Omit<CaregiverObservation, "id" | "timestamp" | "status">
    ): Promise<CaregiverObservation> => {
      const isUrgent =
        obsData.severity === "critical" ||
        obsData.severity === "high" ||
        (obsData as unknown as { severity: string }).severity === "urgent" ||
        obsData.category === "fall" ||
        obsData.incidentReported;

      let resolvedObs: CaregiverObservation = {
        ...obsData,
        id: `obs-${Date.now()}`,
        patientId: activePatientId,
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
        timestamp: new Date().toISOString(),
        status: "reviewed",
      };

      try {
        const res = await fetch("/api/caregiver/observations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            note: obsData.note,
            category: obsData.category,
            severity: obsData.severity,
            caregiverName: caregiver.name,
            caregiverId: caregiver.id,
            location: obsData.location,
            patientId: activePatientId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.observation) {
            resolvedObs = data.observation;
          }
          // Refresh digital twin trend state dynamically from newly computed observations
          fetchTrends(activePatientId);
        }
      } catch (err) {
        console.warn("Backend observation API error, falling back to local:", err);
      }

      setObservations((prev) => [resolvedObs, ...prev]);
      setLastSubmittedObservation(resolvedObs);

      // Open routing feedback modal
      setRoutingNotice({
        isOpen: true,
        type: isUrgent ? "urgent" : "routine",
        observation: resolvedObs,
      });

      return resolvedObs;
    },
    [activePatientId, caregiver.id, caregiver.name, fetchTrends]
  );

  // Add follow-up note
  const addFollowUpNote = React.useCallback(
    (eventId: string, noteText: string) => {
      if (!noteText.trim()) return;

      const newNote: FollowUpNote = {
        id: `fn-${Date.now()}`,
        eventId,
        author: caregiver.name,
        authorRole: caregiver.title || "Caregiver",
        note: noteText.trim(),
        timestamp: new Date().toISOString(),
      };

      setFollowUpNotes((prev) => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), newNote],
      }));

      // Asynchronously record follow up note in the backend timeline
      fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: activePatientId,
          type: "caregiver_observation",
          category: "caregiver",
          title: `Caregiver Follow-Up: ${caregiver.name}`,
          description: noteText.trim(),
          severity: "low",
          sourceType: "Caregiver Follow-Up Note",
          sourceId: eventId,
          author: caregiver.name,
          authorRole: caregiver.title || "Caregiver",
        }),
      }).catch((err) => console.warn("Failed to record follow-up note to timeline:", err));
    },
    [activePatientId, caregiver.name, caregiver.title]
  );

  const dismissRoutingNotice = React.useCallback(() => {
    setRoutingNotice((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openEmergencyModal = React.useCallback(() => setIsEmergencyModalOpen(true), []);
  const closeEmergencyModal = React.useCallback(() => setIsEmergencyModalOpen(false), []);

  const openPatientStateModal = React.useCallback(() => setIsPatientStateModalOpen(true), []);
  const closePatientStateModal = React.useCallback(() => setIsPatientStateModalOpen(false), []);

  const openObservationDrawer = React.useCallback((category?: ObservationCategory, tag?: string) => {
    setPreselectedCategory(category);
    setPreselectedTag(tag);
    setIsObservationDrawerOpen(true);
  }, []);

  const closeObservationDrawer = React.useCallback(() => {
    setIsObservationDrawerOpen(false);
    setPreselectedCategory(undefined);
    setPreselectedTag(undefined);
  }, []);


  // Combined timeline events (merging base clinical events + filtered caregiver observations for active patient)
  const timelineEvents = React.useMemo(() => {
    // Caregiver observations converted to TimelineEvent
    const obsEvents: TimelineEvent[] = observations
      .filter((obs) => obs.patientId === activePatientId)
      .map((obs) => {
        let title = obs.summary || `${obs.category.toUpperCase()} Observation`;
        if (obs.category === "fall") {
          title = "Fall Incident Logged";
        } else if (obs.category === "confusion") {
          title = "Confusion Episode";
        } else if (obs.category === "medication_adherence") {
          title = "Medication Intake Note";
        } else if (obs.category === "mobility") {
          title = "Mobility & Transfer Observation";
        } else if (obs.category === "appetite") {
          title = "Meal & Hydration Check";
        }

        let mappedSeverity: "low" | "medium" | "high" | "critical" = "low";
        if (obs.severity === "critical" || (obs.severity as string) === "urgent") {
          mappedSeverity = "critical";
        } else if (obs.severity === "high") {
          mappedSeverity = "high";
        } else if (obs.severity === "medium" || (obs.severity as string) === "moderate") {
          mappedSeverity = "medium";
        }

        return {
          id: obs.id,
          patientId: obs.patientId,
          date: obs.timestamp.slice(0, 10),
          time: formatTimeDeterministic(obs.timestamp),
          type: obs.category === "fall" ? "fall" : "caregiver_observation",
          category: "caregiver",
          title,
          description: obs.note,
          severity: mappedSeverity,
          sourceType: "Logged by Caregiver",
          author: obs.caregiverName,
          authorRole: "Caregiver",
          metadata: {
            category: obs.category,
            location: obs.location,
            actionTaken: obs.actionTaken,
            vitalsChecked: obs.vitalsChecked,
            incidentReported: obs.incidentReported,
          },
        };
      });

    // Clinical timeline events
    const currentClinical = clinicalEvents.filter((ev) => ev.patientId === activePatientId);

    // Merge and deduplicate by id
    const existingIds = new Set<string>();
    const merged: TimelineEvent[] = [];

    // Add observations first
    for (const ev of obsEvents) {
      existingIds.add(ev.id);
      merged.push(ev);
    }

    // Add clinical events not shadowed by an observation
    for (const ev of currentClinical) {
      if (!existingIds.has(ev.id) && !existingIds.has(ev.sourceId || "")) {
        existingIds.add(ev.id);
        merged.push(ev);
      }
    }

    // Sort descending by date & time
    return merged.sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const timeB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return timeB - timeA;
    });
  }, [observations, activePatientId, clinicalEvents]);

  return (
    <CaregiverContext.Provider
      value={{
        caregiver,
        setCaregiverRelationship,
        setCaregiverPermission,
        patients,
        activePatientId,
        activePatient,
        activePatientCare,
        switchPatient,
        observations,
        addObservation,
        timelineEvents,
        followUpNotes,
        addFollowUpNote,
        lastSubmittedObservation,
        routingNotice,
        dismissRoutingNotice,
        isEmergencyModalOpen,
        openEmergencyModal,
        closeEmergencyModal,
        isPatientStateModalOpen,
        openPatientStateModal,
        closePatientStateModal,
        isObservationDrawerOpen,
        openObservationDrawer,
        closeObservationDrawer,
        preselectedCategory,
        preselectedTag,
      }}
    >
      {children}
    </CaregiverContext.Provider>
  );
}

export function useCaregiver() {
  const context = React.useContext(CaregiverContext);
  if (!context) {
    throw new Error("useCaregiver must be used within a CaregiverProvider");
  }
  return context;
}
