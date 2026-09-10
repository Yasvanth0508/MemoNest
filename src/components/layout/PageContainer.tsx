import * as React from "react";
import clsx from "clsx";
import styles from "./PageContainer.module.css";

export interface PageContainerProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  noPadding?: boolean;
  as?: React.ElementType;
  children?: React.ReactNode;
}

export function PageContainer({
  size = "lg",
  noPadding = false,
  as: Component = "main",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={clsx(
        styles.container,
        styles[`size_${size}`],
        noPadding && styles.noPadding,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
