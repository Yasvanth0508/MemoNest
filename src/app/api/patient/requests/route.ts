import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ravi@healthmemory.demo';

    const patient = await prisma.patient.findFirst({ where: { email } });
    if (!patient) {
      return NextResponse.json({ requests: [] });
    }

    const requests = await prisma.profileChangeRequest.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { field, currentValue, requestedValue, reason, email } = body;

    let patient = await prisma.patient.findFirst({
      where: { email: email || 'ravi@healthmemory.demo' },
    });

    if (!patient) {
      patient = await prisma.patient.findFirst();
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const newRequest = await prisma.profileChangeRequest.create({
      data: {
        patientId: patient.id,
        field,
        currentValue,
        requestedValue,
        reason,
        dateSubmitted: new Date().toISOString().split('T')[0],
        status: 'pending_review',
      },
    });

    return NextResponse.json({ request: newRequest });
  } catch (error) {
    console.error('Error submitting change request:', error);
    return NextResponse.json({ error: 'Failed to submit change request' }, { status: 500 });
  }
}
