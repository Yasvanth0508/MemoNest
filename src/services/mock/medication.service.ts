import { Medication } from '@/types';
import { mockMedications } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let medicationsStore: Medication[] = JSON.parse(JSON.stringify(mockMedications));

export const medicationService = {
  async getMedications(patientId?: string): Promise<Medication[]> {
    await simulateDelay();
    let meds = medicationsStore.filter((m) => m.status === 'active');
    if (patientId) {
      meds = meds.filter((m) => m.patientId === patientId);
    }
    return JSON.parse(JSON.stringify(meds));
  },

  async getMedicationHistory(patientId?: string): Promise<Medication[]> {
    await simulateDelay();
    let meds = [...medicationsStore];
    if (patientId) {
      meds = meds.filter((m) => m.patientId === patientId);
    }
    // Return complete medication history (active, stopped, historical)
    return JSON.parse(JSON.stringify(meds));
  },
};

export const { getMedications, getMedicationHistory } = medicationService;
