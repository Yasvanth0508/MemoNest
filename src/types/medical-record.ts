export interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'diagnosis' | 'hospitalization' | 'procedure' | 'lab';
  title: string;
  date: string;
  description: string;
  doctor?: string;
  facility?: string;
  sourceDocumentId?: string;
  evidenceId?: string;
  status?: 'active' | 'resolved' | 'chronic';
}
