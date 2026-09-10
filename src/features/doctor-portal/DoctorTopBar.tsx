"use client";

import * as React from "react";
import { useDoctorStore } from "./doctor-store";
import {
  Home,
  ChevronDown,
  Activity,
  AlertOctagon,
  Check,
  User,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import styles from "./DoctorTopBar.module.css";

export function DoctorTopBar() {
  const {
    activeTab,
    setActiveTab,
    patients,
    selectedPatient,
    selectPatient,
    digitalTwinState,
    openEmergencySos,
  } = useDoctorStore();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHome = activeTab === "home";

  return (
    <header className={styles.topBar}>
      <div className={styles.leftArea}>
        {/* Doctor Home Button */}
        <button
          type="button"
          className={clsx(styles.homeBtn, isHome && styles.homeBtnActive)}
          onClick={() => setActiveTab("home")}
          aria-label="Doctor Workspace Home"
        >
          <Home size={15} />
          <span>Doctor Home</span>
        </button>

        {/* Selected Patient Switcher */}
        <div ref={dropdownRef} className={styles.patientSwitcher}>
          <button
            type="button"
            className={styles.switcherTrigger}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            aria-label={`Current patient: ${selectedPatient.name}. Click to switch.`}
          >
            <div className={styles.patientAvatar}>
              {selectedPatient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div className={styles.patientMeta}>
              <div className={styles.patientNameRow}>
                <span className={styles.patientName}>{selectedPatient.name}</span>
                <ChevronDown size={14} color="#68717C" />
              </div>
              <span className={styles.patientSub}>
                Age {selectedPatient.age} • {selectedPatient.gender} • Blood {selectedPatient.bloodType || "B+"}
              </span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className={styles.switcherDropdown} role="listbox">
              {patients.map((p) => {
                const isSelected = p.id === selectedPatient.id;
                const isRavi = p.id === "patient-001";

                return (
                  <button
                    key={p.id}
                    type="button"
                    className={clsx(styles.dropdownItem, isSelected && styles.dropdownItemActive)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      selectPatient(p.id, isHome ? "overview" : activeTab);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className={styles.itemPatientInfo}>
                      <div className={styles.itemAvatar}>
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#122544" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#68717C" }}>
                          Age {p.age} • {p.activeConditions[0]}
                        </div>
                      </div>
                    </div>

                    {isRavi && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          background: "#FCE8E6",
                          color: "#C5221F",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Urgent
                      </span>
                    )}

                    {isSelected && <Check size={14} color="#4E8B72" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={styles.rightArea}>
        {/* Digital Twin Badge (Shared Component #3) */}
        <button
          type="button"
          className={clsx(
            styles.twinBadgeBtn,
            digitalTwinState === "significant_deviation" && styles.twinSignificant,
            digitalTwinState === "mild_deviation" && styles.twinMild,
            digitalTwinState === "stable" && styles.twinStable
          )}
          onClick={() => setActiveTab("state")}
          title="Click to view longitudinal Digital Twin trends"
          aria-label={`Digital Twin Status: ${digitalTwinState.replace("_", " ")}. Click to view trends.`}
        >
          <span className={styles.pulseDot} />
          <Activity size={14} />
          <span>
            {digitalTwinState === "significant_deviation"
              ? "Significant Deviation"
              : digitalTwinState === "mild_deviation"
              ? "Mild Deviation"
              : "State: Stable"}
          </span>
        </button>

        {/* Emergency SOS Button (Shared Component #4) */}
        <button
          type="button"
          className={styles.sosBtn}
          onClick={openEmergencySos}
          aria-label="Emergency SOS: Allergies, Critical Meds, DNR"
        >
          <AlertOctagon size={15} />
          <span>Emergency SOS</span>
        </button>

        {/* Doctor Identity */}
        <div className={styles.doctorProfile}>
          <div className={styles.docAvatar}>RS</div>
          <div className={styles.docText}>
            <span className={styles.docName}>Dr. Rajesh Sharma</span>
            <span className={styles.docTitle}>MD, Geriatrics</span>
          </div>
        </div>
      </div>
    </header>
  );
}
