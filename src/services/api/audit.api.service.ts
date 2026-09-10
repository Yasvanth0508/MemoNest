import { AuditLogEntry } from '@/types';

export const auditApiService = {
  async getAuditLogs(patientId?: string): Promise<AuditLogEntry[]> {
    try {
      const url = patientId ? `/api/audit?patientId=${patientId}` : '/api/audit';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      return data.auditLogs || [];
    } catch (error) {
      console.error('auditApiService.getAuditLogs error:', error);
      return [];
    }
  },

  async logAccess(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
  ): Promise<AuditLogEntry> {
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error('Failed to log audit access');
      const data = await res.json();
      return data.entry;
    } catch (error) {
      console.error('auditApiService.logAccess error:', error);
      return {
        ...entry,
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    }
  },
};

export const { getAuditLogs, logAccess } = auditApiService;
