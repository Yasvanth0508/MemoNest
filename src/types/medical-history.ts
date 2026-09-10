export type MedicalHistoryCategory =
  | 'cardiovascular'
  | 'metabolic'
  | 'neurological'
  | 'musculoskeletal'
  | 'cognitive'
  | 'other';

export interface MedicalHistoryItem {
  id: string;
  patientId: string;
  year: number;
  date?: string;
  condition: string;
  category: MedicalHistoryCategory;
  status: 'active' | 'managed' | 'resolved' | 'historical';
  details: string;
  diagnosedBy?: string;
  hospitalizationDays?: number;
  icdCode?: string;
  evidenceIds?: string[];
}
