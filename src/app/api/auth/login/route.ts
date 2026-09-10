import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { signToken, comparePassword } from '@/lib/auth/jwt';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, patientEmail } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check role if specified
    if (role && user.role !== role) {
      const displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      return NextResponse.json(
        { error: `This account is registered as a ${displayRole}. Please select "${displayRole}" to sign in.` },
        { status: 403 }
      );
    }

    // Determine target patient context
    let targetPatientId = 'patient-001';
    let resolvedPatientEmail = patientEmail || 'ravi@healthmemory.demo';

    if (user.role === 'patient') {
      const patientRecord = await prisma.patient.findFirst({
        where: { email: cleanEmail },
      });
      if (patientRecord) {
        targetPatientId = patientRecord.id;
        resolvedPatientEmail = patientRecord.email;
      }
    } else {
      const patientRecord = await prisma.patient.findFirst({
        where: { email: resolvedPatientEmail },
      });
      if (patientRecord) {
        targetPatientId = patientRecord.id;
      }
    }

    // Create session token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      title: user.title || undefined,
      relationship: user.relationship || undefined,
      organization: user.organization || undefined,
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
      createdAt: user.createdAt.toISOString(),
    };

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Log successful login audit entry
    try {
      await prisma.auditEntry.create({
        data: {
          patientId: targetPatientId,
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          eventType: 'access',
          action: `User Logged In (${user.role})`,
          resource: 'Authentication Service',
          details: `Successful authenticated login for ${user.email}`,
          purposeOfUse: 'Identity Verification & Role-Based Access',
          status: 'success',
        },
      });
    } catch (auditErr) {
      console.warn('Could not record login audit entry:', auditErr);
    }

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      token,
      expiresAt,
      activePatientEmail: resolvedPatientEmail,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('memonest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
