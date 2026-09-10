"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole, AuthSession } from "@/types";
import { useAuth } from "./useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  HeartHandshake,
  Stethoscope,
  Loader2,
  LogIn,
  X,
  Check,
  UserCheck,
} from "lucide-react";
import clsx from "clsx";
import styles from "./LoginForm.module.css";

export const ROLE_WORKSPACES: Record<UserRole, string> = {
  patient: "/patient",
  caregiver: "/caregiver",
  doctor: "/clinician",
};

export interface RoleOptionItem {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const ROLE_OPTIONS: RoleOptionItem[] = [
  {
    role: "doctor",
    label: "Doctor",
    badge: "Clinical",
    description: "Briefs, risk signals & timeline",
    icon: Stethoscope,
  },
  {
    role: "patient",
    label: "Patient",
    badge: "Personal",
    description: "Health summary & timeline",
    icon: UserIcon,
  },
  {
    role: "caregiver",
    label: "Caregiver",
    badge: "Care",
    description: "Daily notes & observations",
    icon: HeartHandshake,
  },
];

export interface LoginFormProps {
  initialEmail?: string;
  initialRole?: UserRole;
  onSuccess?: (session: AuthSession) => void;
  className?: string;
}

export function LoginForm({
  initialEmail = "",
  initialRole = "doctor",
  onSuccess,
  className,
}: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = React.useState(initialEmail);
  const [patientEmail, setPatientEmail] = React.useState("ravi@healthmemory.demo");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = React.useState(false);

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [patientEmailError, setPatientEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // If role is patient, patient email is automatically their own email
  React.useEffect(() => {
    if (role === "patient" && email) {
      setPatientEmail(email);
    }
  }, [role, email]);

  const validate = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPatientEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Your email address is required.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    const trimmedPatientEmail = patientEmail.trim();
    if (!trimmedPatientEmail) {
      setPatientEmailError("Patient email address is required to locate the health record.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedPatientEmail)) {
      setPatientEmailError("Please enter a valid patient email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError("Password must be at least 4 characters long.");
      isValid = false;
    }

    if (!role) {
      setGeneralError("Please select a user role to proceed.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const session = await login(email.trim(), role, patientEmail.trim());
      if (onSuccess) {
        onSuccess(session);
      }
      const targetWorkspace = ROLE_WORKSPACES[role] || "/patient";
      router.push(targetWorkspace);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Authentication failed. Please verify credentials and role.";
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isAuthLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(styles.form, className)}
      noValidate
      aria-label="Account Login Form"
    >
      {/* General Error Alert Banner */}
      {generalError && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={18} className={styles.errorIcon} />
          <div className={styles.errorContent}>
            <span className={styles.errorTitle}>Authentication Error</span>
            <span className={styles.errorMessage}>{generalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeneralError(null)}
            className={styles.errorClose}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Role Selection Grid */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Select Role</label>
        </div>
        <div
          className={styles.roleGrid}
          role="radiogroup"
          aria-label="Select Role"
        >
          {ROLE_OPTIONS.map((item) => {
            const isSelected = role === item.role;
            const Icon = item.icon;
            return (
              <button
                key={item.role}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isBusy}
                onClick={() => {
                  setRole(item.role);
                  setGeneralError(null);
                  if (item.role === "patient" && email) {
                    setPatientEmail(email);
                  }
                }}
                className={clsx(
                  styles.roleOption,
                  isSelected && styles.roleOptionActive
                )}
              >
                <div className={styles.roleOptionHeader}>
                  <div className={styles.roleIconWrapper}>
                    <Icon size={16} />
                  </div>
                  {isSelected ? (
                    <Badge variant="default">
                      <Check size={10} style={{ marginRight: 2 }} /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">{item.badge}</Badge>
                  )}
                </div>
                <span className={styles.roleLabel}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Email Input */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="login-email" className={styles.label}>
            <Mail size={15} className={styles.labelIcon} />
            Email
          </label>
        </div>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="e.g. dr.sharma@hospital.demo"
          value={email}
          disabled={isBusy}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          className={clsx(emailError && styles.inputError)}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        {emailError && (
          <span id="email-error" className={styles.fieldError}>
            {emailError}
          </span>
        )}
      </div>

      {/* Patient Email Input Field */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="patient-email" className={styles.label}>
            <UserCheck size={15} className={styles.labelIcon} />
            Patient Email
          </label>
        </div>
        <Input
          id="patient-email"
          type="email"
          placeholder="e.g. ravi@healthmemory.demo"
          value={patientEmail}
          disabled={isBusy || (role === "patient" && !!email)}
          onChange={(e) => {
            setPatientEmail(e.target.value);
            if (patientEmailError) setPatientEmailError(null);
          }}
          className={clsx(patientEmailError && styles.inputError)}
          aria-invalid={!!patientEmailError}
          aria-describedby={patientEmailError ? "patient-email-error" : undefined}
        />
        {patientEmailError && (
          <span id="patient-email-error" className={styles.fieldError}>
            {patientEmailError}
          </span>
        )}
      </div>

      {/* Password Input */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="login-password" className={styles.label}>
            <Lock size={15} className={styles.labelIcon} />
            Passphrase
          </label>
        </div>
        <div className={styles.passwordWrapper}>
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Security passphrase"
            value={password}
            disabled={isBusy}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            className={clsx(
              styles.passwordInput,
              passwordError && styles.inputError
            )}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isBusy}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordError && (
          <span id="password-error" className={styles.fieldError}>
            {passwordError}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isBusy}
        className={styles.submitBtn}
      >
        {isBusy ? (
          <>
            <Loader2 size={18} className={styles.spin} />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Sign In</span>
          </>
        )}
      </Button>

      {/* Sign Up Link */}
      <div style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
        Need an account?{" "}
        <Link href="/signup" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Register
        </Link>
      </div>
    </form>
  );
}
