export type DocumentType =
  | 'discharge_summary'
  | 'consultation'
  | 'lab_report'
  | 'prescription'
  | 'clinical_note';

export interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  type: DocumentType;
  date: string;
  facility: string;
  author: string;
  fileType: string;
  fileSize: string;
  summary: string;
  keyFindings?: string[];
  extractedEntities?: string[];
  evidenceSnippets?: string[];
  fileUrl?: string;
}
