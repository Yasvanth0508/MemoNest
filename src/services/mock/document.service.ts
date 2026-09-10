import { DocumentType, MedicalDocument } from '@/types';
import { mockDocuments } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let documentsStore: MedicalDocument[] = JSON.parse(JSON.stringify(mockDocuments));

export const documentService = {
  async getDocuments(patientId?: string): Promise<MedicalDocument[]> {
    await simulateDelay();
    let docs = [...documentsStore];
    if (patientId) {
      docs = docs.filter((d) => d.patientId === patientId);
    }
    // Return sorted newest date first
    return JSON.parse(
      JSON.stringify(
        docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
    );
  },

  async uploadDocument(
    file: File,
    metadata: { title: string; documentType: string }
  ): Promise<MedicalDocument> {
    await simulateDelay();

    const validTypes: DocumentType[] = [
      'discharge_summary',
      'consultation',
      'lab_report',
      'prescription',
      'clinical_note',
    ];

    const matchedType: DocumentType = validTypes.includes(
      metadata.documentType as DocumentType
    )
      ? (metadata.documentType as DocumentType)
      : 'clinical_note';

    const ext = file.name ? file.name.split('.').pop() || 'pdf' : 'pdf';
    const sizeKb = file.size ? (file.size / 1024).toFixed(1) : '512';

    const newDoc: MedicalDocument = {
      id: `doc-${Date.now()}`,
      patientId: 'patient-001',
      title: metadata.title || file.name || 'Uploaded Clinical Document',
      type: matchedType,
      date: new Date().toISOString().split('T')[0],
      facility: 'MetroHealth Community Hospital',
      author: 'Attending Physician',
      fileType: ext,
      fileSize: `${sizeKb} KB`,
      summary: `Uploaded clinical file: ${metadata.title || file.name}. Processed and ingested into longitudinal health memory.`,
      keyFindings: ['Document ingested and verified by AI memory processing pipeline.'],
      extractedEntities: [metadata.title || file.name],
      fileUrl: typeof window !== 'undefined' && window.URL ? URL.createObjectURL(file) : `/documents/${file.name || 'uploaded-file.pdf'}`,
    };

    documentsStore.unshift(newDoc);
    return JSON.parse(JSON.stringify(newDoc));
  },
};

export const { getDocuments, uploadDocument } = documentService;
