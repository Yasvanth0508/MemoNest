import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUserFromRequest } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    const patientIdParam = searchParams.get('patientId');

    let patient = null;

    // 1. Authenticated user
    const authUser = await getAuthUserFromRequest(req);
    if (authUser && authUser.role === 'patient') {
      patient = await prisma.patient.findFirst({
        where: { OR: [{ email: authUser.email }, { userId: authUser.id }] },
      });
    }

    // 2. Email param
    if (!patient && emailParam && emailParam.toLowerCase() !== 'ravi@healthmemory.demo') {
      patient = await prisma.patient.findFirst({ where: { email: emailParam } });
    }

    // 3. Patient ID param
    if (!patient && patientIdParam) {
      patient = await prisma.patient.findUnique({ where: { id: patientIdParam } });
    }

    // 4. Default
    if (!patient) {
      patient = await prisma.patient.findFirst({ where: { email: emailParam || 'ravi@healthmemory.demo' } });
    }

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
