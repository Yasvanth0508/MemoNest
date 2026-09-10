import { EvidenceItem } from '@/types';
import { mockEvidenceSnippets, mockRisks } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let evidenceStore: EvidenceItem[] = JSON.parse(JSON.stringify(mockEvidenceSnippets));

export const evidenceService = {
  async getEvidenceById(evidenceId: string): Promise<EvidenceItem | null> {
    await simulateDelay();
    const found = evidenceStore.find((e) => e.id === evidenceId);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  },

  async getEvidenceForRisk(riskId: string): Promise<EvidenceItem[]> {
    await simulateDelay();
    const targetRisk = mockRisks.find((r) => r.id === riskId);
    if (!targetRisk || !targetRisk.evidenceIds) {
      return [];
    }
    const matched = evidenceStore.filter((e) =>
      targetRisk.evidenceIds.includes(e.id)
    );
    return JSON.parse(JSON.stringify(matched));
  },

  async getAllEvidence(patientId?: string): Promise<EvidenceItem[]> {
    await simulateDelay();
    let items = [...evidenceStore];
    if (patientId) {
      items = items.filter((e) => e.patientId === patientId);
    }
    return JSON.parse(JSON.stringify(items));
  },

  async getEvidenceByIds(ids: string[]): Promise<EvidenceItem[]> {
    await simulateDelay();
    const matched = evidenceStore.filter((e) => ids.includes(e.id));
    return JSON.parse(JSON.stringify(matched));
  },
};

export const { getEvidenceById, getEvidenceForRisk, getAllEvidence, getEvidenceByIds } = evidenceService;
