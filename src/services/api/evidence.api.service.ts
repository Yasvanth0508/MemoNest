import { EvidenceItem } from '@/types';

export const evidenceApiService = {
  async getEvidenceById(evidenceId: string): Promise<EvidenceItem | null> {
    try {
      const res = await fetch(`/api/evidence?id=${evidenceId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.evidence || null;
    } catch (err) {
      console.error('evidenceApiService.getEvidenceById error:', err);
      return null;
    }
  },

  async getEvidenceForRisk(riskId: string): Promise<EvidenceItem[]> {
    try {
      const res = await fetch(`/api/evidence?riskId=${riskId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.evidence || [];
    } catch (err) {
      console.error('evidenceApiService.getEvidenceForRisk error:', err);
      return [];
    }
  },

  async getAllEvidence(patientId?: string): Promise<EvidenceItem[]> {
    try {
      const url = patientId ? `/api/evidence?patientId=${patientId}` : '/api/evidence';
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.evidence || [];
    } catch (err) {
      console.error('evidenceApiService.getAllEvidence error:', err);
      return [];
    }
  },

  async getEvidenceByIds(ids: string[]): Promise<EvidenceItem[]> {
    try {
      if (!ids || ids.length === 0) return [];
      const res = await fetch(`/api/evidence?ids=${ids.join(',')}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.evidence || [];
    } catch (err) {
      console.error('evidenceApiService.getEvidenceByIds error:', err);
      return [];
    }
  },
};

export const { getEvidenceById, getEvidenceForRisk, getAllEvidence, getEvidenceByIds } =
  evidenceApiService;
