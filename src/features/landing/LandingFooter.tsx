"use client";

import * as React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import styles from "./LandingFooter.module.css";

export function LandingFooter() {
  return (
    <footer className={styles.footer} aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only" style={{ display: "none" }}>
        Footer Navigation
      </h2>
      <div className={styles.container}>
        <div className={styles.oneLineFooter}>
          <div className={styles.brandRow}>
            <Link href="/" className={styles.brand} aria-label="MemoNest">
              <div className={styles.logoMark}>
                <Activity size={16} strokeWidth={2.4} />
              </div>
              <span className={styles.brandTitle}>MemoNest</span>
            </Link>
            <span className={styles.copyright}>© 2026 MemoNest</span>
          </div>

          <div className={styles.linksRow}>
            <Link href="/login" className={styles.footerLink}>Clinician</Link>
            <Link href="/login" className={styles.footerLink}>Caregiver</Link>
            <Link href="/login" className={styles.footerLink}>Patient</Link>
            <Link href="/login" className={styles.footerLink}>Sign In</Link>
            <Link href="/signup" className={styles.footerLink}>Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
