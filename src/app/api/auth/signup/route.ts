import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { signToken, hashPassword } from '@/lib/auth/jwt';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role = 'patient',
      patientEmail,
      title,
      organization,
      relationship,
      phone,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'A valid full name (at least 2 characters) is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const userRole = (['patient', 'caregiver', 'doctor'].includes(role) ? role : 'patient') as UserRole;
    const passwordHash = await hashPassword(password);

    const defaultTitle =
      title ||
      (userRole === 'doctor'
        ? 'Attending Physician'
        : userRole === 'caregiver'
        ? 'Family Caregiver'
        : 'Patient');

    const defaultOrg =
      organization ||
      (userRole === 'doctor'
        ? 'MetroHealth Medical Network'
        : userRole === 'caregiver'
        ? 'Home Care'
        : undefined);

    const defaultRel =
      relationship || (userRole === 'caregiver' ? 'Primary Caregiver' : undefined);

    // Create User in database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: userRole,
        title: defaultTitle,
        organization: defaultOrg,
        relationship: defaultRel,
        phone: phone || undefined,
      },
    });

    // If registering as a patient, ensure a corresponding baseline Patient record exists
    let targetPatientId = 'patient-001';
    let resolvedPatientEmail = patientEmail || 'ravi@healthmemory.demo';

    if (userRole === 'patient') {
      resolvedPatientEmail = cleanEmail;
      const existingPatient = await prisma.patient.findFirst({
        where: { email: cleanEmail },
      });

      if (!existingPatient) {
        const newPatient = await prisma.patient.create({
          data: {
            name: newUser.name,
            email: cleanEmail,
            age: 70,
            gender: 'Prefer not to say',
            dateOfBirth: '1956-01-01',
            primaryDoctor: 'Dr. Rajesh Sharma, MD',
            bloodType: 'B+',
            mobilityStatus: 'Independent',
            emergencyContactName: 'Family Representative',
            emergencyContactRel: 'Emergency Contact',
            emergencyContactPhone: '+1-555-0100',
          },
        });
        targetPatientId = newPatient.id;

        // Create default condition & consent
        await prisma.condition.create({
          data: {
            patientId: newPatient.id,
            name: 'General Wellness / Preventative Care',
            status: 'active',
            diagnosedYear: new Date().getFullYear(),
            notes: 'Initialized upon patient account creation',
          },
        });

        await prisma.consentRecord.create({
          data: {
            patientId: newPatient.id,
            granteeId: 'user-clinician-001',
            granteeName: 'Dr. Rajesh Sharma, MD',
            granteeRole: 'doctor',
            organization: 'MetroHealth Medical Network',
            grantedPermissions: JSON.stringify(['medications', 'timeline', 'clinical_summary']),
            deniedPermissions: JSON.stringify([]),
            restrictedPermissions: JSON.stringify(['genetics']),
            status: 'active',
            validFrom: new Date().toISOString(),
            validUntil: '2099-12-31T23:59:59Z',
            notes: 'Primary doctor care circle access',
          },
        });
      } else {
        targetPatientId = existingPatient.id;
      }
    } else {
      const patientRecord = await prisma.patient.findFirst({
        where: { email: resolvedPatientEmail },
      });
      if (patientRecord) {
        targetPatientId = patientRecord.id;
      }
    }

    // Sign JWT token
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as UserRole,
      name: newUser.name,
    });

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as UserRole,
      title: newUser.title || undefined,
      relationship: newUser.relationship || undefined,
      organization: newUser.organization || undefined,
      phone: newUser.phone || undefined,
      createdAt: newUser.createdAt.toISOString(),
    };

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Log registration audit entry
    try {
      await prisma.auditEntry.create({
        data: {
          patientId: targetPatientId,
          timestamp: new Date().toISOString(),
          userId: newUser.id,
          userName: newUser.name,
          userRole: newUser.role,
          eventType: 'create',
          action: `User Account Registered (${newUser.role})`,
          resource: 'User Registry',
          details: `Registered new ${newUser.role} account for ${newUser.email}`,
          purposeOfUse: 'User Provisioning',
          status: 'success',
        },
      });
    } catch (auditErr) {
      console.warn('Could not record registration audit entry:', auditErr);
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user account. Please try again.' },
      { status: 500 }
    );
  }
}
