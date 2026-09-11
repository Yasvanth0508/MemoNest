import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUserFromRequest } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientIdParam = searchParams.get('patientId') || searchParams.get('id');
    const email = searchParams.get('email');

    let targetPatientId: string | undefined = undefined;

    // 1. Authenticated patient gets own consent
    const authUser = await getAuthUserFromRequest(req);
    if (authUser && authUser.role === 'patient') {
      const p = await prisma.patient.findFirst({
        where: { OR: [{ email: authUser.email }, { userId: authUser.id }] },
      });
      if (p) targetPatientId = p.id;
    }

    // 2. Look up by email if provided
    if (!targetPatientId && email && email.toLowerCase() !== 'ravi@healthmemory.demo') {
      const p = await prisma.patient.findFirst({ where: { email } });
      if (p) targetPatientId = p.id;
    }

    // 3. Check patientIdParam, validating against email if both provided
    if (!targetPatientId && patientIdParam) {
      if (email && email.toLowerCase() !== 'ravi@healthmemory.demo') {
        const p = await prisma.patient.findFirst({ where: { email } });
        targetPatientId = p ? p.id : patientIdParam;
      } else {
        targetPatientId = patientIdParam;
      }
    }

    // 4. Default / Fallback
    if (!targetPatientId) {
      const patient = await prisma.patient.findFirst({
        where: { email: email || 'ravi@healthmemory.demo' },
      });
      targetPatientId = patient?.id;
    }

    if (!targetPatientId) {
      const fallback = await prisma.patient.findFirst();
      targetPatientId = fallback?.id;
    }

    if (!targetPatientId) {
      return NextResponse.json({ records: [] });
    }

    const records = await prisma.consentRecord.findMany({
      where: { patientId: targetPatientId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      records: records.map((r) => ({
        id: r.id,
        patientId: r.patientId,
        granteeId: r.granteeId,
        granteeName: r.granteeName,
        granteeRole: r.granteeRole,
        granteeEmail: r.granteeEmail || undefined,
        organization: r.organization || undefined,
        grantedPermissions: JSON.parse(r.grantedPermissions || '[]'),
        deniedPermissions: JSON.parse(r.deniedPermissions || '[]'),
        restrictedPermissions: JSON.parse(r.restrictedPermissions || '[]'),
        status: r.status,
        validFrom: r.validFrom,
        validUntil: r.validUntil || undefined,
        lastUpdated: r.updatedAt.toISOString(),
        notes: r.notes || undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching consent records:', error);
    return NextResponse.json({ error: 'Failed to fetch consent records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      granteeName,
      granteeRole,
      organization,
      grantedPermissions,
      durationDays,
      notes,
    } = body;

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id || 'patient-001';
    }

    const days = durationDays || 30;
    const validUntil =
      days === -1
        ? '2099-12-31T23:59:59Z'
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const record = await prisma.consentRecord.create({
      data: {
        patientId: targetPatientId,
        granteeId: `user-${Date.now()}`,
        granteeName: granteeName || 'Authorized Clinician',
        granteeRole: granteeRole || 'doctor',
        organization: organization || 'Healthcare Network',
        grantedPermissions: JSON.stringify(grantedPermissions || ['medications']),
        deniedPermissions: JSON.stringify([]),
        restrictedPermissions: JSON.stringify(['genetics']),
        status: 'active',
        validFrom: new Date().toISOString(),
        validUntil,
        notes: notes || 'Granted via consent center.',
      },
    });

    await prisma.auditEntry.create({
      data: {
        patientId: targetPatientId,
        timestamp: new Date().toISOString(),
        userId: 'patient-user',
        userName: 'Patient / Guardian',
        userRole: 'patient',
        eventType: 'create',
        action: `Granted Consent to ${granteeName}`,
        resource: 'Consent Registry',
        details: `Scopes: ${(grantedPermissions || []).join(', ')} for ${days} days.`,
        purposeOfUse: 'Data governance update',
        status: 'success',
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error creating consent record:', error);
    return NextResponse.json({ error: 'Failed to grant consent' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, grantedPermissions } = body;

    if (!id) {
      return NextResponse.json({ error: 'Consent ID required' }, { status: 400 });
    }

    const updated = await prisma.consentRecord.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(grantedPermissions && { grantedPermissions: JSON.stringify(grantedPermissions) }),
      },
    });

    return NextResponse.json({ record: updated });
  } catch (error) {
    console.error('Error updating consent:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}
