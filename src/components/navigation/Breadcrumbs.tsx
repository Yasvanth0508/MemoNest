"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import clsx from "clsx";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  memory: "Health Memory",
  "health-memory": "Health Memory",
  timeline: "Timeline",
  medications: "Medications",
  risks: "Risks & Insights",
  consent: "Consent Center",
  audit: "Audit Log",
  caregiver: "Caregiver",
  clinician: "Clinician",
  pharmacist: "Pharmacist",
  evidence: "Evidence",
  brief: "AI Clinical Brief",
  observations: "Observations",
  trends: "Patient Trends",
  safety: "Safety Signals",
  history: "History",
  patient: "Patient",
};

export function Breadcrumbs({
  items,
  separator = <ChevronRight size={14} className={styles.separator} aria-hidden="true" />,
  showHome = true,
  className,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // If no items are explicitly provided, derive them from the current pathname
  const breadcrumbItems = React.useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    if (!pathname || pathname === "/") {
      return [{ label: "Dashboard", href: "/" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    const generated: BreadcrumbItem[] = [];

    let currentHref = "";
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentHref += `/${segment}`;
      const isLast = i === segments.length - 1;

      const formattedLabel =
        ROUTE_LABELS[segment.toLowerCase()] ||
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      generated.push({
        label: formattedLabel,
        href: isLast ? undefined : currentHref,
      });
    }

    return generated;
  }, [items, pathname]);

  return (
    <nav aria-label="Breadcrumb" className={clsx(styles.nav, className)}>
      <ol className={styles.list}>
        {showHome && (
          <li className={styles.item}>
            <Link href="/" className={styles.link} aria-label="Home">
              <Home size={14} className={styles.icon} />
            </Link>
            {breadcrumbItems.length > 0 && separator}
          </li>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {isLast || !item.href ? (
                <span className={styles.current} aria-current="page">
                  {Icon && <Icon size={14} className={styles.icon} />}
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {Icon && <Icon size={14} className={styles.icon} />}
                  {item.label}
                </Link>
              )}

              {!isLast && separator}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
