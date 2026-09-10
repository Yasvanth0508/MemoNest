import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const userRole = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (userRole) where.userRole = userRole;

    const entries = await prisma.auditEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const auditLogs = entries.map((e) => ({
      id: e.id,
      patientId: e.patientId,
      timestamp: e.timestamp,
      userId: e.userId,
      userName: e.userName,
      userRole: e.userRole as 'doctor' | 'caregiver' | 'patient' | 'system',
      eventType: e.eventType as 'access' | 'query' | 'create' | 'update' | 'delete' | 'export' | 'override',
      action: e.action,
      resource: e.resource,
      details: e.details,
      purposeOfUse: e.purposeOfUse,
      ipAddress: e.ipAddress || '127.0.0.1',
      status: e.status as 'success' | 'denied' | 'flagged',
    }));

    return NextResponse.json({ auditLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      userId = 'user-clinician-001',
      userName = 'Dr. Rajesh Sharma',
      userRole = 'doctor',
      eventType = 'access',
      action,
      resource,
      details,
      purposeOfUse = 'Direct Clinical Patient Care',
      ipAddress = '127.0.0.1',
      status = 'success',
    } = body;

    if (!action || !resource || !details) {
      return NextResponse.json(
        { error: 'action, resource, and details are required' },
        { status: 400 }
      );
    }

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const firstPatient = await prisma.patient.findFirst();
      targetPatientId = firstPatient?.id || 'patient-001';
    }

    const entry = await prisma.auditEntry.create({
      data: {
        patientId: targetPatientId,
        timestamp: new Date().toISOString(),
        userId,
        userName,
        userRole,
        eventType,
        action,
        resource,
        details,
        purposeOfUse,
        ipAddress,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        patientId: entry.patientId,
        timestamp: entry.timestamp,
        userId: entry.userId,
        userName: entry.userName,
        userRole: entry.userRole,
        eventType: entry.eventType,
        action: entry.action,
        resource: entry.resource,
        details: entry.details,
        purposeOfUse: entry.purposeOfUse,
        ipAddress: entry.ipAddress,
        status: entry.status,
      },
    });
  } catch (error) {
    console.error('Error creating audit entry:', error);
    return NextResponse.json({ error: 'Failed to create audit entry' }, { status: 500 });
  }
}
