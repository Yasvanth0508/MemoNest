export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PatientAllergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedDate?: string;
}

export interface PatientCondition {
  id: string;
  name: string;
  status: 'active' | 'managed' | 'resolved' | 'historical';
  diagnosedYear: number;
  icdCode?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  primaryDoctor: string;
  primaryDoctorId?: string;
  activeConditions: string[];
  allergies: PatientAllergy[];
  emergencyContact: EmergencyContact;
  profileImage?: string;
  bloodType?: string;
  address?: string;
  phone?: string;
  email?: string;
  preferredLanguage?: string;
  mobilityStatus?: string;
}
