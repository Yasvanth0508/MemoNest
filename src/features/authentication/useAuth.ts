"use client";

import * as React from "react";
import { create } from "zustand";
import { User, UserRole, AuthSession } from "@/types";
import { authService } from "@/services";

export const AUTH_STORAGE_KEY = "health_memory_auth_session";
export const PATIENT_STORAGE_KEY = "active_patient_email";

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  activePatientEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole, patientEmail?: string) => Promise<AuthSession>;
  signup: (data: { name: string; email: string; role: UserRole; password?: string; patientEmail?: string }) => Promise<AuthSession>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setActivePatientEmail: (email: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  activePatientEmail: "ravi@healthmemory.demo",
  isAuthenticated: false,
  isLoading: true,

  setUser: (user: User | null) => {
    set({
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
    });
  },

  setActivePatientEmail: (email: string) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PATIENT_STORAGE_KEY, email);
      } catch {
        // ignore
      }
    }
    set({ activePatientEmail: email });
  },

  login: async (email: string, password?: string, role?: UserRole, patientEmail?: string): Promise<AuthSession> => {
    set({ isLoading: true });
    try {
      const targetRole = role || "patient";
      const resolvedPatient = patientEmail?.trim() || (targetRole === "patient" ? email.trim() : "ravi@healthmemory.demo");
      const session = await authService.login(email, password, targetRole, resolvedPatient);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          window.localStorage.setItem(PATIENT_STORAGE_KEY, resolvedPatient);
        } catch (storageError) {
          console.warn("Failed to persist session to localStorage:", storageError);
        }
      }
      set({
        user: session.user,
        role: session.user.role,
        activePatientEmail: resolvedPatient,
        isAuthenticated: true,
        isLoading: false,
      });
      return session;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (data): Promise<AuthSession> => {
    set({ isLoading: true });
    try {
      const resolvedPatient = data.patientEmail?.trim() || (data.role === "patient" ? data.email.trim() : "ravi@healthmemory.demo");
      const session = await authService.signup({ ...data, patientEmail: resolvedPatient });
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          window.localStorage.setItem(PATIENT_STORAGE_KEY, resolvedPatient);
        } catch (storageError) {
          console.warn("Failed to persist session to localStorage:", storageError);
        }
      }
      set({
        user: session.user,
        role: session.user.role,
        activePatientEmail: resolvedPatient,
        isAuthenticated: true,
        isLoading: false,
      });
      return session;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      await authService.logout();
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (storageError) {
          console.warn("Failed to remove session from localStorage:", storageError);
        }
      }
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

function hydrateSessionFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const savedPatient = window.localStorage.getItem(PATIENT_STORAGE_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      if (session?.user?.role) {
        useAuthStore.setState({
          user: session.user,
          role: session.user.role,
          activePatientEmail: savedPatient || "ravi@healthmemory.demo",
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    }
    if (savedPatient) {
      useAuthStore.setState({ activePatientEmail: savedPatient });
    }
  } catch (error) {
    console.warn("Error restoring auth session from localStorage:", error);
  }
  useAuthStore.setState({ isLoading: false });
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const activePatientEmail = useAuthStore((s) => s.activePatientEmail);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const logout = useAuthStore((s) => s.logout);
  const setActivePatientEmail = useAuthStore((s) => s.setActivePatientEmail);

  React.useEffect(() => {
    hydrateSessionFromStorage();
  }, []);

  return {
    user,
    role,
    activePatientEmail,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    setActivePatientEmail,
  };
}

export type AuthContextType = ReturnType<typeof useAuth>;
export const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return React.createElement(AuthContext.Provider, { value: auth }, children);
}

export function useAuthContext(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider. Use useAuth() directly for provider-less access."
    );
  }
  return context;
}
