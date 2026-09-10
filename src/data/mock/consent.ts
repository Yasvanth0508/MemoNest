import { ConsentRecord } from '@/types';

export const mockConsentRecords: ConsentRecord[] = [
  {
    id: 'consent-clinician-001',
    patientId: 'patient-001',
    granteeId: 'user-clinician-001',
    granteeName: 'Dr. Rajesh Sharma',
    granteeRole: 'doctor',
    granteeEmail: 'dr.sharma@hospital.demo',
    organization: 'MetroHealth Senior Specialty Clinic',
    grantedPermissions: [
      'full_medical',
      'medications',
      'lab_results',
      'cognitive_records',
      'caregiver_observations',
      'emergency_access',
    ],
    deniedPermissions: ['genetics'],
    restrictedPermissions: [],
    status: 'active',
    validFrom: '2026-09-01T00:00:00Z',
    validUntil: '2026-10-01T23:59:59Z', // Expires in 30 days from Sep 1
    lastUpdated: '2026-09-01T10:15:00Z',
    notes: 'Comprehensive clinical care and AI brief access granted. Genetic testing records withheld per patient preference.',
  },
  {
    id: 'consent-caregiver-001',
    patientId: 'patient-001',
    granteeId: 'user-caregiver-001',
    granteeName: 'Anita Desai',
    granteeRole: 'caregiver',
    granteeEmail: 'anita@caregiver.demo',
    organization: 'Grace Senior Home Care',
    grantedPermissions: [
      'caregiver_observations',
    ],
    deniedPermissions: [
      'genetics',
      'mental_health_notes',
    ],
    restrictedPermissions: [
      'full_medical',
      'lab_results',
      'cognitive_records',
    ],
    status: 'active',
    validFrom: '2025-06-01T00:00:00Z',
    validUntil: '2027-06-01T23:59:59Z',
    lastUpdated: '2026-06-01T09:00:00Z',
    notes: 'Daily home care monitoring and observation logging authorization. Full diagnostic and laboratory files are restricted to protect patient privacy.',
  },
];

export const mockConsentGrants = mockConsentRecords;
