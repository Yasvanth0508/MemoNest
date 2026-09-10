import { AuthSession, User, UserRole } from '@/types';
import { mockCurrentUser, mockUsers } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const createDefaultSession = (): AuthSession => ({
  user: mockCurrentUser,
  token: `mock-jwt-${mockCurrentUser.id}-${Date.now()}`,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

let currentSession: AuthSession | null = createDefaultSession();

export interface SignUpData {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  patientEmail?: string;
}

export const authService = {
  async login(
    email: string,
    password?: string,
    role?: UserRole,
    patientEmail?: string
  ): Promise<AuthSession> {
    const targetRole: UserRole = role || 'patient';

    // Look for matching user by role and/or email
    let user = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === targetRole
    );

    if (!user) {
      user = mockUsers.find((u) => u.role === targetRole);
    }

    if (!user) {
      user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    const resolvedUser: User = user || {
      id: `user-${targetRole}-${Date.now()}`,
      name: email.split('@')[0] || 'Demo User',
      email,
      role: targetRole,
    };

    const resolvedPatientEmail =
      patientEmail?.trim() ||
      (targetRole === 'patient' ? email.trim() : 'ravi@healthmemory.demo');

    currentSession = {
      user: resolvedUser,
      token: `mock-jwt-token-${resolvedUser.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('active_patient_email', resolvedPatientEmail);
      } catch {
        // ignore storage errors
      }
    }

    return JSON.parse(JSON.stringify(currentSession));
  },

  async signup(data: SignUpData): Promise<AuthSession> {
    await simulateDelay();

    const newUser: User = {
      id: `user-${data.role}-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    const resolvedPatientEmail =
      data.patientEmail?.trim() ||
      (data.role === 'patient' ? data.email.trim() : 'ravi@healthmemory.demo');

    currentSession = {
      user: newUser,
      token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('active_patient_email', resolvedPatientEmail);
      } catch {
        // ignore
      }
    }

    return JSON.parse(JSON.stringify(currentSession));
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    await simulateDelay();
    if (!currentSession) return null;
    return JSON.parse(JSON.stringify(currentSession));
  },

  async logout(): Promise<void> {
    await simulateDelay();
    currentSession = null;
  },
};

export const { login, signup, getCurrentSession, logout } = authService;
