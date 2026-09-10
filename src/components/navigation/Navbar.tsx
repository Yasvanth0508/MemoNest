"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, UserRole } from "@/types";
import {
  Activity,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { ProfileMenu } from "./ProfileMenu";
import styles from "./Navbar.module.css";

export interface NavItem {
  label: string;
  href: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/patient" },
  { label: "Health Memory", href: "/patient/memory" },
  { label: "Timeline", href: "/patient/timeline" },
  { label: "Medications", href: "/patient/medications" },
  { label: "Risks", href: "/patient/risks" },
];

export interface NavbarProps {
  activeRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  currentPath?: string;
  user?: Partial<User>;
  unreadNotificationsCount?: number;
  onNotificationClick?: () => void;
  onMobileMenuToggle?: () => void;
  className?: string;
}

export function Navbar({
  activeRole = "doctor",
  onRoleChange,
  currentPath,
  user,
  unreadNotificationsCount = 2,
  onNotificationClick,
  onMobileMenuToggle,
  className,
}: NavbarProps) {
  const pathname = usePathname();
  const current = currentPath || pathname || "/";

  const isLinkActive = (href: string) => {
    if (href === "/" && current === "/") return true;
    if (href !== "/" && current.startsWith(href)) return true;
    return false;
  };

  const effectiveUser = React.useMemo(() => {
    if (user && user.name) return user;
    if (activeRole === "patient") {
      return {
        name: "Ravi Sharma",
        email: "ravi@healthmemory.demo",
        role: "patient" as UserRole,
      };
    }
    if (activeRole === "caregiver") {
      return {
        name: "Anita Desai",
        email: "anita@healthmemory.demo",
        role: "caregiver" as UserRole,
      };
    }
    return {
      name: "Dr. Rajesh Sharma",
      email: "dr.sharma@hospital.demo",
      title: "MD, Geriatric Medicine",
      role: "doctor" as UserRole,
    };
  }, [user, activeRole]);

  return (
    <header className={clsx(styles.navbar, className)}>
      <div className={styles.inner}>
        {/* Left: Mobile Toggle & Brand & Nav Links */}
        <div className={styles.leftSection}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className={styles.brand} aria-label="MemoNest Home">
            <div className={styles.logoMark}>
              <Activity size={20} strokeWidth={2.4} />
            </div>
            <span className={styles.brandTitle}>MemoNest</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className={styles.navLinks} aria-label="Primary Navigation">
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(styles.navLink, active && styles.navLinkActive)}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Role Pill, Notifications, Profile Menu */}
        <div className={styles.rightSection}>
          {/* Active Role Indicator Pill */}
          <div className={styles.rolePillContainer}>
            <button
              type="button"
              className={styles.rolePill}
              onClick={() => {
                // Quick cycle or toggle if click callback is not present
                const roles: UserRole[] = ["patient", "caregiver", "doctor"];
                const nextIndex = (roles.indexOf(activeRole) + 1) % roles.length;
                if (onRoleChange) {
                  onRoleChange(roles[nextIndex]);
                }
              }}
              title="Click to switch role view"
              aria-label={`Current role: ${activeRole}. Click to cycle role.`}
            >
              <span
                className={clsx(
                  styles.roleDot,
                  styles[`roleDot_${activeRole}`] || styles.roleDot_clinician
                )}
              />
              <span className={styles.roleLabel}>{activeRole}</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Notifications Action Button */}
          <button
            type="button"
            className={styles.actionButton}
            onClick={onNotificationClick}
            aria-label={`Notifications${
              unreadNotificationsCount > 0 ? `, ${unreadNotificationsCount} unread` : ""
            }`}
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className={styles.actionBadge}>
                {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
              </span>
            )}
          </button>

          <div className={styles.divider} aria-hidden="true" />

          {/* Profile Menu Dropdown */}
          <ProfileMenu
            user={effectiveUser}
            currentRole={activeRole}
            onRoleChange={onRoleChange}
          />
        </div>
      </div>
    </header>
  );
}
