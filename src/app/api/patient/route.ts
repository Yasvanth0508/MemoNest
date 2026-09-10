import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUserFromRequest } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id') || searchParams.get('patientId');
    const emailParam = searchParams.get('email');

    let patient = null;

    if (idParam) {
      patient = await prisma.patient.findUnique({
        where: { id: idParam },
        include: {
          conditions: true,
          allergies: true,
          medications: {
            where: { status: 'active' },
          },
        },
      });
    }

    if (!patient) {
      let patientEmail = emailParam;

      if (!patientEmail) {
        const user = await getAuthUserFromRequest(req);
        if (user && user.role === 'patient') {
          patientEmail = user.email;
        }
      }

      // Default to seeded demo patient if none specified
      if (!patientEmail) {
        patientEmail = 'ravi@healthmemory.demo';
      }

      patient = await prisma.patient.findFirst({
        where: { email: patientEmail },
        include: {
          conditions: true,
          allergies: true,
          medications: {
            where: { status: 'active' },
          },
        },
      });
    }

    if (!patient) {
      // Fallback to first patient in database
      const fallback = await prisma.patient.findFirst({
        include: {
          conditions: true,
          allergies: true,
          medications: true,
        },
      });

      if (!fallback) {
        return NextResponse.json({ error: 'No patient record found.' }, { status: 404 });
      }

      return NextResponse.json({ patient: formatPatientResponse(fallback) });
    }

    return NextResponse.json({ patient: formatPatientResponse(patient) });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, ...patch } = body;

    let targetId = id;

    if (!targetId && email) {
      const p = await prisma.patient.findFirst({ where: { email } });
      targetId = p?.id;
    }

    if (!targetId) {
      const p = await prisma.patient.findFirst();
      targetId = p?.id;
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Patient not found to update.' }, { status: 404 });
    }

    const updated = await prisma.patient.update({
      where: { id: targetId },
      data: {
        ...(patch.phone !== undefined && { phone: patch.phone }),
        ...(patch.address !== undefined && { address: patch.address }),
        ...(patch.preferredLanguage !== undefined && { preferredLanguage: patch.preferredLanguage }),
        ...(patch.mobilityStatus !== undefined && { mobilityStatus: patch.mobilityStatus }),
        ...(patch.bloodType !== undefined && { bloodType: patch.bloodType }),
      },
      include: {
        conditions: true,
        allergies: true,
        medications: true,
      },
    });

    return NextResponse.json({ patient: formatPatientResponse(updated) });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient profile.' }, { status: 500 });
  }
}

function formatPatientResponse(p: any) {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    primaryDoctor: p.primaryDoctor,
    primaryDoctorId: p.primaryDoctorId,
    activeConditions: p.conditions.map((c: any) => c.name),
    allergies: p.allergies.map((a: any) => ({
      id: a.id,
      allergen: a.allergen,
      reaction: a.reaction,
      severity: a.severity,
      diagnosedDate: a.diagnosedDate,
    })),
    emergencyContact: {
      name: p.emergencyContactName,
      relationship: p.emergencyContactRel,
      phone: p.emergencyContactPhone,
      email: p.emergencyContactEmail || undefined,
    },
    profileImage: p.profileImage || undefined,
    bloodType: p.bloodType || undefined,
    address: p.address || undefined,
    phone: p.phone || undefined,
    email: p.email || undefined,
    preferredLanguage: p.preferredLanguage || 'English',
    mobilityStatus: p.mobilityStatus || undefined,
  };
}
