"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { User, UserRole } from "@/types";
import {
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Pill,
  Stethoscope,
  User as UserIcon,
  X,
} from "lucide-react";
import clsx from "clsx";
import styles from "./MobileNav.module.css";
import { Button } from "@/components/ui/Button";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  user?: Partial<User>;
  onSignOut?: () => void;
}

interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavLinkItem[] = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Health Memory", href: "/patient/memory", icon: Activity },
  { label: "Timeline", href: "/patient/timeline", icon: Clock },
  { label: "Medications", href: "/patient/medications", icon: Pill },
  { label: "Risks", href: "/patient/risks", icon: AlertTriangle },
];

const ROLES: Array<{ role: UserRole; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { role: "patient", label: "Patient", icon: UserIcon },
  { role: "caregiver", label: "Caregiver", icon: HeartHandshake },
  { role: "doctor", label: "Doctor", icon: Stethoscope },
];

export function MobileNav({
  isOpen,
  onClose,
  activeRole = "doctor",
  onRoleChange,
  user = {
    name: "Dr. Priya Sharma",
    role: "doctor",
  },
  onSignOut,
}: MobileNavProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname?.startsWith(href)) return true;
    return false;
  };

  const initials = React.useMemo(() => {
    if (!user.name) return "U";
    const parts = user.name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }, [user.name]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content className={styles.content}>
          {/* Accessible Dialog Title & Description for Screen Readers */}
          <DialogPrimitive.Title className={styles.srOnly}>
            Navigation Menu
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className={styles.srOnly}>
            Access pages, switch roles, and manage your account
          </DialogPrimitive.Description>

          {/* Header with Brand & Close Button */}
          <div className={styles.header}>
            <Link href="/" className={styles.brand} onClick={onClose}>
              <div className={styles.logoMark}>
                <Activity size={18} strokeWidth={2.4} />
              </div>
              <span className={styles.brandTitle}>MemoNest</span>
            </Link>

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className={styles.body}>
            {/* Active Role Switcher */}
            <div>
              <p className={styles.sectionTitle}>Active View Role</p>
              <div className={styles.roleSelectorGrid}>
                {ROLES.map(({ role, label, icon: Icon }) => {
                  const isActive = activeRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      className={clsx(styles.roleChip, isActive && styles.roleChipActive)}
                      onClick={() => {
                        if (onRoleChange) {
                          onRoleChange(role);
                        }
                      }}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <p className={styles.sectionTitle}>Navigation</p>
              <nav className={styles.navList} aria-label="Mobile Navigation Links">
                {NAV_ITEMS.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(styles.navItem, active && styles.navItemActive)}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon size={18} className={styles.navIcon} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className={styles.footer}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>{initials}</div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user.name || "Dr. Priya Sharma"}</p>
                <p className={styles.userRoleText}>{activeRole} View</p>
              </div>
            </div>

            {onSignOut && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
