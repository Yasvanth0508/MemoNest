import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ravi@healthmemory.demo';

    const patient = await prisma.patient.findFirst({
      where: { email },
      include: {
        allergies: true,
        medications: {
          where: { status: 'active' },
        },
      },
    });

    if (!patient) {
      const fallback = await prisma.patient.findFirst({
        include: { allergies: true, medications: true },
      });

      if (!fallback) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      return NextResponse.json(formatSosData(fallback));
    }

    return NextResponse.json(formatSosData(patient));
  } catch (error) {
    console.error('Emergency SOS error:', error);
    return NextResponse.json({ error: 'Emergency data unavailable' }, { status: 500 });
  }
}

function formatSosData(p: any) {
  return {
    patientId: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    bloodType: p.bloodType || 'Unknown',
    mobilityStatus: p.mobilityStatus || 'Unknown',
    emergencyContact: {
      name: p.emergencyContactName,
      relationship: p.emergencyContactRel,
      phone: p.emergencyContactPhone,
    },
    allergies: p.allergies.map((a: any) => ({
      allergen: a.allergen,
      severity: a.severity,
      reaction: a.reaction,
    })),
    activeMedications: p.medications.map((m: any) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      fallRiskWarning: m.fallRiskWarning,
    })),
  };
}
