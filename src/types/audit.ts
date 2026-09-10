import { UserRole } from './user';

export type AuditEventType =
  | 'access'
  | 'query'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'override';

export interface AuditEntry {
  id: string;
  patientId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  eventType: AuditEventType;
  action: string;
  resource: string;
  details: string;
  purposeOfUse: string;
  ipAddress?: string;
  status: 'success' | 'denied' | 'flagged';
}

export type AuditLogEntry = AuditEntry;
