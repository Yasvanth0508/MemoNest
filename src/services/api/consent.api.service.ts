import { ConsentGrant, ConsentScope, ConsentStatus } from '@/types';

export const consentApiService = {
  async getConsentGrants(patientId?: string): Promise<ConsentGrant[]> {
    try {
      const url = patientId ? `/api/consent?patientId=${patientId}` : '/api/consent';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch consent grants');
      const data = await res.json();
      return data.records || [];
    } catch (error) {
      console.error('consentApiService.getConsentGrants error:', error);
      return [];
    }
  },

  async updateConsentGrant(
    grantId: string,
    permissions: any
  ): Promise<ConsentGrant> {
    const res = await fetch('/api/consent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: grantId,
        ...(Array.isArray(permissions) ? { grantedPermissions: permissions } : permissions),
      }),
    });
    if (!res.ok) throw new Error('Failed to update consent grant');
    const data = await res.json();
    return data.record;
  },

  async revokeConsent(grantId: string): Promise<boolean> {
    const res = await fetch('/api/consent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: grantId, status: 'revoked' }),
    });
    return res.ok;
  },

  async breakGlass(payload: {
    patientId: string;
    clinicianId: string;
    clinicianName: string;
    justification: string;
    overrideScope?: string;
  }) {
    const res = await fetch('/api/consent/break-glass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to trigger emergency break-glass');
    }
    return await res.json();
  },
};

export const { getConsentGrants, updateConsentGrant, revokeConsent } = consentApiService;
