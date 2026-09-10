import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const email = searchParams.get('email');

    let targetPatientId: string | undefined = patientId || undefined;

    if (!targetPatientId && email) {
      const p = await prisma.patient.findFirst({ where: { email } });
      targetPatientId = p?.id;
    }

    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id;
    }

    if (!targetPatientId) {
      return NextResponse.json({ requests: [] });
    }

    const requests = await prisma.accessRequest.findMany({
      where: { patientId: targetPatientId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedRequests = requests.map((r) => ({
      id: r.id,
      patientId: r.patientId,
      requesterName: r.requesterName,
      requesterRole: r.requesterRole,
      requesterOrg: r.requesterOrg,
      reason: r.reason,
      durationDays: r.durationDays,
      requestedCategories: JSON.parse(r.requestedCategories || '[]'),
      requestDate: r.requestDate,
      status: r.status as 'pending' | 'approved' | 'denied',
    }));

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching access requests:', error);
    return NextResponse.json({ error: 'Failed to fetch access requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      email,
      requesterName,
      requesterRole = 'doctor',
      requesterOrg,
      reason,
      durationDays = 30,
      requestedCategories = ['medical_reports', 'medications'],
    } = body;

    if (!requesterName || !reason) {
      return NextResponse.json(
        { error: 'requesterName and reason are required' },
        { status: 400 }
      );
    }

    let targetPatientId = patientId;
    if (!targetPatientId && email) {
      const p = await prisma.patient.findFirst({ where: { email } });
      targetPatientId = p?.id;
    }
    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id;
    }

    if (!targetPatientId) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const newRequest = await prisma.accessRequest.create({
      data: {
        patientId: targetPatientId,
        requesterName,
        requesterRole,
        requesterOrg: requesterOrg || 'Healthcare Network',
        reason,
        durationDays: Number(durationDays) || 30,
        requestedCategories: JSON.stringify(requestedCategories),
        requestDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: 'pending',
      },
    });

    // Notify patient of new access request
    await prisma.patientNotification.create({
      data: {
        patientId: targetPatientId,
        category: 'consent',
        title: `${requesterName} requested access to your health records`,
        message: `Reason: ${reason}. Requested duration: ${durationDays} days.`,
        timestamp: new Date().toISOString(),
        severity: 'attention',
        isRead: false,
        actionLabel: 'Review Request',
        actionUrl: '/patient/consent',
        source: requesterOrg || 'Clinician Portal',
      },
    });

    return NextResponse.json({
      success: true,
      request: {
        ...newRequest,
        requestedCategories,
      },
    });
  } catch (error) {
    console.error('Error submitting access request:', error);
    return NextResponse.json({ error: 'Failed to submit access request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status || !['approved', 'denied'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid id and status ("approved" or "denied") are required' },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.accessRequest.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 });
    }

    // 1. Update status
    const updatedRequest = await prisma.accessRequest.update({
      where: { id },
      data: { status },
    });

    const nowIso = new Date().toISOString();
    const parsedCategories: string[] = JSON.parse(existingRequest.requestedCategories || '[]');

    if (status === 'approved') {
      const validUntil = new Date(
        Date.now() + existingRequest.durationDays * 24 * 60 * 60 * 1000
      ).toISOString();

      // 2. Automatically create active ConsentRecord in DB
      await prisma.consentRecord.create({
        data: {
          patientId: existingRequest.patientId,
          granteeId: `user-req-${Date.now()}`,
          granteeName: existingRequest.requesterName,
          granteeRole: existingRequest.requesterRole,
          granteeEmail: `${existingRequest.requesterName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@clinic.demo`,
          organization: existingRequest.requesterOrg,
          grantedPermissions: JSON.stringify(parsedCategories),
          deniedPermissions: JSON.stringify([]),
          restrictedPermissions: JSON.stringify(['genetics']),
          status: 'active',
          validFrom: nowIso,
          validUntil,
          notes: `Granted via approved request: ${existingRequest.reason}`,
        },
      });

      // 3. Create Audit Entry
      await prisma.auditEntry.create({
        data: {
          patientId: existingRequest.patientId,
          timestamp: nowIso,
          userId: 'patient-user',
          userName: existingRequest.patient?.name || 'Patient',
          userRole: 'patient',
          eventType: 'create',
          action: `Approved Health Record Access for ${existingRequest.requesterName}`,
          resource: 'Consent Registry',
          details: `Approved ${existingRequest.durationDays}-day access for ${existingRequest.requesterOrg}. Scopes: ${parsedCategories.join(', ')}`,
          purposeOfUse: 'Patient consent grant',
          status: 'success',
        },
      });

      // 4. Create Notification
      await prisma.patientNotification.create({
        data: {
          patientId: existingRequest.patientId,
          category: 'consent',
          title: `Access granted to ${existingRequest.requesterName}`,
          message: `Health information access active for ${existingRequest.durationDays} days. You can revoke this anytime.`,
          timestamp: nowIso,
          severity: 'info',
          isRead: false,
          actionLabel: 'Manage Access',
          actionUrl: '/patient/consent',
        },
      });
    } else {
      // Denied audit & notification
      await prisma.auditEntry.create({
        data: {
          patientId: existingRequest.patientId,
          timestamp: nowIso,
          userId: 'patient-user',
          userName: existingRequest.patient?.name || 'Patient',
          userRole: 'patient',
          eventType: 'update',
          action: `Denied Access Request from ${existingRequest.requesterName}`,
          resource: 'Consent Registry',
          details: `Declined request: ${existingRequest.reason}`,
          purposeOfUse: 'Patient consent boundary',
          status: 'denied',
        },
      });
    }

    return NextResponse.json({
      success: true,
      request: {
        ...updatedRequest,
        requestedCategories: parsedCategories,
      },
    });
  } catch (error) {
    console.error('Error updating access request:', error);
    return NextResponse.json({ error: 'Failed to update access request' }, { status: 500 });
  }
}
