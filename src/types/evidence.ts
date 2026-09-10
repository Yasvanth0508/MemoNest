export type EvidenceSourceType =
  | 'document'
  | 'observation'
  | 'prescription'
  | 'lab_report'
  | 'clinical_note'
  | 'discharge_summary'
  | 'consultation';

export interface EvidenceSnippet {
  id: string;
  patientId: string;
  documentId?: string;
  documentTitle: string;
  documentDate: string;
  sourceType: EvidenceSourceType;
  quote: string;
  context: string;
  linkedEntity: string;
  confidenceScore: number;
  pageNumber?: number;
  author?: string;
}

export type EvidenceItem = EvidenceSnippet;
