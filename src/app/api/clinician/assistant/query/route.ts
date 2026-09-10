import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { clinicalAssistantAgent } from '@/lib/agents/clinical-assistant.agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, patientId, doctorName, doctorId } = body;

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Query text is required.' }, { status: 400 });
    }

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id || 'patient-001';
    }

    // Execute 5-Layer Clinical Assistant Pipeline
    const result = await clinicalAssistantAgent.executeQuery(targetPatientId, query.trim());

    const nowIso = new Date().toISOString();
    const resolvedDoctor = doctorName || 'Dr. Rajesh Sharma';
    const resolvedDocId = doctorId || 'user-clinician-001';

    // Store query in database
    await prisma.aiAssistantQuery.create({
      data: {
        patientId: targetPatientId,
        userId: resolvedDocId,
        query: query.trim(),
        timestamp: nowIso,
        answer: result.answer,
        sourceReferences: JSON.stringify(result.sourceReferences),
        trace: JSON.stringify(result.trace),
      },
    });

    // Record Audit Entry
    await prisma.auditEntry.create({
      data: {
        patientId: targetPatientId,
        timestamp: nowIso,
        userId: resolvedDocId,
        userName: resolvedDoctor,
        userRole: 'doctor',
        eventType: 'query',
        action: 'Queried 5-Layer AI Clinical Decision Assistant',
        resource: 'Longitudinal Health Records & Chunks',
        details: `Clinical question: "${query.substring(0, 100)}..."`,
        purposeOfUse: 'Clinical decision support',
        status: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sourceReferences: result.sourceReferences,
      trace: result.trace,
    });
  } catch (error) {
    console.error('Error executing assistant query:', error);
    return NextResponse.json(
      { error: 'Failed to process AI assistant query.' },
      { status: 500 }
    );
  }
}
