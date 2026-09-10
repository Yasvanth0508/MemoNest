"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { ObservationForm } from "@/features/caregiver-observations";
import { patientService } from "@/services";
import { Patient, User } from "@/types";
import { Toaster } from "@/components/ui/Toaster";
import { Loader2 } from "lucide-react";

const CURRENT_CAREGIVER: Partial<User> = {
  id: "user-caregiver-001",
  name: "Anita Desai",
  email: "anita@caregiver.demo",
  role: "caregiver",
  title: "Certified Nursing Assistant / Home Caregiver",
};

export default function CaregiverReportPage() {
  const router = useRouter();
  const [patient, setPatient] = React.useState<Patient | undefined>(undefined);

  React.useEffect(() => {
    let isMounted = true;
    async function loadPatient() {
      try {
        const data = await patientService.getPatient("patient-001");
        if (isMounted) {
          setPatient(data);
        }
      } catch (err) {
        console.error("Failed to load patient:", err);
      }
    }
    loadPatient();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppShell
      activeRole="caregiver"
      user={CURRENT_CAREGIVER}
      patient={patient}
      showPatientHeader={true}
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: "Caregiver", href: "/caregiver" },
        { label: "Report Observation" },
      ]}
      onReportObservation={() => router.push("/caregiver/report")}
      onViewEvidence={() => router.push("/evidence")}
      containerSize="lg"
    >
      <Toaster position="top-right" />
      <React.Suspense
        fallback={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px",
              gap: "12px",
              color: "var(--color-text-secondary)",
            }}
          >
            <Loader2 className="animate-spin" size={20} />
            <span>Loading observation form...</span>
          </div>
        }
      >
        <ObservationForm
          patientId={patient?.id || "patient-001"}
          caregiverId={CURRENT_CAREGIVER.id || "user-caregiver-001"}
          caregiverName={CURRENT_CAREGIVER.name || "Anita Desai"}
          onSuccess={() => router.push("/caregiver")}
        />
      </React.Suspense>
    </AppShell>
  );
}
