"use client";

import * as React from "react";
import Image from "next/image";
import {
  User,
  UserRole
} from "@/types";
import {
  ChevronDown,
  Check,
  LogOut,
  Settings,
  ShieldAlert,
  Stethoscope,
  HeartHandshake,
  User as UserIcon,
} from "lucide-react";
import clsx from "clsx";
import styles from "./ProfileMenu.module.css";

export interface ProfileMenuProps {
  user?: Partial<User>;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSignOut?: () => void;
  onOpenSettings?: () => void;
  onEmergencyOverride?: () => void;
  className?: string;
}

interface RoleOption {
  role: UserRole;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ROLES: RoleOption[] = [
  { role: "patient", label: "Patient", icon: UserIcon },
  { role: "caregiver", label: "Caregiver", icon: HeartHandshake },
  { role: "doctor", label: "Doctor", icon: Stethoscope },
];

export function ProfileMenu({
  user = {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@aimemory.org",
    title: "Attending Geriatrician",
    role: "doctor",
  },
  currentRole,
  onRoleChange,
  onSignOut,
  onOpenSettings,
  onEmergencyOverride,
  className,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const activeRole: UserRole = currentRole || user.role || "doctor";

  // Calculate user initials
  const initials = React.useMemo(() => {
    if (!user.name) return "U";
    const parts = user.name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }, [user.name]);

  // Handle outside click & escape key
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleRoleSelect = (role: UserRole) => {
    if (onRoleChange) {
      onRoleChange(role);
    }
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className={clsx(styles.container, className)}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`User profile for ${user.name || "User"}`}
      >
        <div className={styles.avatar}>
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || "User avatar"}
              width={36}
              height={36}
              className={styles.avatarImage}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className={styles.triggerDetails}>
          <span className={styles.triggerName}>{user.name || "Dr. Priya Sharma"}</span>
          <span className={styles.triggerRole}>{activeRole}</span>
        </div>

        <ChevronDown
          size={16}
          className={clsx(styles.chevron, isOpen && styles.chevronRotated)}
        />
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu" aria-label="User navigation">
          <div className={styles.menuHeader}>
            <div className={styles.headerAvatar}>
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name || "User avatar"}
                  width={44}
                  height={44}
                  className={styles.avatarImage}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className={styles.headerInfo}>
              <p className={styles.userName}>{user.name || "User Profile"}</p>
              <p className={styles.userEmail}>{user.email || user.title || "Health System Member"}</p>
            </div>
          </div>

          {/* Switch Role Section */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Switch Role View</p>
            <div className={styles.roleList} role="group" aria-label="Role views">
              {ROLES.map(({ role, label, icon: Icon }) => {
                const isActive = activeRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    className={clsx(styles.roleItem, isActive && styles.roleItemActive)}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <span className={styles.roleLabelGroup}>
                      <Icon size={16} className={styles.roleIcon} />
                      <span>{label}</span>
                    </span>
                    {isActive && <Check size={16} className={styles.checkIcon} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Quick Actions */}
          <div className={styles.section}>
            {onEmergencyOverride && (
              <button
                type="button"
                role="menuitem"
                className={clsx(styles.menuItem, styles.menuItemDanger)}
                onClick={() => {
                  setIsOpen(false);
                  onEmergencyOverride();
                }}
              >
                <ShieldAlert size={16} />
                <span>Emergency Override</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
              >
                <Settings size={16} />
                <span>Preferences</span>
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => {
                setIsOpen(false);
                if (onSignOut) onSignOut();
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
