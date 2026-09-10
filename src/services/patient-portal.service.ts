import { Patient, MedicalDocument, ConsentRecord, ConsentScope, TimelineEvent } from "@/types";
import { mockPatient } from "@/data/mock/patients";
import { mockDocuments } from "@/data/mock/documents";
import { mockConsentRecords } from "@/data/mock/consent";
import { mockTimelineEvents } from "@/data/mock/timeline";

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

// Initial Mock Notifications
const INITIAL_NOTIFICATIONS: PatientNotification[] = [
  {
    id: "notif-1",
    category: "appointment",
    title: "Doctor appointment tomorrow at 10:00 AM",
    message: "Geriatric follow-up consultation with Dr. Rajesh Sharma at MetroHealth Senior Specialty Clinic.",
    timestamp: "2026-09-10T09:00:00Z",
    timeDisplay: "Tomorrow at 10:00 AM",
    severity: "gentle",
    isRead: false,
    actionLabel: "View Details",
    actionUrl: "/patient/timeline",
  },
  {
    id: "notif-2",
    category: "medication",
    title: "Time to take your medication",
    message: "Morning dose: Amlodipine 5mg (1 tablet) and Metformin 500mg with breakfast.",
    timestamp: "2026-09-10T08:00:00Z",
    timeDisplay: "Today at 8:00 AM",
    severity: "gentle",
    isRead: false,
    actionLabel: "Mark as Taken",
  },
  {
    id: "notif-3",
    category: "consent",
    title: "Dr. Priya Sharma requested access to your health records",
    message: "Reason: Pre-consultation review for cardiology follow-up. Requested duration: 30 days.",
    timestamp: "2026-09-10T07:30:00Z",
    timeDisplay: "2 hours ago",
    severity: "attention",
    isRead: false,
    actionLabel: "Review Request",
    actionUrl: "/patient/consent",
  },
  {
    id: "notif-4",
    category: "health_record",
    title: "A new report was added to your health timeline",
    message: "Comprehensive Metabolic Panel & Lipid Profile from Quest Diagnostics confirmed by your care team.",
    timestamp: "2026-09-08T14:20:00Z",
    timeDisplay: "2 days ago",
    severity: "info",
    isRead: true,
    actionLabel: "View Report",
    actionUrl: "/patient/reports",
  },
  {
    id: "notif-5",
    category: "caregiver",
    title: "Your caregiver added a health observation",
    message: "Anita Desai noted: Morning transfer assisted safely with four-wheel walker. Vital signs stable.",
    timestamp: "2026-09-07T11:15:00Z",
    timeDisplay: "3 days ago",
    severity: "info",
    isRead: true,
    actionLabel: "View Timeline",
    actionUrl: "/patient/timeline",
  },
];

// Initial Access Requests
const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: "req-priya-01",
    requesterName: "Dr. Priya Sharma",
    requesterRole: "Consultant Cardiologist",
    requesterOrg: "MetroHealth Heart & Vascular Pavilion",
    reason: "Pre-consultation review of blood tests, stroke history, and blood pressure medications",
    durationDays: 30,
    requestedCategories: ["Medical reports", "Medications", "Lab results"],
    requestDate: "Today, 09:15 AM",
    status: "pending",
  },
];

// Initial Profile Change Requests
const INITIAL_CHANGE_REQUESTS: ProfileChangeRequest[] = [
  {
    id: "cr-01",
    field: "Blood Type",
    currentValue: "B+",
    requestedValue: "B+",
    reason: "Verified during recent clinic visit with lab confirmation",
    dateSubmitted: "2026-08-28",
    status: "approved",
    reviewedBy: "Dr. Rajesh Sharma",
  },
];

// Initial Reports / Documents
const INITIAL_REPORTS: UploadedRecordItem[] = mockDocuments.map((doc) => ({
  ...doc,
  processingStatus: "Confirmed" as const,
  aiExtracted: {
    date: doc.date,
    provider: doc.author || doc.facility,
    diagnosis: doc.extractedEntities?.[0] || "Geriatric Evaluation",
    medication: doc.extractedEntities?.[3] || "Standard Care",
    reportType: doc.type.replace("_", " ").toUpperCase(),
    confidence: 0.98,
    notes: doc.summary,
  },
}));

