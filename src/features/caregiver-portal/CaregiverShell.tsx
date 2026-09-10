"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CaregiverProvider, useCaregiver } from "./caregiver-store";
import { CaregiverTopBar } from "./CaregiverTopBar";
import { ObservationDrawer } from "./ObservationDrawer";
import { PatientStateModal } from "./PatientStateModal";
import { ObservationRoutingModal } from "./ObservationRoutingModal";
import { EmergencySosModal } from "@/components/patient/EmergencySosModal";
import {
  LayoutDashboard,
  UserCheck,
  Clock,
  Activity,
  Mic,
  Home,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import styles from "./CaregiverShell.module.css";

export interface CaregiverShellProps {
  children: React.ReactNode;
}

function CaregiverShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isEmergencyModalOpen,
    closeEmergencyModal,
    openObservationDrawer,
  } = useCaregiver();

  const navTabs = [
    {
      label: "Overview",
      href: "/caregiver",
      icon: LayoutDashboard,
      isActive: pathname === "/caregiver",
    },
    {
      label: "Patient Details & Risks",
      href: "/caregiver/patient",
      icon: UserCheck,
      isActive: pathname === "/caregiver/patient",
    },
    {
      label: "Health Timeline",
      href: "/caregiver/timeline",
      icon: Clock,
      isActive: pathname === "/caregiver/timeline" || pathname === "/caregiver/observations",
    },
    {
      label: "Patient State (Digital Twin)",
      href: "/caregiver/state",
      icon: Activity,
      isActive: pathname === "/caregiver/state" || pathname === "/caregiver/trends",
    },
  ];

  return (
    <div className={styles.portalLayout}>
      <main className={styles.mainContainer}>
        {/* Top Bar with Patient Switcher, Profile, Emergency SOS, Consent & Audit Trail */}
        <CaregiverTopBar />

        {/* Tab Navigation Row */}
        <nav className={styles.navTabsRow} aria-label="Caregiver Portal Sections">
          <div className={styles.tabsList} role="tablist">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={clsx(styles.tabLink, tab.isActive && styles.tabLinkActive)}
                  role="tab"
                  aria-selected={tab.isActive}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.logObservationActionBtn}
            onClick={() => openObservationDrawer()}
            aria-label="Log an Observation (Voice or Text)"
          >
            <Mic size={16} />
            <span>Log Observation</span>
          </button>
        </nav>

        {/* Injected View Content */}
        {children}
      </main>

      {/* Shared Modals */}
      <EmergencySosModal isOpen={isEmergencyModalOpen} onClose={closeEmergencyModal} />
      <PatientStateModal />
      <ObservationDrawer />
      <ObservationRoutingModal />
    </div>
  );
}

export function CaregiverShell({ children }: CaregiverShellProps) {
  return (
    <CaregiverProvider>
      <CaregiverShellContent>{children}</CaregiverShellContent>
    </CaregiverProvider>
  );
}
