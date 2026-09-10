"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { TrendCharts } from "@/features/caregiver-observations";
import { patientService } from "@/services";
import { Patient, User } from "@/types";
import { Toaster } from "@/components/ui/Toaster";

const CURRENT_CAREGIVER: Partial<User> = {
  id: "user-caregiver-001",
  name: "Anita Desai",
  email: "anita@caregiver.demo",
  role: "caregiver",
  title: "Certified Nursing Assistant / Home Caregiver",
};

export default function CaregiverTrendsPage() {
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
        { label: "Trends" },
      ]}
      onReportObservation={() => router.push("/caregiver/report")}
      onViewEvidence={() => router.push("/evidence")}
      containerSize="lg"
    >
      <Toaster position="top-right" />
      <TrendCharts patientName={patient?.name || "Ravi Kumar"} />
    </AppShell>
  );
}
