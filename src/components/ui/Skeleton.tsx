import * as React from "react";
import clsx from "clsx";
import styles from "./Skeleton.module.css";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(styles.skeleton, className)}
      {...props}
    />
  );
}

export { Skeleton };
