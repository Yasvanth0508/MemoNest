"use client";

import * as React from "react";
import Link from "next/link";
import { SignupForm } from "@/features/authentication";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  ShieldCheck,
  FileCheck2,
  Lock,
  HeartPulse,
  Activity,
} from "lucide-react";
import styles from "../login/login.module.css";

export default function SignupPage() {
  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.topNav}>
          <Link href="/" className={styles.backLink} aria-label="Back to home">
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Link
              href="/login"
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
            <Badge variant="outline" className={styles.systemBadge}>
              <Activity size={12} />
              <span>Secure</span>
            </Badge>
          </div>
        </div>

        <div className={styles.brandSection}>
          <div className={styles.logoIconWrapper} aria-hidden="true">
            <HeartPulse size={28} />
          </div>
          <h1 className={styles.title}>MemoNest</h1>
          <p className={styles.subtitle}>Register</p>
        </div>
      </header>

      {/* Main Centered Signup Card */}
      <main className={styles.mainCardWrapper}>
        <Card className={styles.loginCard}>
          <CardContent className={styles.cardContent}>
            <SignupForm />
          </CardContent>
        </Card>
      </main>

      {/* Security Badges */}
      <footer className={styles.trustSection} aria-label="Security and compliance badges">
        <div className={styles.trustGrid}>
          {/* Badge 1: HIPAA */}
          <div className={styles.trustBadgeCard}>
            <div className={styles.trustBadgeHeader}>
              <div className={styles.trustIconWrapper}>
                <ShieldCheck size={16} />
              </div>
              <span className={styles.trustBadgeTitle}>HIPAA Compliant</span>
            </div>
          </div>

          {/* Badge 2: Auditability */}
          <div className={styles.trustBadgeCard}>
            <div className={styles.trustBadgeHeader}>
              <div className={styles.trustIconWrapper}>
                <FileCheck2 size={16} />
              </div>
              <span className={styles.trustBadgeTitle}>Audited</span>
            </div>
          </div>

          {/* Badge 3: Consent */}
          <div className={styles.trustBadgeCard}>
            <div className={styles.trustBadgeHeader}>
              <div className={styles.trustIconWrapper}>
                <Lock size={16} />
              </div>
              <span className={styles.trustBadgeTitle}>Consent Governed</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
