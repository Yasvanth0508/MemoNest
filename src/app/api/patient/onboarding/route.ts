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
      age,
      dateOfBirth,
      gender,
      bloodType,
      address,
      phone,
      preferredLanguage,
      primaryDoctor,
      emergencyContactName,
      emergencyContactRel,
      emergencyContactPhone,
      emergencyContactEmail,
      conditions,
      allergies,
      medications,
      mobilityStatus,
      fallHistory6Months,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password || 'demo1234');

    // Create user and patient memory in a single atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role: 'patient',
          title: 'Patient',
          phone: phone || undefined,
        },
      });

      // 2. Create Patient Record
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          name: name.trim(),
          age: Number(age) || 70,
          dateOfBirth: dateOfBirth || '1955-01-01',
          gender: gender || 'Other',
          primaryDoctor: primaryDoctor || 'Assigned Care Physician',
          bloodType: bloodType || 'O+',
          address: address || '',
          phone: phone || '',
          email: cleanEmail,
          preferredLanguage: preferredLanguage || 'English',
          mobilityStatus: mobilityStatus || 'Independent',
          emergencyContactName: emergencyContactName || 'Family Contact',
          emergencyContactRel: emergencyContactRel || 'Next of Kin',
          emergencyContactPhone: emergencyContactPhone || '555-0100',
          emergencyContactEmail: emergencyContactEmail || null,
        },
      });

      // 3. Create Conditions
      if (Array.isArray(conditions) && conditions.length > 0) {
        for (const condName of conditions) {
          if (condName && typeof condName === 'string') {
            await tx.condition.create({
              data: {
                patientId: patient.id,
                name: condName.trim(),
                status: 'active',
                diagnosedYear: new Date().getFullYear(),
                notes: 'Self-reported during initial onboarding.',
              },
            });
          }
        }
      }

      // 4. Create Allergies
      if (Array.isArray(allergies) && allergies.length > 0) {
        for (const a of allergies) {
          if (a?.allergen) {
            await tx.allergy.create({
              data: {
                patientId: patient.id,
                allergen: a.allergen.trim(),
                reaction: a.reaction || 'Allergic reaction',
                severity: a.severity || 'moderate',
                diagnosedDate: new Date().toISOString().split('T')[0],
              },
            });
          }
        }
      }

      // 5. Create Medications
      if (Array.isArray(medications) && medications.length > 0) {
        for (const m of medications) {
          if (m?.name) {
            await tx.medication.create({
              data: {
                patientId: patient.id,
                name: m.name.trim(),
                dosage: m.dosage || 'Standard dose',
                frequency: m.frequency || 'Once daily',
                indication: m.indication || 'Maintenance therapy',
                status: 'active',
                startDate: new Date().toISOString().split('T')[0],
                prescriber: primaryDoctor || 'Primary Physician',
              },
            });
          }
        }
      }

      // 6. Initial Baseline Timeline Event
      await tx.timelineEvent.create({
        data: {
          patientId: patient.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          type: 'routine_visit',
          category: 'medical',
          title: 'Initial Health Memory Profile Established',
          description: `Patient ${name} completed initial digital onboarding. Baseline established with ${conditions?.length || 0} active conditions, ${allergies?.length || 0} allergies, and mobility status: "${mobilityStatus || 'Independent'}".`,
          severity: 'low',
          sourceType: 'clinical_note',
          author: name,
          authorRole: 'Patient / Guardian Self-Declaration',
        },
      });

      // 7. Initial Emergency Consent Record
      await tx.consentRecord.create({
        data: {
          patientId: patient.id,
          granteeId: 'emergency-services',
          granteeName: 'Emergency First Responders & Hospital ER',
          granteeRole: 'doctor',
          organization: 'Emergency Care Services',
          grantedPermissions: JSON.stringify(['emergency_access', 'medications']),
          deniedPermissions: JSON.stringify([]),
          restrictedPermissions: JSON.stringify(['genetics']),
          status: 'active',
          validFrom: new Date().toISOString(),
          notes: 'Standard SOS and Break-Glass Emergency Care Access granted during registration.',
        },
      });

      // 8. Create Semantic Chunk for the new patient's profile
      await tx.recordChunk.create({
        data: {
          patientId: patient.id,
          sourceType: 'profile',
          sourceId: patient.id,
          title: `${name} — Baseline Health Profile`,
          date: new Date().toISOString().split('T')[0],
          category: 'demographics',
          content: `Patient Profile: ${name}, Age: ${age || 70}, Gender: ${gender || 'Other'}, Blood Type: ${bloodType || 'O+'}. Mobility: ${mobilityStatus || 'Independent'}. Known conditions: ${(conditions || []).join(', ')}. Known allergies: ${(allergies || []).map((a: any) => a.allergen).join(', ')}. Emergency contact: ${emergencyContactName} (${emergencyContactRel}) - ${emergencyContactPhone}.`,
        },
      });

      // 9. Initial Welcome Notification
      await tx.patientNotification.create({
        data: {
          patientId: patient.id,
          category: 'health_record',
          title: 'Welcome to MemoNest',
          message: 'Your persistent longitudinal health memory has been established. You can view your timeline, manage consent, and upload medical documents.',
          timestamp: new Date().toISOString(),
          severity: 'gentle',
          isRead: false,
          actionLabel: 'View Profile',
          actionUrl: '/patient/profile',
          source: 'System Onboarding',
        },
      });

      return { user, patient };
    });

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as UserRole,
      name: result.user.name,
    });

    const sessionUser = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role as UserRole,
      title: result.user.title || undefined,
      phone: result.user.phone || undefined,
      createdAt: result.user.createdAt.toISOString(),
    };

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const response = NextResponse.json({
      user: sessionUser,
      token,
      expiresAt,
      activePatientEmail: result.user.email,
      patientId: result.patient.id,
      message: 'Onboarding complete! Health profile initialized.',
    });

    response.cookies.set('memonest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Patient onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete patient onboarding.' },
      { status: 500 }
    );
  }
}
