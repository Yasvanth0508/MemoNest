import { RiskSignal } from '@/types';
import { mockRisks } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let risksStore: RiskSignal[] = JSON.parse(JSON.stringify(mockRisks));

export const riskService = {
  async getRiskSignals(patientId?: string): Promise<RiskSignal[]> {
    await simulateDelay();
    let risks = [...risksStore];
    if (patientId) {
      risks = risks.filter((r) => r.patientId === patientId);
    }
    return JSON.parse(JSON.stringify(risks));
  },

  async getRiskById(riskId: string): Promise<RiskSignal | null> {
    await simulateDelay();
    const found = risksStore.find((r) => r.id === riskId);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  },
};

export const { getRiskSignals, getRiskById } = riskService;
