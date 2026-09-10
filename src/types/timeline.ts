export type TimelineCategory =
  | 'medical'
  | 'medication'
  | 'laboratory'
  | 'labs'
  | 'cognitive'
  | 'functional'
  | 'caregiver'
  | 'hospitalization'
  | 'other';

export type TimelineEventType =
  | 'hospitalization'
  | 'review'
  | 'cognitive'
  | 'mobility'
  | 'routine_visit'
  | 'lab_result'
  | 'medication_change'
  | 'caregiver_observation'
  | 'incident'
  | 'fall';

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  time?: string;
  type: TimelineEventType;
  category: TimelineCategory;
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  sourceType: string;
  sourceId?: string;
  author?: string;
  authorRole?: string;
  evidenceId?: string;
  metadata?: Record<string, unknown>;
}
