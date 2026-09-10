import { AuthSession, UserRole } from '@/types';
import { SignUpData } from '../mock/auth.service';

export const authApiService = {
  async login(
    email: string,
    password?: string,
    role?: UserRole,
    patientEmail?: string
  ): Promise<AuthSession> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password || 'demo1234', role, patientEmail }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Failed to sign in');
    }

    const data: AuthSession = await res.json();
    return data;
  },

  async signup(data: SignUpData): Promise<AuthSession> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Failed to register account');
    }

    const session: AuthSession = await res.json();
    return session;
  },

  async getCurrentSession(): Promise<AuthSession | null> {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
    });

    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json?.user) return null;

    return {
      user: json.user,
      token: 'valid-session',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  },
};

export const { login, signup, getCurrentSession, logout } = authApiService;
