"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { patientPortalStore } from "@/services/patient-portal.service";
import styles from "./ConsentBanner.module.css";

export function ConsentBanner() {
  const [consentRecords, setConsentRecords] = React.useState(() =>
    patientPortalStore.getConsentRecords()
  );

  React.useEffect(() => {
    const unsubscribe = patientPortalStore.subscribe(() => {
      setConsentRecords([...patientPortalStore.getConsentRecords()]);
    });
    return unsubscribe;
  }, []);

  const doctorsCount = consentRecords.filter(
    (c) => c.granteeRole === "doctor" && c.status === "active"
  ).length;
  const caregiversCount = consentRecords.filter(
    (c) => c.granteeRole === "caregiver" && c.status === "active"
  ).length;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.content}>
        <ShieldCheck size={24} className={styles.shieldIcon} aria-hidden="true" />
        <span>
          Your health information is currently shared with{" "}
          <strong>{caregiversCount} caregiver{caregiversCount === 1 ? "" : "s"}</strong> and{" "}
          <strong>{doctorsCount} doctor{doctorsCount === 1 ? "" : "s"}</strong>.
        </span>
      </div>
      <Link href="/patient/consent" className={styles.actionLink}>
        <span>View Sharing</span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
