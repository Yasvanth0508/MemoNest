"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Clock,
  FileText,
  Home,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";
import clsx from "clsx";
import styles from "./PatientBottomNav.module.css";
import { patientPortalStore } from "@/services/patient-portal.service";

const BOTTOM_NAV_ITEMS = [
  { label: "Home", href: "/patient", icon: Home },
  { label: "Profile", href: "/patient/profile", icon: User },
  { label: "Upload", href: "/patient/upload", icon: UploadCloud },
  { label: "Reports", href: "/patient/reports", icon: FileText },
  { label: "Timeline", href: "/patient/timeline", icon: Clock },
  { label: "Consent", href: "/patient/consent", icon: ShieldCheck },
  { label: "Alerts", href: "/patient/notifications", icon: Bell, hasBadge: true },
];

export function PatientBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
    setUnreadCount(patientPortalStore.getUnreadNotificationsCount());
    const unsub = patientPortalStore.subscribe(() => {
      setUnreadCount(patientPortalStore.getUnreadNotificationsCount());
    });
    return unsub;
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/patient" && pathname === "/patient") return true;
    if (href !== "/patient" && pathname?.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className={styles.bottomNav} aria-label="Mobile Bottom Navigation">
      <ul className={styles.navList}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isLinkActive(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(styles.navItem, active && styles.navItemActive)}
                aria-current={active ? "page" : undefined}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={20} />
                </div>
                <span>{item.label}</span>
                {item.hasBadge && mounted && unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
