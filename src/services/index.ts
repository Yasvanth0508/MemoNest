/**
 * Central Service Facade for Persistent Health Memory
 *
 * This layer connects the frontend to real backend APIs backed by Prisma ORM and Supabase PostgreSQL.
 * Mock data has been completely eliminated.
 */

import { authApiService } from './api/auth.api.service';
import { patientApiService } from './api/patient.api.service';
import { timelineApiService } from './api/timeline.api.service';
import { caregiverApiService } from './api/caregiver.api.service';
import { documentApiService } from './api/document.api.service';
import { medicationApiService } from './api/medication.api.service';
import { consentApiService } from './api/consent.api.service';
import { auditApiService } from './api/audit.api.service';
import { clinicalBriefApiService } from './api/clinical-brief.api.service';
import { riskApiService } from './api/risk.api.service';
import { evidenceApiService } from './api/evidence.api.service';

export const DATA_SOURCE = 'api';

// Live service bindings
export const patientService = patientApiService;
export const timelineService = timelineApiService;
export const medicationService = medicationApiService;
export const riskService = riskApiService;
export const caregiverService = caregiverApiService;
export const consentService = consentApiService;
export const auditService = auditApiService;
export const evidenceService = evidenceApiService;
export const clinicalBriefService = clinicalBriefApiService;
export const documentService = documentApiService;
export const authService = authApiService;

// Direct named function exports wired to real backend services
// Patient
export const getPatient = (patientId?: string) => patientApiService.getPatient(patientId);
export const getPatients = () => patientApiService.getPatients();
export const updatePatient = (patch: any) => patientApiService.updatePatient(patch);

// Timeline
export const getTimelineEvents = (patientId?: string, category?: string, search?: string) =>
  timelineApiService.getTimelineEvents(patientId, category, search);
export const getTimelineEventById = (eventId: string) =>
  timelineApiService.getTimelineEventById(eventId);

// Medications
export const getMedications = (patientId?: string) =>
  medicationApiService.getMedications(patientId);
export const getMedicationHistory = (patientId?: string) =>
  medicationApiService.getMedicationHistory(patientId);

// Risks
export const getRiskSignals = (patientId?: string) =>
  riskApiService.getRiskSignals(patientId);
export const getRiskById = (riskId: string) =>
  riskApiService.getRiskById(riskId);

// Caregiver Observations
export const getObservations = (patientId?: string) =>
  caregiverApiService.getObservations(patientId);
export const submitObservation = (obs: any) =>
  caregiverApiService.submitObservation(obs);

// Consent
export const getConsentGrants = (patientId?: string) =>
  consentApiService.getConsentGrants(patientId);
export const updateConsentGrant = (grantId: string, permissions: any) =>
  consentApiService.updateConsentGrant(grantId, permissions);
export const revokeConsent = (grantId: string) =>
  consentApiService.revokeConsent(grantId);

// Audit
export const getAuditLogs = (patientId?: string) =>
  auditApiService.getAuditLogs(patientId);
export const logAccess = (entry: any) =>
  auditApiService.logAccess(entry);

// Evidence
export const getEvidenceById = (id: string) =>
  evidenceApiService.getEvidenceById(id);
export const getEvidenceForRisk = (riskId: string) =>
  evidenceApiService.getEvidenceForRisk(riskId);
export const getAllEvidence = (patientId?: string) =>
  evidenceApiService.getAllEvidence(patientId);
export const getEvidenceByIds = (ids: string[]) =>
  evidenceApiService.getEvidenceByIds(ids);

// Clinical Brief
export const getClinicalBrief = (patientId?: string) =>
  clinicalBriefApiService.getClinicalBrief(patientId);

// Documents
export const getDocuments = (patientId?: string) =>
  documentApiService.getDocuments(patientId);
export const uploadDocument = (file: File, meta: { title: string; documentType: string }) =>
  documentApiService.uploadDocument(file, meta);

// Auth
export const login = (email: string, password?: string, role?: any, patientEmail?: string) =>
  authApiService.login(email, password, role, patientEmail);
export const getCurrentSession = () =>
  authApiService.getCurrentSession();
export const logout = () =>
  authApiService.logout();
