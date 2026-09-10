import { ClinicalBrief } from '@/types';

export const clinicalBriefApiService = {
  async getClinicalBrief(patientId?: string): Promise<ClinicalBrief> {
    try {
      const url = patientId ? `/api/clinician/brief?patientId=${patientId}` : '/api/clinician/brief';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch clinical brief');
      const data = await res.json();
      return data.brief;
    } catch (error) {
      console.error('clinicalBriefApiService.getClinicalBrief error:', error);
      throw error;
    }
  },
};

export const { getClinicalBrief } = clinicalBriefApiService;
