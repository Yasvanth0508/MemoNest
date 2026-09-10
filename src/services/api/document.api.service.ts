import { MedicalDocument } from '@/types';
import { mockDocuments } from '@/data/mock/documents';

export const documentApiService = {
  async getDocuments(patientId?: string): Promise<MedicalDocument[]> {
    try {
      let savedEmail = 'ravi@healthmemory.demo';
      if (typeof window !== 'undefined') {
        savedEmail = window.localStorage.getItem('active_patient_email') || savedEmail;
      }

      const res = await fetch(`/api/documents?email=${encodeURIComponent(savedEmail)}`);
      if (!res.ok) {
        return mockDocuments;
      }

      const data = await res.json();
      return data.documents || mockDocuments;
    } catch {
      return mockDocuments;
    }
  },

  async uploadWithOcr(file: File, category: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    let savedEmail = 'ravi@healthmemory.demo';
    if (typeof window !== 'undefined') {
      savedEmail = window.localStorage.getItem('active_patient_email') || savedEmail;
    }
    formData.append('email', savedEmail);

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('OCR extraction failed');
    }

    return await res.json();
  },

  async confirmDocument(draftData: any) {
    let savedEmail = 'ravi@healthmemory.demo';
    if (typeof window !== 'undefined') {
      savedEmail = window.localStorage.getItem('active_patient_email') || savedEmail;
    }

    const res = await fetch('/api/documents/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draftData,
        patientEmail: savedEmail,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to confirm document');
    }

    return await res.json();
  },

  async uploadDocument(
    file: File,
    metadata: { title: string; documentType: string }
  ): Promise<MedicalDocument> {
    const ocrResult = await this.uploadWithOcr(file, metadata.documentType);
    const confirmed = await this.confirmDocument({
      title: metadata.title || ocrResult.extracted.title,
      reportType: metadata.documentType || ocrResult.extracted.reportType,
      date: ocrResult.extracted.date,
      facility: ocrResult.extracted.facility,
      provider: ocrResult.extracted.provider,
      summary: ocrResult.extracted.summary,
      diagnoses: ocrResult.extracted.diagnoses,
      medications: ocrResult.extracted.medications,
      keyFindings: ocrResult.extracted.keyFindings,
      fileUrl: ocrResult.fileUrl,
      fileSize: ocrResult.fileSize,
      fileType: ocrResult.fileType,
      evidenceSnippets: ocrResult.extracted.evidenceSnippets,
    });

    return confirmed.document;
  },
};
