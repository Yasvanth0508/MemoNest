import { ClinicalBrief } from '@/types';
import { mockClinicalBrief } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const clinicalBriefService = {
  async getClinicalBrief(patientId?: string): Promise<ClinicalBrief> {
    await simulateDelay();
    const brief = { ...mockClinicalBrief };
    if (patientId) {
      brief.patientId = patientId;
    }
    return JSON.parse(JSON.stringify(brief));
  },
};

export const { getClinicalBrief } = clinicalBriefService;
