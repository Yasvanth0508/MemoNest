"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@/types";
import { useAuth } from "./useAuth";
import { ROLE_OPTIONS, ROLE_WORKSPACES } from "./LoginForm";
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
  Loader2,
  UserPlus,
  X,
  Check,
  UserCheck,
} from "lucide-react";
import clsx from "clsx";
import styles from "./LoginForm.module.css";

export function SignupForm() {
  const router = useRouter();
  const { signup, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [patientEmail, setPatientEmail] = React.useState("ravi@healthmemory.demo");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("doctor");
  const [showPassword, setShowPassword] = React.useState(false);

  const [nameError, setNameError] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [patientEmailError, setPatientEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (role === "patient" && email) {
      setPatientEmail(email);
    }
  }, [role, email]);

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPatientEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    if (!name.trim()) {
      setNameError("Full name is required.");
      isValid = false;
    }

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
      setPatientEmailError("Patient email address is required.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedPatientEmail)) {
      setPatientEmailError("Please enter a valid patient email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
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
      await signup({
        name: name.trim(),
        email: email.trim(),
        role,
        password,
        patientEmail: patientEmail.trim(),
      });
      const targetWorkspace = ROLE_WORKSPACES[role] || "/patient";
      router.push(targetWorkspace);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please verify your details.";
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isAuthLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      noValidate
      aria-label="Create New Account Form"
    >
      {/* Error Alert */}
      {generalError && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={18} className={styles.errorIcon} />
          <div className={styles.errorContent}>
            <span className={styles.errorTitle}>Registration Error</span>
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
          <label className={styles.label}>Role</label>
        </div>
        <div className={styles.roleGrid} role="radiogroup">
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

      {/* Name Input */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="signup-name" className={styles.label}>
            <UserIcon size={15} className={styles.labelIcon} />
            Name
          </label>
        </div>
        <Input
          id="signup-name"
          type="text"
          placeholder="e.g. Dr. Jane Smith"
          value={name}
          disabled={isBusy}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
          }}
          className={clsx(nameError && styles.inputError)}
        />
        {nameError && <span className={styles.fieldError}>{nameError}</span>}
      </div>

      {/* User Email Input */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="signup-email" className={styles.label}>
            <Mail size={15} className={styles.labelIcon} />
            Email
          </label>
        </div>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="e.g. janesmith@hospital.org"
          value={email}
          disabled={isBusy}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          className={clsx(emailError && styles.inputError)}
        />
        {emailError && <span className={styles.fieldError}>{emailError}</span>}
      </div>

      {/* Target Patient Email Field */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="signup-patient-email" className={styles.label}>
            <UserCheck size={15} className={styles.labelIcon} />
            Patient Email
          </label>
        </div>
        <Input
          id="signup-patient-email"
          type="email"
          placeholder="e.g. ravi@healthmemory.demo"
          value={patientEmail}
          disabled={isBusy || (role === "patient" && !!email)}
          onChange={(e) => {
            setPatientEmail(e.target.value);
            if (patientEmailError) setPatientEmailError(null);
          }}
          className={clsx(patientEmailError && styles.inputError)}
        />
        {patientEmailError && (
          <span className={styles.fieldError}>{patientEmailError}</span>
        )}
      </div>

      {/* Password Input */}
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="signup-password" className={styles.label}>
            <Lock size={15} className={styles.labelIcon} />
            Passphrase
          </label>
        </div>
        <div className={styles.passwordWrapper}>
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Choose passphrase"
            value={password}
            disabled={isBusy}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            className={clsx(styles.passwordInput, passwordError && styles.inputError)}
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
          <span className={styles.fieldError}>{passwordError}</span>
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
            <span>Registering...</span>
          </>
        ) : (
          <>
            <UserPlus size={18} />
            <span>Register</span>
          </>
        )}
      </Button>

      {/* Sign In Link */}
      <div style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </form>
  );
}
