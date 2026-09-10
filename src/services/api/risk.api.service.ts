import { RiskSignal } from '@/types';

export const riskApiService = {
  async getRiskSignals(patientId?: string): Promise<RiskSignal[]> {
    try {
      const url = patientId ? `/api/risks?patientId=${patientId}` : '/api/risks';
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.risks || [];
    } catch (err) {
      console.error('riskApiService.getRiskSignals error:', err);
      return [];
    }
  },

  async getRiskById(riskId: string): Promise<RiskSignal | null> {
    try {
      const res = await fetch(`/api/risks?id=${riskId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.risk || null;
    } catch (err) {
      console.error('riskApiService.getRiskById error:', err);
      return null;
    }
  },
};

export const { getRiskSignals, getRiskById } = riskApiService;
