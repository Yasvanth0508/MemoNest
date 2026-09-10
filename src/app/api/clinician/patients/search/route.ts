import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('patientId') || '';

    if (!query.trim()) {
      return NextResponse.json({
        patients: [],
        message: 'Search requires a specific Patient ID or registered email.',
      });
    }

    const clean = query.trim().toLowerCase();

    // Privacy rule: Only search by exact Patient ID or exact Email
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id: clean },
          { email: clean },
        ],
      },
      include: {
        consentRecords: true,
        conditions: true,
        allergies: true,
        medications: { where: { status: 'active' } },
      },
    });

    if (!patient) {
      return NextResponse.json({
        patients: [],
        message: 'No patient record found matching that specific identifier.',
      });
    }

    const activeConsents = patient.consentRecords.filter((c) => c.status === 'active');
    const hasActiveConsent = activeConsents.length > 0;

    return NextResponse.json({
      patients: [
        {
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          dateOfBirth: patient.dateOfBirth,
          primaryDoctor: patient.primaryDoctor,
          bloodType: patient.bloodType,
          mobilityStatus: patient.mobilityStatus,
          hasConsent: hasActiveConsent,
          consentScope: hasActiveConsent ? 'Active Doctor Care Circle Consent' : 'Requires Access Grant or Emergency Override',
          activeConditions: patient.conditions.map((c) => c.name),
          allergiesCount: patient.allergies.length,
          activeMedicationsCount: patient.medications.length,
        },
      ],
    });
  } catch (error) {
    console.error('Error in patient search:', error);
    return NextResponse.json({ error: 'Failed to search patients' }, { status: 500 });
  }
}
