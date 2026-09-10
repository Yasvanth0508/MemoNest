import { Patient } from '@/types';
import { mockPatient, mockPatients } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// In-memory state for mock service
let patientsStore: Patient[] = JSON.parse(JSON.stringify(mockPatients));

export const patientService = {
  async getPatient(patientId?: string): Promise<Patient> {
    await simulateDelay();
    if (!patientId) {
      return JSON.parse(JSON.stringify(patientsStore[0] || mockPatient));
    }
    const found = patientsStore.find((p) => p.id === patientId);
    if (!found) {
      return JSON.parse(JSON.stringify(patientsStore[0] || mockPatient));
    }
    return JSON.parse(JSON.stringify(found));
  },

  async getPatients(): Promise<Patient[]> {
    await simulateDelay();
    return JSON.parse(JSON.stringify(patientsStore));
  },

  async updatePatient(patient: Partial<Patient>): Promise<Patient> {
    await simulateDelay();
    const targetId = patient.id || patientsStore[0]?.id || mockPatient.id;
    const index = patientsStore.findIndex((p) => p.id === targetId);

    if (index >= 0) {
      patientsStore[index] = {
        ...patientsStore[index],
        ...patient,
      };
      return JSON.parse(JSON.stringify(patientsStore[index]));
    }

    const updated = {
      ...mockPatient,
      ...patient,
    } as Patient;
    patientsStore.push(updated);
    return JSON.parse(JSON.stringify(updated));
  },
};

export const { getPatient, getPatients, updatePatient } = patientService;
