"use client";

import * as React from "react";
import {
  LandingNavbar,
  HeroSection,
  TransformationSection,
  CapabilitiesSection,
  RoleViewsSection,
  TrustSection,
  LandingFooter,
} from "@/features/landing";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <div className={styles.landingPage}>
      {/* Public Landing Navbar */}
      <LandingNavbar />

      {/* Main Landing Sections */}
      <main className={styles.main}>
        <HeroSection />
        <TransformationSection />
        <CapabilitiesSection />
        <RoleViewsSection />
        <TrustSection />
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
