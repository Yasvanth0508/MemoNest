import { UserRole } from './user';

export type ConsentScope =
  | 'full_medical'
  | 'medications'
  | 'lab_results'
  | 'cognitive_records'
  | 'caregiver_observations'
  | 'genetics'
  | 'mental_health_notes'
  | 'emergency_access';

export type ConsentStatus = 'active' | 'expired' | 'revoked' | 'pending';

export interface ConsentRecord {
  id: string;
  patientId: string;
  granteeId: string;
  granteeName: string;
  granteeRole: UserRole;
  granteeEmail?: string;
  organization?: string;
  grantedPermissions: ConsentScope[];
  deniedPermissions: ConsentScope[];
  restrictedPermissions: ConsentScope[];
  status: ConsentStatus;
  validFrom: string;
  validUntil?: string;
  lastUpdated: string;
  notes?: string;
}

export type ConsentGrant = ConsentRecord;
