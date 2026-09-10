"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { DoctorShell } from "@/features/doctor-portal";

const CURRENT_DOCTOR = {
  name: "Dr. Rajesh Sharma",
  role: "doctor" as const,
  title: "MD, Geriatric Medicine",
  email: "dr.sharma@hospital.demo",
};

export default function DoctorUploadPage() {
  return (
    <AppShell
      activeRole="doctor"
      user={CURRENT_DOCTOR}
      showPatientHeader={false}
      showBreadcrumbs={false}
      showSidebar={false}
      containerSize="full"
    >
      <DoctorShell initialTab="upload" />
    </AppShell>
  );
}
