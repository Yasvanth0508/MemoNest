import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUserFromRequest } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientIdParam = searchParams.get('patientId') || searchParams.get('id');
    const email = searchParams.get('email');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');

    let targetPatientId: string | undefined = undefined;

    // 1. Authenticated patient session gets their own timeline
    const authUser = await getAuthUserFromRequest(req);
    if (authUser && authUser.role === 'patient') {
      const p = await prisma.patient.findFirst({
        where: { OR: [{ email: authUser.email }, { userId: authUser.id }] },
      });
      if (p) targetPatientId = p.id;
    }

    // 2. Look up by email if provided and not default demo
    if (!targetPatientId && email && email.toLowerCase() !== 'ravi@healthmemory.demo') {
      const p = await prisma.patient.findFirst({ where: { email } });
      if (p) targetPatientId = p.id;
    }

    // 3. Check patientIdParam, validating with email if both were provided
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
      return NextResponse.json({ events: [] });
    }

    const whereClause: any = {
      patientId: targetPatientId,
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (severity && severity !== 'all') {
      whereClause.severity = severity;
    }

    const events = await prisma.timelineEvent.findMany({
      where: whereClause,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      events: events.map((ev) => ({
        id: ev.id,
        patientId: ev.patientId,
        date: ev.date,
        time: ev.time || undefined,
        type: ev.type,
        category: ev.category,
        title: ev.title,
        description: ev.description,
        severity: ev.severity || 'low',
        sourceType: ev.sourceType,
        sourceId: ev.sourceId || undefined,
        author: ev.author || undefined,
        authorRole: ev.authorRole || undefined,
        evidenceId: ev.evidenceId || undefined,
        metadata: ev.metadata ? JSON.parse(ev.metadata) : undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      email,
      date,
      time,
      type,
      category,
      title,
      description,
      severity,
      sourceType,
      sourceId,
      author,
      authorRole,
      evidenceId,
      metadata,
    } = body;

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

    const newEvent = await prisma.timelineEvent.create({
      data: {
        patientId: targetPatientId,
        date: date || new Date().toISOString().split('T')[0],
        time: time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        type: type || 'routine_visit',
        category: category || 'medical',
        title: title || 'Clinical Update',
        description: description || '',
        severity: severity || 'low',
        sourceType: sourceType || 'clinical_note',
        sourceId: sourceId || null,
        author: author || 'Care Provider',
        authorRole: authorRole || 'Provider',
        evidenceId: evidenceId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ event: newEvent });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
  }
}
