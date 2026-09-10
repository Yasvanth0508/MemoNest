import { ConsentGrant, ConsentScope, ConsentStatus } from '@/types';
import { mockConsentRecords } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let consentStore: ConsentGrant[] = JSON.parse(JSON.stringify(mockConsentRecords));

export const consentService = {
  async getConsentGrants(patientId?: string): Promise<ConsentGrant[]> {
    await simulateDelay();
    let grants = [...consentStore];
    if (patientId) {
      grants = grants.filter((g) => g.patientId === patientId);
    }
    return JSON.parse(JSON.stringify(grants));
  },

  async updateConsentGrant(
    grantId: string,
    permissions: Partial<ConsentScope> | Record<string, boolean> | Partial<ConsentGrant> | any
  ): Promise<ConsentGrant> {
    await simulateDelay();
    const index = consentStore.findIndex((g) => g.id === grantId);
    if (index === -1) {
      throw new Error(`Consent grant not found for id: ${grantId}`);
    }

    const grant = { ...consentStore[index] };

    // If permissions is an array of ConsentScope
    if (Array.isArray(permissions)) {
      grant.grantedPermissions = permissions as ConsentScope[];
    } else if (typeof permissions === 'object' && permissions !== null) {
      if ('grantedPermissions' in permissions) {
        grant.grantedPermissions = permissions.grantedPermissions;
      }
      if ('deniedPermissions' in permissions) {
        grant.deniedPermissions = permissions.deniedPermissions;
      }
      if ('restrictedPermissions' in permissions) {
        grant.restrictedPermissions = permissions.restrictedPermissions;
      }
      if ('status' in permissions) {
        grant.status = permissions.status as ConsentStatus;
      }

      // If permissions is a map of scope -> boolean
      const booleanEntries = Object.entries(permissions).filter(
        ([key, val]) => typeof val === 'boolean' && key !== 'status'
      );
      if (booleanEntries.length > 0) {
        const currentGranted = new Set<ConsentScope>(grant.grantedPermissions);
        const currentDenied = new Set<ConsentScope>(grant.deniedPermissions);

        for (const [scope, allowed] of booleanEntries) {
          const scopeKey = scope as ConsentScope;
          if (allowed) {
            currentGranted.add(scopeKey);
            currentDenied.delete(scopeKey);
          } else {
            currentGranted.delete(scopeKey);
            currentDenied.add(scopeKey);
          }
        }
        grant.grantedPermissions = Array.from(currentGranted);
        grant.deniedPermissions = Array.from(currentDenied);
      }
    }

    grant.lastUpdated = new Date().toISOString();
    consentStore[index] = grant;
    return JSON.parse(JSON.stringify(grant));
  },

  async revokeConsent(grantId: string): Promise<boolean> {
    await simulateDelay();
    const index = consentStore.findIndex((g) => g.id === grantId);
    if (index === -1) {
      return false;
    }
    consentStore[index] = {
      ...consentStore[index],
      status: 'revoked',
      lastUpdated: new Date().toISOString(),
    };
    return true;
  },
};

export const { getConsentGrants, updateConsentGrant, revokeConsent } = consentService;
