import { Medication } from '@/types';

export const medicationApiService = {
  async getMedications(patientId?: string): Promise<Medication[]> {
    try {
      const url = patientId ? `/api/medications?patientId=${patientId}&status=active` : '/api/medications?status=active';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch active medications');
      const data = await res.json();
      return data.medications || [];
    } catch (error) {
      console.error('medicationApiService.getMedications error:', error);
      return [];
    }
  },

  async getMedicationHistory(patientId?: string): Promise<Medication[]> {
    try {
      const url = patientId ? `/api/medications?patientId=${patientId}` : '/api/medications';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch medication history');
      const data = await res.json();
      return data.medications || [];
    } catch (error) {
      console.error('medicationApiService.getMedicationHistory error:', error);
      return [];
    }
  },

  async prescribeMedication(payload: {
    patientId?: string;
    name: string;
    dosage: string;
    frequency: string;
    route?: string;
    indication?: string;
    instructions?: string;
    prescriber?: string;
    prescriberId?: string;
  }): Promise<{ success: boolean; medication: Medication; timelineEventId?: string }> {
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to prescribe medication');
    }
    return await res.json();
  },

  async checkInteractions(medicationName: string, patientId?: string) {
    const res = await fetch('/api/medications/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicationName, patientId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to check medication interactions');
    }
    return await res.json();
  },
};

export const { getMedications, getMedicationHistory } = medicationApiService;
