import { Patient } from '@/types';

export const patientApiService = {
  async getPatient(patientId?: string): Promise<Patient> {
    try {
      let url = '/api/patient';
      const savedEmail = typeof window !== 'undefined' ? window.localStorage.getItem('active_patient_email') : null;
      const savedId = typeof window !== 'undefined' ? window.localStorage.getItem('active_patient_id') : null;
      const targetId = patientId || savedId;

      if (savedEmail && savedEmail.toLowerCase() !== 'ravi@healthmemory.demo') {
        url = `/api/patient?email=${encodeURIComponent(savedEmail)}${targetId && targetId !== 'patient-001' ? `&id=${encodeURIComponent(targetId)}` : ''}`;
      } else if (targetId) {
        url = `/api/patient?id=${encodeURIComponent(targetId)}`;
      } else if (savedEmail) {
        url = `/api/patient?email=${encodeURIComponent(savedEmail)}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch patient (Status: ${res.status})`);
      }

      const data = await res.json();
      return data.patient;
    } catch (err) {
      console.error('patientApiService.getPatient error:', err);
      throw err;
    }
  },

  async getPatients(): Promise<Patient[]> {
    try {
      const res = await fetch('/api/clinician/patients/search?all=true');
      if (!res.ok) {
        throw new Error(`Failed to fetch patients roster (Status: ${res.status})`);
      }
      const data = await res.json();
      return data.patients || [];
    } catch (err) {
      console.error('patientApiService.getPatients error:', err);
      throw err;
    }
  },

  async updatePatient(patch: Partial<Patient>): Promise<Patient> {
    try {
      const res = await fetch('/api/patient', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        throw new Error('Failed to update patient profile');
      }

      const data = await res.json();
      return data.patient;
    } catch (err) {
      console.error('Error updating patient via API:', err);
      throw err;
    }
  },
};
