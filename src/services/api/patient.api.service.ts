import { Patient } from '@/types';
import { mockPatient } from '@/data/mock/patients';

export const patientApiService = {
  async getPatient(patientId?: string): Promise<Patient> {
    try {
      let savedEmail = 'ravi@healthmemory.demo';
      if (typeof window !== 'undefined') {
        savedEmail = window.localStorage.getItem('active_patient_email') || savedEmail;
      }

      const res = await fetch(`/api/patient?email=${encodeURIComponent(savedEmail)}`, {
        method: 'GET',
      });

      if (!res.ok) {
        return mockPatient;
      }

      const data = await res.json();
      return data.patient || mockPatient;
    } catch {
      return mockPatient;
    }
  },

  async getPatients(): Promise<Patient[]> {
    try {
      const p = await this.getPatient();
      return [p];
    } catch {
      return [mockPatient];
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
