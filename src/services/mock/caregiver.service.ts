import { CaregiverObservation } from '@/types';
import { mockCaregiverObservations } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let observationsStore: CaregiverObservation[] = JSON.parse(
  JSON.stringify(mockCaregiverObservations)
);

export const caregiverService = {
  async getObservations(patientId?: string): Promise<CaregiverObservation[]> {
    await simulateDelay();
    let observations = [...observationsStore];
    if (patientId) {
      observations = observations.filter((o) => o.patientId === patientId);
    }
    // Return sorted latest first
    return JSON.parse(
      JSON.stringify(
        observations.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      )
    );
  },

  async submitObservation(
    observation: Omit<CaregiverObservation, 'id' | 'timestamp' | 'status'>
  ): Promise<CaregiverObservation> {
    await simulateDelay();
    const newObservation: CaregiverObservation = {
      ...observation,
      id: `obs-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'unverified',
    };

    observationsStore.unshift(newObservation);
    return JSON.parse(JSON.stringify(newObservation));
  },
};

export const { getObservations, submitObservation } = caregiverService;
