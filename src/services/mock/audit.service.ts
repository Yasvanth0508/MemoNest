import { AuditLogEntry } from '@/types';
import { mockAuditEntries } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let auditStore: AuditLogEntry[] = JSON.parse(JSON.stringify(mockAuditEntries));

export const auditService = {
  async getAuditLogs(patientId?: string): Promise<AuditLogEntry[]> {
    await simulateDelay();
    let logs = [...auditStore];
    if (patientId) {
      logs = logs.filter((a) => a.patientId === patientId);
    }
    // Return sorted newest first
    return JSON.parse(
      JSON.stringify(
        logs.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      )
    );
  },

  async logAccess(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
  ): Promise<AuditLogEntry> {
    await simulateDelay();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    auditStore.unshift(newEntry);
    return JSON.parse(JSON.stringify(newEntry));
  },
};

export const { getAuditLogs, logAccess } = auditService;
