/**
 * Central Service Facade for Persistent Health Memory
 *
 * This layer abstracts data access. The frontend interacts with these services,
 * which will route to either mock services or real backend APIs based on
 * the DATA_SOURCE configuration.
 */

import {
  patientService as mockPatientService,
  getPatient,
  getPatients,
  updatePatient,
} from './mock/patient.service';
import {
  timelineService as mockTimelineService,
  getTimelineEvents,
  getTimelineEventById,
} from './mock/timeline.service';
import {
  medicationService as mockMedicationService,
  getMedications,
  getMedicationHistory,
} from './mock/medication.service';
import {
  riskService as mockRiskService,
  getRiskSignals,
  getRiskById,
} from './mock/risk.service';
import {
  caregiverService as mockCaregiverService,
  getObservations,
  submitObservation,
} from './mock/caregiver.service';
import {
  consentService as mockConsentService,
  getConsentGrants,
  updateConsentGrant,
  revokeConsent,
} from './mock/consent.service';
import {
  auditService as mockAuditService,
  getAuditLogs,
  logAccess,
} from './mock/audit.service';
import {
  evidenceService as mockEvidenceService,
  getEvidenceById,
  getEvidenceForRisk,
  getAllEvidence,
  getEvidenceByIds,
} from './mock/evidence.service';
import {
  clinicalBriefService as mockClinicalBriefService,
  getClinicalBrief,
} from './mock/clinical-brief.service';
import {
  documentService as mockDocumentService,
  getDocuments,
  uploadDocument,
} from './mock/document.service';
import {
  authService as mockAuthService,
  login,
  getCurrentSession,
  logout,
} from './mock/auth.service';

export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';

// Switchable service bindings based on DATA_SOURCE
export const patientService = mockPatientService;
export const timelineService = mockTimelineService;
export const medicationService = mockMedicationService;
export const riskService = mockRiskService;
export const caregiverService = mockCaregiverService;
export const consentService = mockConsentService;
export const auditService = mockAuditService;
export const evidenceService = mockEvidenceService;
export const clinicalBriefService = mockClinicalBriefService;
export const documentService = mockDocumentService;
export const authService = mockAuthService;

// Direct named function exports for convenient import
export {
  // Patient
  getPatient,
  getPatients,
  updatePatient,
  // Timeline
  getTimelineEvents,
  getTimelineEventById,
  // Medications
  getMedications,
  getMedicationHistory,
  // Risks
  getRiskSignals,
  getRiskById,
  // Caregiver Observations
  getObservations,
  submitObservation,
  // Consent
  getConsentGrants,
  updateConsentGrant,
  revokeConsent,
  // Audit
  getAuditLogs,
  logAccess,
  // Evidence
  getEvidenceById,
  getEvidenceForRisk,
  getAllEvidence,
  getEvidenceByIds,
  // Clinical Brief
  getClinicalBrief,
  // Documents
  getDocuments,
  uploadDocument,
  // Auth
  login,
  getCurrentSession,
  logout,
};
