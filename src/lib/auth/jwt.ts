import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { User, UserRole } from '@/types';
import { prisma } from '@/lib/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'kinsphere-super-secret-jwt-key-2026';
const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAuthUserFromRequest(req: NextRequest): Promise<User | null> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      token = req.cookies.get('kinsphere_session')?.value || req.cookies.get('memonest_session')?.value;
    }

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      title: dbUser.title || undefined,
      relationship: dbUser.relationship || undefined,
      organization: dbUser.organization || undefined,
      phone: dbUser.phone || undefined,
      avatarUrl: dbUser.avatarUrl || undefined,
      createdAt: dbUser.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Error in getAuthUserFromRequest:', error);
    return null;
  }
}
