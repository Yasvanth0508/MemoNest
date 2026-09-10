export type MedicationStatus = 'active' | 'stopped' | 'historical';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route?: string;
  indication: string;
  status: MedicationStatus;
  startDate: string;
  endDate?: string;
  prescriber: string;
  prescriberId?: string;
  instructions?: string;
  stopReason?: string;
  changeReason?: string;
  recentChangeNotes?: string;
  sideEffectsReported?: string[];
  isRecentChange?: boolean;
  fallRiskWarning?: boolean;
  sedationRisk?: boolean;
  evidenceIds?: string[];
}
