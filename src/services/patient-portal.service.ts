import { Patient, MedicalDocument, ConsentRecord, ConsentScope, TimelineEvent } from "@/types";

export interface PatientNotification {
  id: string;
  category: "medication" | "appointment" | "health_record" | "consent" | "caregiver";
  title: string;
  message: string;
  timestamp: string;
  timeDisplay: string;
  severity: "info" | "gentle" | "attention";
  isRead: boolean;
  actionLabel?: string;
  actionUrl?: string;
  source?: string;
}

export interface AccessRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  requesterOrg: string;
  reason: string;
  durationDays: number;
  requestedCategories: string[];
  requestDate: string;
  status: "pending" | "approved" | "denied";
}

export interface ProfileChangeRequest {
  id: string;
  field: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  dateSubmitted: string;
  status: "pending_review" | "approved" | "rejected";
  reviewedBy?: string;
}

export interface UploadedRecordItem extends MedicalDocument {
  processingStatus: "Processing" | "Parsed" | "Needs Review" | "Confirmed";
  aiExtracted?: {
    date: string;
    provider: string;
    diagnosis: string;
    medication: string;
    reportType: string;
    confidence: number;
    notes: string;
  };
  hasDuplicateWarning?: boolean;
}

const DEFAULT_PATIENT: Patient = {
  id: "",
  name: "Loading...",
  dateOfBirth: "",
  age: 0,
  gender: "Male",
  email: "",
  activeConditions: [],
  allergies: [],
  bloodType: "",
  primaryDoctor: "",
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
  mobilityStatus: "Normal",
};

