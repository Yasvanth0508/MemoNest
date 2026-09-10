"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  Bell,
  Clock,
  FileText,
  Home,
  ShieldCheck,
  UploadCloud,
  User,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import styles from "./PatientPortalShell.module.css";
import { ConsentBanner } from "./ConsentBanner";
import { AuditTrailBadge } from "./AuditTrailBadge";
import { DigitalTwinBadge } from "./DigitalTwinBadge";
import { EmergencySosModal } from "./EmergencySosModal";
import { VoiceAssistantBar } from "./VoiceAssistantBar";
import { PatientBottomNav } from "./PatientBottomNav";
import { patientPortalStore } from "@/services/patient-portal.service";

export interface PatientPortalShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSpeechSummary?: string;
  showConsentBanner?: boolean;
  showVoiceBar?: boolean;
}

export function PatientPortalShell({
  children,
  pageTitle,
  pageSpeechSummary,
  showConsentBanner = true,
  showVoiceBar = true,
}: PatientPortalShellProps) {
  const pathname = usePathname();
  const [patient, setPatient] = React.useState(() => patientPortalStore.getPatient());
  const [unreadCount, setUnreadCount] = React.useState(() =>
    patientPortalStore.getUnreadNotificationsCount()
  );
  const [isEmergencyOpen, setIsEmergencyOpen] = React.useState(false);

  React.useEffect(() => {
    const unsub = patientPortalStore.subscribe(() => {
      setPatient({ ...patientPortalStore.getPatient() });
      setUnreadCount(patientPortalStore.getUnreadNotificationsCount());
    });
    return unsub;
  }, []);

  const navItems = [
    { label: "Home", href: "/patient", icon: Home },
    { label: "My Profile", href: "/patient/profile", icon: User },
    { label: "Upload Records", href: "/patient/upload", icon: UploadCloud },
    { label: "Reports", href: "/patient/reports", icon: FileText },
    { label: "Health Timeline", href: "/patient/timeline", icon: Clock },
    { label: "Consent & Sharing", href: "/patient/consent", icon: ShieldCheck },
    {
      label: "Notifications",
      href: "/patient/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/patient" && pathname === "/patient") return true;
    if (href !== "/patient" && pathname?.startsWith(href)) return true;
    return false;
  };

  const initials = React.useMemo(() => {
    const parts = (patient.name || "Ravi Kumar").split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : "RK";
  }, [patient.name]);

  return (
    <div className={styles.shell}>
      {/* Persistent Desktop Sidebar */}
      <aside className={styles.sidebar} aria-label="Patient Portal Navigation">
        <div className={styles.sidebarHeader}>
          <Link href="/patient" className={styles.brandLink}>
            <div className={styles.brandLogo} aria-hidden="true">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span className={styles.brandName}>MemoNest</span>
              <span className={styles.portalBadge}>Health Memory</span>
            </div>
          </Link>
        </div>

        {/* Active Patient Identity Card */}
        <div className={styles.patientCardSidebar}>
          <div className={styles.avatarCircle} aria-hidden="true">
            {initials}
          </div>
          <div className={styles.patientCardInfo}>
            <p className={styles.patientCardName}>{patient.name}</p>
            <p className={styles.patientCardMeta}>
              Age {patient.age} • Record #{patient.id}
            </p>
          </div>
        </div>

        {/* Exactly 7 Primary Sections */}
        <nav className={styles.navSection} aria-label="Primary Navigation">
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(styles.navItem, active && styles.navItemActive)}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={22} className={styles.navIcon} aria-hidden="true" />
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge && (
                      <span className={styles.navBadge} aria-label={`${item.badge} unread`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer with Highly Visible SOS Button */}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.emergencyButton}
            onClick={() => setIsEmergencyOpen(true)}
            aria-label="Emergency SOS — Immediate medical contacts and allergy card"
          >
            <AlertOctagon size={22} />
            <span>Emergency SOS</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Layout */}
      <div className={styles.mainContainer}>
        {/* Top App Bar with Context Transparency */}
        <header className={styles.topAppBar} role="banner">
          <div className={styles.topBarLeft}>
            <div className={styles.activePatientTag}>
              <User size={16} />
              <span>Active Record: <strong>{patient.name}</strong></span>
            </div>

            <div className={styles.protectedTag} title="Protected health data">
              <Lock size={14} />
              <span>Protected Health Shield</span>
            </div>

            <DigitalTwinBadge state="stable" />
            <AuditTrailBadge accessorName="Dr. Rajesh Sharma" accessTime="Today, 10:42 AM" />
          </div>

          <div className={styles.topBarRight}>
            <button
              type="button"
              className={styles.sosHeaderButton}
              onClick={() => setIsEmergencyOpen(true)}
              aria-label="Open Emergency Card"
            >
              <AlertOctagon size={18} />
              <span>SOS</span>
            </button>

            <Link
              href="/patient/notifications"
              className={styles.notifTrigger}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell size={22} />
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageBody} id="main-content">
          {/* Shared Consent Banner */}
          {showConsentBanner && <ConsentBanner />}

          {/* Voice Assistant Bar */}
          {showVoiceBar && (
            <VoiceAssistantBar
              pageSpeechSummary={pageSpeechSummary}
              onEmergencyTrigger={() => setIsEmergencyOpen(true)}
            />
          )}

          {children}
        </main>
      </div>

      {/* Accessible Mobile/Tablet Bottom Navigation */}
      <PatientBottomNav />

      {/* Always-Available Emergency SOS Modal */}
      <EmergencySosModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
