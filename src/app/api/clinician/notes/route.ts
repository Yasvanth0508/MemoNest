import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createRecordChunk } from '@/lib/ai/chunking';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, title, diagnosisCodes, soap, freeText, doctorName, doctorId } = body;

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id || 'patient-001';
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);

    const description = `Subjective: ${soap?.subjective || ''} | Assessment: ${soap?.assessment || ''} | Plan: ${soap?.plan || ''}${
      freeText ? ` | Notes: ${freeText}` : ''
    }`;

    // 1. Create Timeline Event
    const event = await prisma.timelineEvent.create({
      data: {
        patientId: targetPatientId,
        date: today,
        time,
        type: 'routine_visit',
        category: 'medical',
        title: `Clinical Note: ${title || 'Progress Examination'}`,
        description,
        severity: 'low',
        sourceType: 'Clinical Progress Note',
        author: doctorName || 'Dr. Rajesh Sharma, MD',
        authorRole: 'Attending Physician',
        metadata: JSON.stringify({ diagnosisCodes: diagnosisCodes || [], soap }),
      },
    });

    // 2. Index Record Chunk for AI Assistant Semantic Search
    await createRecordChunk({
      patientId: targetPatientId,
      sourceType: 'document',
      sourceId: event.id,
      title: `Physician Note: ${title || 'Clinical Encounter'}`,
      date: today,
      category: 'medical',
      content: `${title}\nDiagnosis: ${(diagnosisCodes || []).join(', ')}\n${description}`,
      metadata: {
        author: doctorName || 'Dr. Rajesh Sharma, MD',
        type: 'clinical_note',
      },
    });

    // 3. Create Audit Entry
    await prisma.auditEntry.create({
      data: {
        patientId: targetPatientId,
        timestamp: new Date().toISOString(),
        userId: doctorId || 'user-clinician-001',
        userName: doctorName || 'Dr. Rajesh Sharma, MD',
        userRole: 'doctor',
        eventType: 'create',
        action: 'Signed Clinical Progress Note',
        resource: 'Patient Health Record / Clinical Notes',
        details: `Signed clinical note "${title}". ICD codes: ${(diagnosisCodes || []).join(', ')}`,
        purposeOfUse: 'Direct Patient Care Documentation',
        status: 'success',
      },
    });

    return NextResponse.json({ success: true, eventId: event.id, event });
  } catch (error) {
    console.error('Error creating clinical note:', error);
    return NextResponse.json({ error: 'Failed to create clinical note' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId') || 'patient-001';

    const notes = await prisma.timelineEvent.findMany({
      where: {
        patientId,
        sourceType: 'Clinical Progress Note',
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    return NextResponse.json({ error: 'Failed to fetch clinical notes' }, { status: 500 });
  }
}
