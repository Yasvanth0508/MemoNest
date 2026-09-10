"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { ObservationList } from "@/features/caregiver-observations";
import { caregiverService, patientService } from "@/services";
import { CaregiverObservation, Patient, User } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toaster } from "@/components/ui/Toaster";
import { ClipboardEdit, HeartHandshake, ShieldAlert } from "lucide-react";

const CURRENT_CAREGIVER: Partial<User> = {
  id: "user-caregiver-001",
  name: "Anita Desai",
  email: "anita@caregiver.demo",
  role: "caregiver",
  title: "Certified Nursing Assistant / Home Caregiver",
};

export default function CaregiverObservationsPage() {
  const router = useRouter();
  const [patient, setPatient] = React.useState<Patient | undefined>(undefined);
  const [observations, setObservations] = React.useState<CaregiverObservation[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [patientData, obsData] = await Promise.all([
          patientService.getPatient("patient-001"),
          caregiverService.getObservations("patient-001"),
        ]);
        if (isMounted) {
          setPatient(patientData);
          setObservations(obsData);
        }
      } catch (err) {
        console.error("Failed to load caregiver data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
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
        { label: "Observations" },
      ]}
      onReportObservation={() => router.push("/caregiver/report")}
      onViewEvidence={() => router.push("/evidence")}
      containerSize="lg"
    >
      <Toaster position="top-right" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--color-surface)",
            padding: "var(--space-4) var(--space-5)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "var(--font-size-lg)",
                fontFamily: "var(--font-display)",
                color: "var(--color-primary)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <HeartHandshake size={20} style={{ color: "var(--color-secondary)" }} />
              Observations
            </h2>
          </div>

          <Button variant="primary" asChild size="sm">
            <Link href="/caregiver/report">
              <ClipboardEdit size={16} style={{ marginRight: 6 }} />
              Log Note
            </Link>
          </Button>
        </div>

        <ObservationList
          observations={observations}
          isLoading={isLoading}
          showFilters={true}
        />
      </div>
    </AppShell>
  );
}