// Client-side in-memory singleton
class PatientPortalStore {
  private patient: Patient = { ...mockPatient };
  private reports: UploadedRecordItem[] = [...INITIAL_REPORTS];
  private notifications: PatientNotification[] = [...INITIAL_NOTIFICATIONS];
  private consentRecords: ConsentRecord[] = [...mockConsentRecords];
  private accessRequests: AccessRequest[] = [...INITIAL_ACCESS_REQUESTS];
  private changeRequests: ProfileChangeRequest[] = [...INITIAL_CHANGE_REQUESTS];
  private timelineEvents: TimelineEvent[] = [...mockTimelineEvents];
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initFromApi();
    }
  }

  public async initFromApi() {
    try {
      const email = window.localStorage.getItem("active_patient_email") || "ravi@healthmemory.demo";
      const [patientRes, timelineRes, reqRes, notifRes, docsRes, consentRes] = await Promise.all([
        fetch(`/api/patient?email=${encodeURIComponent(email)}`).catch(() => null),
        fetch(`/api/timeline?email=${encodeURIComponent(email)}`).catch(() => null),
        fetch(`/api/patient/requests?email=${encodeURIComponent(email)}`).catch(() => null),
        fetch(`/api/patient/notifications?email=${encodeURIComponent(email)}`).catch(() => null),
        fetch(`/api/documents?email=${encodeURIComponent(email)}`).catch(() => null),
        fetch(`/api/consent?email=${encodeURIComponent(email)}`).catch(() => null),
      ]);

      if (patientRes && patientRes.ok) {
        const data = await patientRes.json();
        if (data.patient) this.patient = data.patient;
      }
      if (timelineRes && timelineRes.ok) {
        const data = await timelineRes.json();
        if (data.events && data.events.length > 0) this.timelineEvents = data.events;
      }
      if (reqRes && reqRes.ok) {
        const data = await reqRes.json();
        if (data.requests && data.requests.length > 0) this.changeRequests = data.requests;
      }
      if (notifRes && notifRes.ok) {
        const data = await notifRes.json();
        if (data.notifications && data.notifications.length > 0) this.notifications = data.notifications;
      }
      if (docsRes && docsRes.ok) {
        const data = await docsRes.json();
        if (data.documents && data.documents.length > 0) {
          this.reports = data.documents.map((d: any) => ({
            ...d,
            processingStatus: "Confirmed" as const,
          }));
        }
      }
      if (consentRes && consentRes.ok) {
        const data = await consentRes.json();
        if (data.records && data.records.length > 0) this.consentRecords = data.records;
      }
      this.notify();
    } catch {
      // fallback to initial
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

  public updatePatient(patch: Partial<Patient>): Patient {
    this.patient = { ...this.patient, ...patch };
    this.notify();
    if (typeof window !== "undefined") {
      fetch("/api/patient", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, email: this.patient.email }),
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
    // Also inject into timeline if confirmed
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

  public approveAccessRequest(id: string): boolean {
    const req = this.accessRequests.find((r) => r.id === id);
    if (!req) return false;

    req.status = "approved";

    // Add to active consent records
    const newConsent: ConsentRecord = {
      id: `consent-${Date.now()}`,
      patientId: this.patient.id,
      granteeId: `user-${Date.now()}`,
      granteeName: req.requesterName,
      granteeRole: "doctor",
      granteeEmail: "doctor@metrohealth.demo",
      organization: req.requesterOrg,
      grantedPermissions: req.requestedCategories.map(
        (c) => c.toLowerCase().replace(/ /g, "_") as ConsentScope
      ),
      deniedPermissions: [],
      restrictedPermissions: [],
      status: "active",
      validFrom: new Date().toISOString(),
      validUntil: new Date(
        Date.now() + req.durationDays * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastUpdated: new Date().toISOString(),
      notes: `Access approved for ${req.reason}`,
    };

    this.consentRecords = [newConsent, ...this.consentRecords];

    // Push notification
    this.notifications = [
      {
        id: `notif-${Date.now()}`,
        category: "consent",
        title: `Access granted to ${req.requesterName}`,
        message: `Health information access granted for 30 days. You can change or cancel this anytime.`,
        timestamp: new Date().toISOString(),
        timeDisplay: "Just now",
        severity: "info",
        isRead: false,
        actionLabel: "Manage Access",
        actionUrl: "/patient/consent",
      },
      ...this.notifications,
    ];

    this.notify();
    return true;
  }

  public denyAccessRequest(id: string): boolean {
    const req = this.accessRequests.find((r) => r.id === id);
    if (!req) return false;
    req.status = "denied";

    this.notifications = [
      {
        id: `notif-${Date.now()}`,
        category: "consent",
        title: `Access request from ${req.requesterName} declined`,
        message: `Your health records remain private and were not shared.`,
        timestamp: new Date().toISOString(),
        timeDisplay: "Just now",
        severity: "info",
        isRead: false,
      },
      ...this.notifications,
    ];

    this.notify();
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
