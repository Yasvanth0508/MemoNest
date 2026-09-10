import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-patient-001',
    name: 'Ravi Kumar',
    email: 'ravi@healthmemory.demo',
    role: 'patient',
    title: 'Patient',
    phone: '+1-555-0142',
    avatarUrl: '/avatars/ravi-kumar.jpg',
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'user-caregiver-001',
    name: 'Anita Desai',
    email: 'anita@caregiver.demo',
    role: 'caregiver',
    title: 'Certified Nursing Assistant / Home Caregiver',
    organization: 'Grace Senior Home Care',
    phone: '+1-555-0178',
    avatarUrl: '/avatars/anita-desai.jpg',
    createdAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 'user-clinician-001',
    name: 'Dr. Rajesh Sharma',
    email: 'dr.sharma@hospital.demo',
    role: 'doctor',
    title: 'MD, Geriatric Medicine & Internal Medicine',
    organization: 'MetroHealth Senior Specialty Clinic',
    phone: '+1-555-0110',
    avatarUrl: '/avatars/dr-sharma.jpg',
    createdAt: '2022-03-15T08:30:00Z',
  },
];

export const mockCurrentUser = mockUsers[0]; // Default demo user
