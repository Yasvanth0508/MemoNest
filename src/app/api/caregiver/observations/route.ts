import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { caregiverObservationAgent } from '@/lib/agents/caregiver-observation.agent';
import { createRecordChunk } from '@/lib/ai/chunking';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientIdParam = searchParams.get('patientId') || searchParams.get('id');
    const email = searchParams.get('email');

    let targetPatientId: string | undefined = patientIdParam || undefined;

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
      return NextResponse.json({ observations: [] });
    }

    const observations = await prisma.caregiverObservation.findMany({
      where: { patientId: targetPatientId },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ observations });
  } catch (error) {
    console.error('Error fetching caregiver observations:', error);
    return NextResponse.json({ error: 'Failed to fetch observations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      note,
      category: inputCategory,
      severity: inputSeverity,
      caregiverName,
      caregiverId,
      location,
      patientId,
      email,
    } = body;

    if (!note || note.trim() === '') {
      return NextResponse.json({ error: 'Observation note cannot be empty.' }, { status: 400 });
    }

    let targetPatient = null;
    if (patientId) {
      targetPatient = await prisma.patient.findUnique({ where: { id: patientId } });
    } else if (email) {
      targetPatient = await prisma.patient.findFirst({ where: { email } });
    } else {
      targetPatient = await prisma.patient.findFirst();
    }

    if (!targetPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // 1. Run Caregiver Observation AI Agent
    const analysis = await caregiverObservationAgent.process(
      note,
      inputCategory,
      inputSeverity
    );

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const resolvedCaregiver = caregiverName || 'Anita Desai';
    const resolvedCaregiverId = caregiverId || 'user-caregiver-001';

    // 2. Persist Observation in DB
    const observation = await prisma.caregiverObservation.create({
      data: {
        patientId: targetPatient.id,
        caregiverId: resolvedCaregiverId,
        caregiverName: resolvedCaregiver,
        timestamp: nowIso,
        category: analysis.category,
        note: note.trim(),
        summary: analysis.summary,
        severity: analysis.severity,
        incidentReported: analysis.incidentReported,
        location: location || analysis.location || null,
        actionTaken: analysis.actionTaken || null,
        vitalsChecked: analysis.vitalsChecked,
        status: 'reviewed',
      },
    });

    // 3. Create Timeline Event
    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        patientId: targetPatient.id,
        date: todayDate,
        time: nowTime,
        type: analysis.category === 'fall' ? 'fall' : 'caregiver_observation',
        category: 'caregiver',
        title: `${analysis.category.replace('_', ' ').toUpperCase()}: Caregiver Log (${resolvedCaregiver})`,
        description: analysis.summary || note.substring(0, 200),
        severity: analysis.severity,
        sourceType: 'observation',
        sourceId: observation.id,
        author: resolvedCaregiver,
        authorRole: 'Home Caregiver',
      },
    });

    // 4. Create Grounded Evidence Snippet
    const evidence = await prisma.evidenceSnippet.create({
      data: {
        patientId: targetPatient.id,
        documentTitle: `Caregiver Shift Observation (${resolvedCaregiver})`,
        documentDate: todayDate,
        sourceType: 'observation',
        quote: note.length > 280 ? `${note.substring(0, 280)}...` : note,
        context: `${analysis.category} logged at ${nowTime} (${location || analysis.location || 'Home'})`,
        linkedEntity: `${analysis.category} observation`,
        confidenceScore: 0.98,
        author: resolvedCaregiver,
      },
    });

    // Link evidence ID back
    await prisma.caregiverObservation.update({
      where: { id: observation.id },
      data: { evidenceId: evidence.id },
    });
    await prisma.timelineEvent.update({
      where: { id: timelineEvent.id },
      data: { evidenceId: evidence.id },
    });

    // 5. Chunk and Index into RecordChunk for the Doctor AI Chatbot
    await createRecordChunk({
      patientId: targetPatient.id,
      sourceType: 'observation',
      sourceId: observation.id,
      title: `Caregiver Log: ${analysis.category} (${resolvedCaregiver})`,
      date: todayDate,
      category: analysis.category,
      content: `Caregiver Observation by ${resolvedCaregiver} on ${todayDate} at ${nowTime}: ${note}. Location: ${location || analysis.location || 'Unspecified'}. Actions taken: ${analysis.actionTaken || 'None specified'}. Severity: ${analysis.severity}. Category: ${analysis.category}.`,
      metadata: {
        severity: analysis.severity,
        incident: analysis.incidentReported,
        evidenceId: evidence.id,
      },
    });

    // 6. If urgent (fall or acute confusion), create Patient Notification and Risk Signal
    if (analysis.urgencyAlert) {
      await prisma.patientNotification.create({
        data: {
          patientId: targetPatient.id,
          category: 'caregiver',
          title: `Caregiver logged an urgent ${analysis.category}`,
          message: `${resolvedCaregiver} logged: ${analysis.summary}`,
          timestamp: nowIso,
          severity: 'attention',
          isRead: false,
          actionLabel: 'View Timeline',
          actionUrl: '/patient/timeline',
          source: 'Caregiver Urgent Alert',
        },
      });
    }

    // 7. Record Audit Entry
    await prisma.auditEntry.create({
      data: {
        patientId: targetPatient.id,
        timestamp: nowIso,
        userId: resolvedCaregiverId,
        userName: resolvedCaregiver,
        userRole: 'caregiver',
        eventType: 'create',
        action: `Logged Caregiver Observation (${analysis.category})`,
        resource: 'Caregiver Observation Log',
        details: analysis.summary,
        purposeOfUse: 'Routine shift documentation',
        status: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      observation: {
        ...observation,
        evidenceId: evidence.id,
      },
      timelineEvent,
      analysis,
    });
  } catch (error) {
    console.error('Error creating caregiver observation:', error);
    return NextResponse.json(
      { error: 'Failed to record caregiver observation' },
      { status: 500 }
    );
  }
}
