export interface ClinicalBrief {
  id: string;
  patientId: string;
  generatedAt: string;
  patientName: string;
  age: number;
  primaryDoctor: string;
  highPriorityAlerts: string[];
  recentChanges: string[];
  activeMedicationsCount: number;
  activeMedications: string[];
  relevantHistory: string[];
  clinicalSummary: string;
  recommendedActions: string[];
  evidenceIds: string[];
}
