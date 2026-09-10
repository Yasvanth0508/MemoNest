export type ObservationCategory =
  | 'fall'
  | 'mobility'
  | 'confusion'
  | 'drowsiness'
  | 'appetite'
  | 'behavior'
  | 'medication_adherence'
  | 'general';

export interface CaregiverObservation {
  id: string;
  patientId: string;
  caregiverId: string;
  caregiverName: string;
  timestamp: string;
  category: ObservationCategory;
  note: string;
  summary?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incidentReported: boolean;
  location?: string;
  actionTaken?: string;
  vitalsChecked?: boolean;
  evidenceId?: string;
  status?: 'unverified' | 'reviewed';
  notes?: string;
}
