"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartHandshake,
  LayoutDashboard,
  Pill,
  Sparkles,
  Stethoscope,
  TrendingUp,
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
          title: "Clinical Workspace",
          items: [
            { label: "AI Clinical Brief", href: "/clinician/brief", icon: Sparkles, badge: "AI" },
            { label: "Health Memory", href: "/patient/memory", icon: Activity },
            { label: "Patient Timeline", href: "/patient/timeline", icon: Clock },
          ],
        },
        {
          title: "Intelligence & Safety",
          items: [
            { label: "Medication Intelligence", href: "/patient/medications", icon: Pill, badge: "Review", badgeVariant: "warning" },
            { label: "Risk Intelligence", href: "/patient/risks", icon: AlertTriangle, badge: "High", badgeVariant: "danger" },
            { label: "Patient Roster", href: "/clinician", icon: Users },
          ],
        },
      ];

    case "caregiver":
      return [
        {
          title: "Caregiver Hub",
          items: [
            { label: "Caregiver Dashboard", href: "/caregiver", icon: LayoutDashboard },
            { label: "Daily Observations", href: "/caregiver/observations", icon: HeartHandshake, badge: "Log", badgeVariant: "warning" },
            { label: "Patient Trends", href: "/caregiver/trends", icon: TrendingUp },
          ],
        },
        {
          title: "Memory & Care",
          items: [
            { label: "Health Memory", href: "/patient/memory", icon: Activity },
            { label: "Medications", href: "/patient/medications", icon: Pill },
            { label: "Care Timeline", href: "/patient/timeline", icon: Clock },
          ],
        },
      ];

    case "patient":
    default:
      return [
        {
          title: "My Health",
          items: [
            { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
            { label: "Health Memory", href: "/patient/memory", icon: Activity },
            { label: "Timeline", href: "/patient/timeline", icon: Clock },
            { label: "Medications", href: "/patient/medications", icon: Pill },
            { label: "Risks", href: "/patient/risks", icon: AlertTriangle },
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
