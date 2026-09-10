"use client";

import * as React from "react";
import { User, UserRole, Patient } from "@/types";
import { Navbar } from "@/components/navigation/Navbar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Breadcrumbs, BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { Sidebar, SidebarSection } from "./Sidebar";
import { PageContainer } from "./PageContainer";
import clsx from "clsx";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: React.ReactNode;
  activeRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  user?: Partial<User>;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  customSidebarSections?: SidebarSection[];
  showPatientHeader?: boolean;
  patient?: Partial<Patient>;
  showBreadcrumbs?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  unreadNotificationsCount?: number;
  onNotificationClick?: () => void;
  onViewEvidence?: () => void;
  onReportObservation?: () => void;
  onSignOut?: () => void;
  className?: string;
}

export function AppShell({
  children,
  activeRole: controlledRole,
  onRoleChange,
  user,
  showSidebar = true,
  sidebarCollapsed: controlledSidebarCollapsed,
  onToggleSidebar,
  customSidebarSections,
  showPatientHeader = true,
  patient,
  showBreadcrumbs = true,
  breadcrumbs,
  containerSize = "lg",
  unreadNotificationsCount = 2,
  onNotificationClick,
  onViewEvidence,
  onReportObservation,
  onSignOut,
  className,
}: AppShellProps) {
  // Role State (controlled or uncontrolled fallback)
  const [uncontrolledRole, setUncontrolledRole] = React.useState<UserRole>("doctor");
  const activeRole = controlledRole !== undefined ? controlledRole : uncontrolledRole;

  const handleRoleChange = (role: UserRole) => {
    if (onRoleChange) {
      onRoleChange(role);
    } else {
      setUncontrolledRole(role);
    }
  };

  // Mobile Navigation Drawer State
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  // Sidebar Collapse State
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(false);
  const isSidebarCollapsed =
    controlledSidebarCollapsed !== undefined
      ? controlledSidebarCollapsed
      : uncontrolledCollapsed;

  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      setUncontrolledCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={clsx(styles.shell, className)}>
      {/* Top Desktop & Tablet Navigation Bar */}
      <Navbar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        user={user}
        unreadNotificationsCount={unreadNotificationsCount}
        onNotificationClick={onNotificationClick}
        onMobileMenuToggle={() => setIsMobileNavOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        user={user}
        onSignOut={onSignOut}
      />

      {/* Main Workspace Layout */}
      <div className={styles.body}>
        {/* Optional Collapsible Sidebar */}
        {showSidebar && (
          <div className={styles.sidebarWrapper}>
            <Sidebar
              activeRole={activeRole}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
              customSections={customSidebarSections}
            />
          </div>
        )}

        {/* Primary Page Content Wrapper */}
        <div className={styles.mainWrapper}>
          <PageContainer size={containerSize} className={styles.contentWrapper}>
            {/* Context Header: Breadcrumbs & Patient Context */}
            {(showBreadcrumbs || showPatientHeader) && (
              <div className={styles.topSection}>
                {showBreadcrumbs && <Breadcrumbs items={breadcrumbs} />}

                {showPatientHeader && (
                  <PatientHeader
                    patient={patient}
                    onViewEvidence={onViewEvidence}
                    onReportObservation={onReportObservation}
                  />
                )}
              </div>
            )}

            {/* Injected Page Content */}
            {children}
          </PageContainer>
        </div>
      </div>
    </div>
  );
}
