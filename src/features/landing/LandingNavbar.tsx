"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./LandingNavbar.module.css";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Brand */}
        <Link href="/" className={styles.brand} aria-label="KinSphere Home">
          <div className={styles.logoMark}>
            <Activity size={20} strokeWidth={2.4} />
          </div>
          <span className={styles.brandTitle}>KinSphere</span>
        </Link>

        {/* Public Desktop Nav Links */}
        <nav className={styles.navLinks} aria-label="Public Navigation">
          <a href="#transformation" className={styles.navLink}>
            Pipeline
          </a>
          <a href="#capabilities" className={styles.navLink}>
            Capabilities
          </a>
          <a href="#roles" className={styles.navLink}>
            Workspaces
          </a>
          <a href="#trust" className={styles.navLink}>
            Governance
          </a>
        </nav>

        {/* Right CTA buttons */}
        <div className={styles.rightActions}>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/signup">
              Register
              <ArrowRight size={14} />
            </Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={styles.mobileMenuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNavLinks}>
            <a
              href="#transformation"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Pipeline
            </a>
            <a
              href="#capabilities"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Capabilities
            </a>
            <a
              href="#roles"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Workspaces
            </a>
            <a
              href="#trust"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Governance
            </a>
          </nav>
          <div className={styles.mobileDrawerActions}>
            <Button asChild variant="outline" size="md" style={{ width: "100%" }}>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="primary" size="md" style={{ width: "100%" }}>
              <Link href="/signup">Register</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
