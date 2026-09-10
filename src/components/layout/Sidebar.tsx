"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  HeartHandshake,
  Home as HomeIcon,
  LayoutDashboard,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UploadCloud,
  User as UserIcon,
  Users,
} from "lucide-react";
import clsx from "clsx";
import styles from "./Sidebar.module.css";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "danger" | "warning" | "success";
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  activeRole?: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentPath?: string;
  customSections?: SidebarSection[];
  className?: string;
}

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ size?: number }>> = {
  doctor: Stethoscope,
  caregiver: HeartHandshake,
  patient: UserIcon,
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  doctor: "Clinical Workspace",
  caregiver: "Caregiver Portal",
  patient: "Personal Memory",
};

export function getRoleSidebarSections(role: UserRole): SidebarSection[] {
  switch (role) {
    case "doctor":
      return [
        {
          title: "Doctor Workspace",
          items: [
            { label: "Doctor Home", href: "/clinician", icon: HomeIcon },
            { label: "Patient Overview", href: "/clinician/overview", icon: UserIcon },
            { label: "Key Changes", href: "/clinician/changes", icon: AlertTriangle, badge: "New", badgeVariant: "danger" },
            { label: "Patient State (Twin)", href: "/clinician/state", icon: TrendingUp, badge: "Deviation", badgeVariant: "warning" },
          ],
        },
        {
          title: "Clinical Actions",
          items: [
            { label: "Health Timeline", href: "/clinician/timeline", icon: Clock },
            { label: "Upload Documents", href: "/clinician/upload", icon: UploadCloud },
            { label: "AI Clinical Assistant", href: "/clinician/assistant", icon: Sparkles, badge: "AI" },
            { label: "Prescription / Notes", href: "/clinician/prescribe", icon: Pill },
            { label: "Access Log / Audit", href: "/clinician/audit", icon: ShieldCheck },
          ],
        },
      ];

    case "caregiver":
      return [
        {
          title: "Caregiver Hub",
          items: [
            { label: "Dashboard", href: "/caregiver", icon: LayoutDashboard },
            { label: "Patient Details & Risks", href: "/caregiver/patient", icon: Users },
            { label: "Log Observation", href: "/caregiver/report", icon: HeartHandshake, badge: "Voice", badgeVariant: "warning" },
            { label: "Health Timeline", href: "/caregiver/timeline", icon: Clock },
            { label: "Patient State (Twin)", href: "/caregiver/state", icon: TrendingUp },
          ],
        },
        {
          title: "Care Access",
          items: [
            { label: "Caregiver Sign In", href: "/caregiver/login", icon: ShieldCheck },
          ],
        },
      ];

    case "patient":
    default:
      return [
        {
          title: "Health Navigation",
          items: [
            { label: "Home", href: "/patient", icon: HomeIcon },
            { label: "My Profile", href: "/patient/profile", icon: UserIcon },
            { label: "Upload Records", href: "/patient/upload", icon: UploadCloud },
            { label: "Reports", href: "/patient/reports", icon: FileText },
            { label: "Health Timeline", href: "/patient/timeline", icon: Clock },
            { label: "Consent & Sharing", href: "/patient/consent", icon: ShieldCheck },
            {
              label: "Notifications",
              href: "/patient/notifications",
              icon: Bell,
              badge: "3",
              badgeVariant: "warning",
            },
          ],
        },
      ];
  }
}

export function Sidebar({
  activeRole = "doctor",
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  currentPath,
  customSections,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const current = currentPath || pathname || "/";

  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : uncontrolledCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setUncontrolledCollapsed((prev) => !prev);
    }
  };

  const sections = customSections || getRoleSidebarSections(activeRole);
  const RoleIcon = ROLE_ICONS[activeRole] || Stethoscope;
  const roleTitle = activeRole;
  const roleSubtitle = ROLE_DESCRIPTIONS[activeRole] || "Health Workspace";

  const isLinkActive = (href: string) => {
    if (href === "/" && current === "/") return true;
    if (href !== "/" && current.startsWith(href)) return true;
    return false;
  };

  return (
    <aside
      className={clsx(
        styles.sidebar,
        isCollapsed && styles.sidebarCollapsed,
        className
      )}
      aria-label={`${activeRole} sidebar navigation`}
    >
      {/* Header with Role Badge and Collapse Toggle */}
      <div className={styles.header}>
        {!isCollapsed ? (
          <div className={styles.roleContext}>
            <div className={styles.roleIconBadge}>
              <RoleIcon size={18} />
            </div>
            <div className={styles.roleTextGroup}>
              <span className={styles.roleTitle}>{roleTitle}</span>
              <span className={styles.roleSubtitle}>{roleSubtitle}</span>
            </div>
          </div>
        ) : (
          <div className={styles.roleIconBadge} title={`${roleTitle}: ${roleSubtitle}`}>
            <RoleIcon size={18} />
          </div>
        )}

        <button
          type="button"
          className={styles.collapseButton}
          onClick={handleToggle}
          aria-label={isCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Sections Body */}
      <div className={styles.navBody}>
        {sections.map((section, sIdx) => (
          <div key={`${section.title}-${sIdx}`} className={styles.section}>
            {!isCollapsed ? (
              <div className={styles.sectionHeader}>{section.title}</div>
            ) : (
              <div className={styles.sectionHeaderCollapsed} aria-hidden="true" />
            )}

            {section.items.map((item) => {
              const active = isLinkActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    styles.navItem,
                    isCollapsed && styles.navItemCollapsed,
                    active && styles.navItemActive
                  )}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={18} className={styles.navIcon} />

                  {!isCollapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge && (
                        <span
                          className={clsx(
                            styles.itemBadge,
                            item.badgeVariant && styles[`itemBadge_${item.badgeVariant}`]
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
