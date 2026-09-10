"use client";

import * as React from "react";
import { History } from "lucide-react";
import styles from "./AuditTrailBadge.module.css";

export interface AuditTrailBadgeProps {
  accessorName?: string;
  accessTime?: string;
}

export function AuditTrailBadge({
  accessorName = "Dr. Rajesh Sharma",
  accessTime = "Today, 10:42 AM",
}: AuditTrailBadgeProps) {
  return (
    <div className={styles.badge} title="Record access transparency log">
      <History size={16} className={styles.icon} aria-hidden="true" />
      <span>
        Last accessed by <span className={styles.strong}>{accessorName}</span> — {accessTime}
      </span>
    </div>
  );
}