// Client-side in-memory singleton
class PatientPortalStore {
  private patient: Patient = { ...DEFAULT_PATIENT };
  private reports: UploadedRecordItem[] = [];
  private notifications: PatientNotification[] = [];
  private consentRecords: ConsentRecord[] = [];
  private accessRequests: AccessRequest[] = [];
  private changeRequests: ProfileChangeRequest[] = [];
  private timelineEvents: TimelineEvent[] = [];
  private listeners: Array<() => void> = [];
  private isLoaded: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initFromApi();
    }
  }

  public async initFromApi() {
    try {
      const email =
        typeof window !== "undefined"
          ? window.localStorage.getItem("active_patient_email") || "ravi@healthmemory.demo"
          : "ravi@healthmemory.demo";

      const storedId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("active_patient_id")
          : null;

      const patientUrl = storedId
        ? `/api/patient?id=${encodeURIComponent(storedId)}`
        : `/api/patient?email=${encodeURIComponent(email)}`;

      const patientRes = await fetch(patientUrl).catch(() => null);

      let targetPatientId = storedId || "";
      if (patientRes && patientRes.ok) {
        const data = await patientRes.json();
        if (data.patient) {
          this.patient = data.patient;
          targetPatientId = data.patient.id;
          if (typeof window !== "undefined") {
            window.localStorage.setItem("active_patient_id", data.patient.id);
            if (data.patient.email) {
              window.localStorage.setItem("active_patient_email", data.patient.email);
            }
          }
        }
      }

      const queryParams = `patientId=${targetPatientId}&email=${encodeURIComponent(email)}`;

      const [timelineRes, reqRes, notifRes, docsRes, consentRes, accessRes] = await Promise.all([
        fetch(`/api/timeline?${queryParams}`).catch(() => null),
        fetch(`/api/patient/requests?${queryParams}`).catch(() => null),
        fetch(`/api/patient/notifications?${queryParams}`).catch(() => null),
        fetch(`/api/documents?${queryParams}`).catch(() => null),
        fetch(`/api/consent?${queryParams}`).catch(() => null),
        fetch(`/api/patient/access-requests?${queryParams}`).catch(() => null),
      ]);

      if (timelineRes && timelineRes.ok) {
        const data = await timelineRes.json();
        if (data.events) this.timelineEvents = data.events;
      }
      if (reqRes && reqRes.ok) {
        const data = await reqRes.json();
        if (data.requests) this.changeRequests = data.requests;
      }
      if (notifRes && notifRes.ok) {
        const data = await notifRes.json();
        if (data.notifications) this.notifications = data.notifications;
      }
      if (docsRes && docsRes.ok) {
        const data = await docsRes.json();
        if (data.documents) {
          this.reports = data.documents.map((d: any) => ({
            ...d,
            processingStatus: "Confirmed" as const,
          }));
        }
      }
      if (consentRes && consentRes.ok) {
        const data = await consentRes.json();
        if (data.records) this.consentRecords = data.records;
      }
      if (accessRes && accessRes.ok) {
        const data = await accessRes.json();
        if (data.requests) this.accessRequests = data.requests;
      }

      this.isLoaded = true;
      this.notify();
    } catch (err) {
      console.error("Failed to init patient portal from API:", err);
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Patient
  public getPatient(): Patient {
    return this.patient;
  }

  public isDataLoaded(): boolean {
    return this.isLoaded;
  }

  public updatePatient(patch: Partial<Patient>): Patient {
    this.patient = { ...this.patient, ...patch };
    this.notify();
    if (typeof window !== "undefined") {
      fetch("/api/patient", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, email: this.patient.email, id: this.patient.id }),
      }).catch(() => {});
    }
    return this.patient;
  }

  // Change Requests
  public getChangeRequests(): ProfileChangeRequest[] {
    return this.changeRequests;
  }

  public submitChangeRequest(field: string, currentValue: string, requestedValue: string, reason: string): ProfileChangeRequest {
    const req: ProfileChangeRequest = {
      id: `cr-${Date.now()}`,
      field,
      currentValue,
      requestedValue,
      reason,
      dateSubmitted: new Date().toISOString().split("T")[0],
      status: "pending_review",
    };
    this.changeRequests = [req, ...this.changeRequests];
    this.notify();
    if (typeof window !== "undefined") {
      fetch("/api/patient/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, currentValue, requestedValue, reason, email: this.patient.email }),
      }).catch(() => {});
    }
    return req;
  }

  // Reports
  public getReports(): UploadedRecordItem[] {
    return this.reports;
  }

  public getReportById(id: string): UploadedRecordItem | undefined {
    return this.reports.find((r) => r.id === id);
  }

  public addReport(report: UploadedRecordItem): UploadedRecordItem {
    this.reports = [report, ...this.reports];
    if (report.processingStatus === "Confirmed") {
      this.timelineEvents = [
        {
          id: `tl-${Date.now()}`,
          patientId: this.patient.id,
          date: report.date,
          time: "10:30",
          type: "lab_result",
          category: "labs",
          title: report.title,
          description: report.summary,
          severity: "low",
          sourceType: report.type,
          sourceId: report.id,
          author: report.author || report.facility,
          authorRole: "Healthcare Provider",
        },
        ...this.timelineEvents,
      ];
    }
    this.notify();
    return report;
  }

  public updateReportStatus(id: string, status: UploadedRecordItem["processingStatus"]) {
    this.reports = this.reports.map((r) =>
      r.id === id ? { ...r, processingStatus: status } : r
    );
    this.notify();
  }

  // Notifications
  public getNotifications(): PatientNotification[] {
    return this.notifications;
  }

  public getUnreadNotificationsCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notify();
    if (typeof window !== "undefined") {
      fetch("/api/patient/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.notify();
    if (typeof window !== "undefined") {
      fetch("/api/patient/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true, email: this.patient.email }),
      }).catch(() => {});
    }
  }

  // Consent & Sharing
  public getConsentRecords(): ConsentRecord[] {
    return this.consentRecords;
  }

  public getAccessRequests(): AccessRequest[] {
    return this.accessRequests;
  }

  public async approveAccessRequest(id: string): Promise<boolean> {
    const req = this.accessRequests.find((r) => r.id === id);
    if (!req) return false;

    req.status = "approved";
    this.notify();

    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/patient/access-requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "approved" }),
        });

        if (res.ok) {
          const email = this.patient.email || "ravi@healthmemory.demo";
          const queryParams = `patientId=${this.patient.id}&email=${encodeURIComponent(email)}`;
          const [consentRes, notifRes] = await Promise.all([
            fetch(`/api/consent?${queryParams}`).catch(() => null),
            fetch(`/api/patient/notifications?${queryParams}`).catch(() => null),
          ]);
          if (consentRes && consentRes.ok) {
            const cData = await consentRes.json();
            if (cData.records) this.consentRecords = cData.records;
          }
          if (notifRes && notifRes.ok) {
            const nData = await notifRes.json();
            if (nData.notifications) this.notifications = nData.notifications;
          }
          this.notify();
        }
      } catch (err) {
        console.error("Error persisting approved access request:", err);
      }
    }
    return true;
  }

  public async denyAccessRequest(id: string): Promise<boolean> {
    const req = this.accessRequests.find((r) => r.id === id);
    if (!req) return false;

    req.status = "denied";
    this.notify();

    if (typeof window !== "undefined") {
      try {
        await fetch("/api/patient/access-requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "denied" }),
        });
      } catch (err) {
        console.error("Error persisting denied access request:", err);
      }
    }
    return true;
  }

  public revokeConsent(consentId: string): boolean {
    this.consentRecords = this.consentRecords.filter((c) => c.id !== consentId);
    this.notify();
    if (typeof window !== "undefined") {
      fetch("/api/consent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consentId, status: "revoked" }),
      }).catch(() => {});
    }
    return true;
  }

  public grantNewConsent(
    name: string,
    role: "doctor" | "caregiver" | "guardian",
    org: string,
    categories: string[],
    durationDays: number
  ): ConsentRecord {
    const newRecord: ConsentRecord = {
      id: `consent-${Date.now()}`,
      patientId: this.patient.id,
      granteeId: `user-${Date.now()}`,
      granteeName: name,
      granteeRole: role === "guardian" ? "caregiver" : role,
      granteeEmail: `${name.toLowerCase().replace(/ /g, ".")}@care.demo`,
      organization: org,
      grantedPermissions: categories as ConsentScope[],
      deniedPermissions: [],
      restrictedPermissions: [],
      status: "active",
      validFrom: new Date().toISOString(),
      validUntil:
        durationDays === -1
          ? "2099-12-31T23:59:59Z"
          : new Date(Date.now() + durationDays * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      notes: "Granted by patient through Consent & Sharing center.",
    };

    if (typeof window !== "undefined") {
      fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: this.patient.id,
          granteeName: name,
          granteeRole: role === "guardian" ? "caregiver" : role,
          organization: org,
          grantedPermissions: categories,
          durationDays,
          notes: "Granted by patient through Consent & Sharing center.",
        }),
      }).catch(() => {});
    }

    this.consentRecords = [newRecord, ...this.consentRecords];
    this.notify();
    return newRecord;
  }

  // Timeline
  public getTimelineEvents(): TimelineEvent[] {
    return this.timelineEvents;
  }
}

export const patientPortalStore = new PatientPortalStore();
