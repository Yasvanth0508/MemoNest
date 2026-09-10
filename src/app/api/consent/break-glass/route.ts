import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, doctorName, doctorId, reason, department } = body;

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'A valid clinical justification (minimum 10 characters) is required for emergency break-glass.' },
        { status: 400 }
      );
    }

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id || 'patient-001';
    }

    const targetPatient = await prisma.patient.findUnique({ where: { id: targetPatientId } });
    if (!targetPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const expiry24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const resolvedDoc = doctorName || 'Emergency Attending Clinician';
    const resolvedDocId = doctorId || 'er-doc-override';

    // 1. Create temporary 24-hour emergency consent grant
    const emergencyGrant = await prisma.consentRecord.create({
      data: {
        patientId: targetPatient.id,
        granteeId: resolvedDocId,
        granteeName: resolvedDoc,
        granteeRole: 'doctor',
        organization: department || 'Emergency Trauma Center',
        grantedPermissions: JSON.stringify(['emergency_access', 'full_medical', 'medications', 'lab_results']),
        deniedPermissions: JSON.stringify([]),
        restrictedPermissions: JSON.stringify(['genetics']),
        status: 'active',
        validFrom: nowIso,
        validUntil: expiry24h,
        notes: `EMERGENCY BREAK-GLASS OVERRIDE: ${reason.trim()}`,
      },
    });

    // 2. High-priority audit entry flagged for compliance
    const audit = await prisma.auditEntry.create({
      data: {
        patientId: targetPatient.id,
        timestamp: nowIso,
        userId: resolvedDocId,
        userName: resolvedDoc,
        userRole: 'doctor',
        eventType: 'override',
        action: 'EMERGENCY BREAK-GLASS ACCESS OVERRIDE',
        resource: 'Complete Longitudinal Patient Health Memory',
        details: `Justification: "${reason.trim()}". Department: ${department || 'Emergency Medicine'}. Access window: 24 hours.`,
        purposeOfUse: 'Emergency life-saving stabilization',
        status: 'flagged',
      },
    });

    // 3. Immediately notify patient & guardian of the override
    await prisma.patientNotification.create({
      data: {
        patientId: targetPatient.id,
        category: 'consent',
        title: 'Emergency Break-Glass Access Event Recorded',
        message: `${resolvedDoc} accessed your complete medical record under emergency protocol. Justification: "${reason.trim()}".`,
        timestamp: nowIso,
        severity: 'attention',
        isRead: false,
        actionLabel: 'Review Audit Log',
        actionUrl: '/patient/consent',
        source: 'Emergency Governance Shield',
      },
    });

    return NextResponse.json({
      success: true,
      grantId: emergencyGrant.id,
      auditId: audit.id,
      accessExpiresAt: expiry24h,
      message: 'Emergency break-glass access granted and logged in compliance audit trail.',
    });
  } catch (error) {
    console.error('Break-glass override error:', error);
    return NextResponse.json(
      { error: 'Failed to process emergency break-glass override.' },
      { status: 500 }
    );
  }
}
