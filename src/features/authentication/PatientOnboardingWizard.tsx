"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Heart,
  Shield,
  Pill,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Activity,
  Phone,
  UserCheck,
  Building2,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "./useAuth";
import styles from "./PatientOnboardingWizard.module.css";

interface PatientOnboardingWizardProps {
  initialName?: string;
  initialEmail?: string;
  initialPassword?: string;
  onCancel: () => void;
}

const COMMON_CONDITIONS = [
  "Essential Hypertension",
  "Type 2 Diabetes Mellitus",
  "Ischemic Stroke (History)",
  "Mild Cognitive Impairment (MCI)",
  "Osteoarthritis",
  "Coronary Artery Disease",
  "Chronic Kidney Disease",
  "Atrial Fibrillation",
];

const COMMON_ALLERGIES = [
  "Penicillin",
  "Sulfa Antibiotics",
  "Aspirin / NSAIDs",
  "Codeine",
  "Latex",
  "None",
];

export function PatientOnboardingWizard({
  initialName = "",
  initialEmail = "",
  initialPassword = "",
  onCancel,
}: PatientOnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Step 1: Demographics
  const [name, setName] = React.useState(initialName);
  const [email, setEmail] = React.useState(initialEmail);
  const [password, setPassword] = React.useState(initialPassword);
  const [age, setAge] = React.useState("74");
  const [dateOfBirth, setDateOfBirth] = React.useState("1952-04-12");
  const [gender, setGender] = React.useState<string>("Male");
  const [bloodType, setBloodType] = React.useState<string>("B+");
  const [phone, setPhone] = React.useState("+1-555-0142");
  const [address, setAddress] = React.useState("742 Evergreen Terrace, Springfield, IL");

  // Step 2: Emergency Contact & Proxy
  const [emergencyName, setEmergencyName] = React.useState("Meera Kumar");
  const [emergencyRel, setEmergencyRel] = React.useState("Daughter / Healthcare Proxy");
  const [emergencyPhone, setEmergencyPhone] = React.useState("+1-555-0199");
  const [emergencyEmail, setEmergencyEmail] = React.useState("meera.kumar@demo.email");

  // Step 3: Medical Baseline
  const [selectedConditions, setSelectedConditions] = React.useState<string[]>([
    "Essential Hypertension",
    "Type 2 Diabetes Mellitus",
  ]);
  const [customCondition, setCustomCondition] = React.useState("");
  const [selectedAllergies, setSelectedAllergies] = React.useState<string[]>(["Penicillin"]);
  const [customAllergy, setCustomAllergy] = React.useState("");

  // Step 4: Daily Medications & Mobility
  const [primaryDoctor, setPrimaryDoctor] = React.useState("Dr. Rajesh Sharma, MD");
  const [medicationInput, setMedicationInput] = React.useState("Amlodipine 5mg morning, Metformin 500mg BID");
  const [mobilityStatus, setMobilityStatus] = React.useState<string>(
    "Four-wheel walker required; bed-to-chair transfer assistance recommended"
  );
  const [fallHistory, setFallHistory] = React.useState<string>("1-2 falls");

  // Step 5: Consent
  const [sosConsent, setSosConsent] = React.useState<boolean>(true);
  const [caregiverConsent, setCaregiverConsent] = React.useState<boolean>(true);

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions((prev) => [...prev, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === "None") {
      setSelectedAllergies(["None"]);
      return;
    }
    setSelectedAllergies((prev) => {
      const filtered = prev.filter((a) => a !== "None");
      return filtered.includes(allergy)
        ? filtered.filter((a) => a !== allergy)
        : [...filtered, allergy];
    });
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies((prev) => [...prev.filter((a) => a !== "None"), customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!name.trim() || !email.trim() || !password) {
        setErrorMessage("Please fill in your name, email, and password.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!emergencyName.trim() || !emergencyPhone.trim()) {
        setErrorMessage("Please provide at least a primary emergency contact name and phone number.");
        return;
      }
    }
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    // Parse simple medications text into structured entries
    const parsedMeds = medicationInput
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => ({
        name: m,
        dosage: "As directed",
        frequency: "Daily",
        indication: "Maintenance therapy",
      }));

    const allergyEntries = selectedAllergies
      .filter((a) => a !== "None")
      .map((allergen) => ({
        allergen,
        reaction: "Known sensitivity",
        severity: "moderate" as const,
      }));

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      age: parseInt(age, 10) || 70,
      dateOfBirth,
      gender,
      bloodType,
      address,
      phone,
      primaryDoctor,
      emergencyContactName: emergencyName,
      emergencyContactRel: emergencyRel,
      emergencyContactPhone: emergencyPhone,
      emergencyContactEmail: emergencyEmail,
      conditions: selectedConditions,
      allergies: allergyEntries,
      medications: parsedMeds,
      mobilityStatus,
      fallHistory6Months: fallHistory === "None" ? 0 : fallHistory === "1-2 falls" ? 2 : 3,
    };

    try {
      const res = await fetch("/api/patient/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Onboarding failed" }));
        throw new Error(errorData.error || "Failed to initialize health memory.");
      }

      const data = await res.json();

      // Update global auth store with new active session
      useAuthStore.setState({
        user: data.user,
        role: "patient",
        activePatientEmail: data.activePatientEmail,
        isAuthenticated: true,
        isLoading: false,
      });

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("health_memory_auth_session", JSON.stringify(data));
          window.localStorage.setItem("active_patient_email", data.activePatientEmail);
        } catch {
          // ignore
        }
      }

      // Smooth redirect to patient dashboard
      router.push("/patient");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong during onboarding.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wizardContainer}>
      {/* Wizard Header */}
      <div className={styles.wizardHeader}>
        <div className={styles.stepProgress}>
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`${styles.stepIndicator} ${
                step === currentStep
                  ? styles.activeStep
                  : step < currentStep
                  ? styles.completedStep
                  : ""
              }`}
            >
              <span>{step < currentStep ? "✓" : step}</span>
            </div>
          ))}
        </div>
        <h2 className={styles.wizardTitle}>
          {currentStep === 1 && "Personal Information & Identification"}
          {currentStep === 2 && "Emergency Contact & Legal Proxy"}
          {currentStep === 3 && "Baseline Conditions & Known Allergies"}
          {currentStep === 4 && "Daily Medications & Mobility Baseline"}
          {currentStep === 5 && "Review & Consent Authorization"}
        </h2>
        <p className={styles.wizardSubtitle}>
          Step {currentStep} of 5: Establishing your secure longitudinal health memory
        </p>
      </div>

      {errorMessage && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Contents */}
      <div className={styles.stepBody}>
        {/* Step 1: Personal Demographics */}
        {currentStep === 1 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Full Legal Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ravi Kumar"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email Address *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravi@healthmemory.demo"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password *</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Age</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Gender</label>
                <select
                  className={styles.selectInput}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Blood Type</label>
                <select
                  className={styles.selectInput}
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0142"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Residential Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State, ZIP"
              />
            </div>
          </div>
        )}

        {/* Step 2: Emergency Contact & Proxy */}
        {currentStep === 2 && (
          <div className={styles.formGrid}>
            <div className={styles.infoCallout}>
              <Shield size={20} color="#2A8B88" />
              <div>
                <strong>Why we need this:</strong> In the event of a medical emergency or fall,
                first responders and caregivers need one-touch access to your authorized proxy.
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Emergency Contact / Proxy Name *</label>
              <Input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g., Meera Kumar"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Relationship to Patient *</label>
              <Input
                value={emergencyRel}
                onChange={(e) => setEmergencyRel(e.target.value)}
                placeholder="e.g., Daughter / Legal Healthcare Proxy"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Phone Number *</label>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1-555-0199"
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label>Email Address</label>
                <Input
                  type="email"
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  placeholder="proxy@email.demo"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Chronic Conditions & Allergies */}
        {currentStep === 3 && (
          <div className={styles.formGrid}>
            <label className={styles.sectionLabel}>
              Select any existing conditions you currently manage:
            </label>
            <div className={styles.chipGrid}>
              {COMMON_CONDITIONS.map((cond) => {
                const selected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`${styles.chipBtn} ${selected ? styles.chipSelected : ""}`}
                  >
                    {selected && <Check size={14} />}
                    <span>{cond}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.inlineAdd}>
              <Input
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="Other condition..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCondition();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomCondition}>
                Add
              </Button>
            </div>

            <label className={styles.sectionLabel} style={{ marginTop: 16 }}>
              Known Drug or Environmental Allergies:
            </label>
            <div className={styles.chipGrid}>
              {COMMON_ALLERGIES.map((allergy) => {
                const selected = selectedAllergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`${styles.chipBtn} ${selected ? styles.chipSelected : ""}`}
                  >
                    {selected && <Check size={14} />}
                    <span>{allergy}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.inlineAdd}>
              <Input
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                placeholder="Other allergy..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAllergy();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomAllergy}>
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Medications & Mobility */}
        {currentStep === 4 && (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Primary Physician or Clinic</label>
              <Input
                value={primaryDoctor}
                onChange={(e) => setPrimaryDoctor(e.target.value)}
                placeholder="Dr. Rajesh Sharma, MD"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Current Daily Medications (comma separated)</label>
              <Input
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                placeholder="e.g. Amlodipine 5mg morning, Metformin 500mg BID"
              />
              <span className={styles.helperText}>
                You can upload full prescriptions and scans later; this sets your initial baseline.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label>Current Mobility Status</label>
              <select
                className={styles.selectInput}
                value={mobilityStatus}
                onChange={(e) => setMobilityStatus(e.target.value)}
              >
                <option value="Independent — no assistive device">Independent — walks without aid</option>
                <option value="Walking stick / cane used for long distances">Walking stick or cane used</option>
                <option value="Four-wheel walker required; bed-to-chair transfer assistance recommended">
                  Four-wheel walker required (needs transfer supervision)
                </option>
                <option value="Wheelchair dependent for all mobility">Wheelchair dependent</option>
                <option value="Bedbound / complete assistance required">Bedbound / complete assistance</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Have you had any falls in the last 6 months?</label>
              <select
                className={styles.selectInput}
                value={fallHistory}
                onChange={(e) => setFallHistory(e.target.value)}
              >
                <option value="None">None (0 falls)</option>
                <option value="1-2 falls">1 to 2 falls</option>
                <option value="3+ falls">3 or more falls (Frequent fall risk)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Review & Consent */}
        {currentStep === 5 && (
          <div className={styles.reviewCard}>
            <div className={styles.reviewItem}>
              <strong>Patient:</strong> {name} ({gender}, {age} yrs, Blood Type: {bloodType})
            </div>
            <div className={styles.reviewItem}>
              <strong>Emergency Proxy:</strong> {emergencyName} ({emergencyRel}) — {emergencyPhone}
            </div>
            <div className={styles.reviewItem}>
              <strong>Conditions:</strong> {selectedConditions.join(", ") || "None declared"}
            </div>
            <div className={styles.reviewItem}>
              <strong>Allergies:</strong> {selectedAllergies.join(", ") || "None"}
            </div>
            <div className={styles.reviewItem}>
              <strong>Mobility Baseline:</strong> {mobilityStatus}
            </div>

            <div className={styles.consentOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={sosConsent}
                  onChange={(e) => setSosConsent(e.target.checked)}
                />
                <span>
                  <strong>Authorize Emergency / SOS Break-Glass:</strong> Allow verified first
                  responders and emergency room clinicians to access vital facts (allergies, active
                  medications, emergency contacts) in life-threatening scenarios.
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={caregiverConsent}
                  onChange={(e) => setCaregiverConsent(e.target.checked)}
                />
                <span>
                  <strong>Authorize Caregiver Observation Logging:</strong> Allow designated home
                  caregivers to submit daily observations, mobility notes, and fall incidents to your
                  health timeline.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation */}
      <div className={styles.wizardFooter}>
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
            className={styles.navBtn}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.navBtn}
          >
            Cancel
          </Button>
        )}

        {currentStep < 5 ? (
          <Button
            type="button"
            onClick={handleNext}
            className={styles.primaryNavBtn}
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className={styles.submitWizardBtn}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Initializing Health Memory...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Create Health Memory & Enter Dashboard</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
