import * as React from "react";
import clsx from "clsx";
import styles from "./Badge.module.css";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={clsx(styles.badge, styles[variant], className)} {...props} />
  );
}

export { Badge };
