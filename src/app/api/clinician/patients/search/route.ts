import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('patientId') || '';

    const showAll = searchParams.get('all') === 'true' || searchParams.get('roster') === 'true';

    function formatPatient(p: any) {
      const activeConsents = p.consentRecords ? p.consentRecords.filter((c: any) => c.status === 'active') : [];
      const hasActiveConsent = activeConsents.length > 0;
      return {
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth,
        primaryDoctor: p.primaryDoctor,
        primaryDoctorId: p.primaryDoctorId || undefined,
        bloodType: p.bloodType || 'Unknown',
        address: p.address || undefined,
        phone: p.phone || undefined,
        email: p.email || undefined,
        preferredLanguage: p.preferredLanguage || 'English',
        mobilityStatus: p.mobilityStatus || 'Normal ambulation',
        profileImage: p.profileImage || undefined,
        emergencyContact: {
          name: p.emergencyContactName,
          relationship: p.emergencyContactRel,
          phone: p.emergencyContactPhone,
          email: p.emergencyContactEmail || undefined,
        },
        hasConsent: hasActiveConsent,
        consentScope: hasActiveConsent ? 'Active Doctor Care Circle Consent' : 'Requires Access Grant or Emergency Override',
        activeConditions: p.conditions ? p.conditions.map((c: any) => c.name) : [],
        allergies: p.allergies ? p.allergies.map((a: any) => ({
          id: a.id,
          allergen: a.allergen,
          reaction: a.reaction,
          severity: a.severity,
          diagnosedDate: a.diagnosedDate || undefined,
        })) : [],
        allergiesCount: p.allergies ? p.allergies.length : 0,
        activeMedicationsCount: p.medications ? p.medications.length : 0,
      };
    }

    if (showAll || !query.trim()) {
      const allPatients = await prisma.patient.findMany({
        include: {
          consentRecords: true,
          conditions: true,
          allergies: true,
          medications: { where: { status: 'active' } },
        },
        orderBy: { name: 'asc' },
        take: 50,
      });

      return NextResponse.json({
        patients: allPatients.map(formatPatient),
        total: allPatients.length,
      });
    }

    const clean = query.trim().toLowerCase();

    // Search by exact or partial ID, Email, or Name
    const foundPatients = await prisma.patient.findMany({
      where: {
        OR: [
          { id: { contains: clean } },
          { email: { contains: clean } },
          { name: { contains: clean } },
        ],
      },
      include: {
        consentRecords: true,
        conditions: true,
        allergies: true,
        medications: { where: { status: 'active' } },
      },
    });

    if (foundPatients.length === 0) {
      return NextResponse.json({
        patients: [],
        message: 'No patient record found matching that specific identifier.',
      });
    }

    return NextResponse.json({
      patients: foundPatients.map(formatPatient),
      total: foundPatients.length,
    });
  } catch (error) {
    console.error('Error in patient search:', error);
    return NextResponse.json({ error: 'Failed to search patients' }, { status: 500 });
  }
}
