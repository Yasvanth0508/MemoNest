import { CaregiverObservation } from '@/types';

export const caregiverApiService = {
  async getObservations(patientId?: string): Promise<CaregiverObservation[]> {
    try {
      let url = '/api/caregiver/observations';
      if (patientId) {
        url = `/api/caregiver/observations?patientId=${encodeURIComponent(patientId)}`;
      } else if (typeof window !== 'undefined') {
        const savedEmail = window.localStorage.getItem('active_patient_email');
        if (savedEmail) {
          url = `/api/caregiver/observations?email=${encodeURIComponent(savedEmail)}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch caregiver observations (Status: ${res.status})`);
      }

      const data = await res.json();
      return data.observations || [];
    } catch (err) {
      console.error('caregiverApiService.getObservations error:', err);
      return [];
    }
  },

  async submitObservation(
    observation: Omit<CaregiverObservation, 'id' | 'timestamp' | 'status'>
  ): Promise<CaregiverObservation> {
    try {
      let savedEmail = 'ravi@healthmemory.demo';
      if (typeof window !== 'undefined') {
        savedEmail = window.localStorage.getItem('active_patient_email') || savedEmail;
      }

      const res = await fetch('/api/caregiver/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...observation,
          email: savedEmail,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record observation');
      }

      const data = await res.json();
      return data.observation;
    } catch (err) {
      console.error('Error submitting observation via API:', err);
      // Fallback object so UI doesn't crash
      return {
        id: `obs-${Date.now()}`,
        patientId: observation.patientId || 'patient-001',
        caregiverId: observation.caregiverId || 'user-caregiver-001',
        caregiverName: observation.caregiverName || 'Anita Desai',
        timestamp: new Date().toISOString(),
        category: observation.category,
        note: observation.note,
        severity: observation.severity,
        incidentReported: observation.incidentReported,
        status: 'reviewed',
      };
    }
  },

  async getTrends(patientId?: string) {
    try {
      let url = '/api/caregiver/trends';
      if (patientId) {
        url = `/api/caregiver/trends?patientId=${encodeURIComponent(patientId)}`;
      } else if (typeof window !== 'undefined') {
        const savedEmail = window.localStorage.getItem('active_patient_email');
        if (savedEmail) {
          url = `/api/caregiver/trends?email=${encodeURIComponent(savedEmail)}`;
        }
      }
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
