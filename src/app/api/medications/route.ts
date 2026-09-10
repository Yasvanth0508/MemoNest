import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createRecordChunk } from '@/lib/ai/chunking';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status'); // e.g. "active"

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const firstPatient = await prisma.patient.findFirst();
      if (!firstPatient) {
        return NextResponse.json({ medications: [] });
      }
      targetPatientId = firstPatient.id;
    }

    const whereClause: any = { patientId: targetPatientId };
    if (status) {
      whereClause.status = status;
    }

    const dbMeds = await prisma.medication.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const medications = dbMeds.map((m) => ({
      id: m.id,
      patientId: m.patientId,
      name: m.name,
      genericName: m.genericName || undefined,
      dosage: m.dosage,
      frequency: m.frequency,
      route: m.route || 'Oral',
      indication: m.indication,
      status: m.status as 'active' | 'stopped' | 'historical',
      startDate: m.startDate,
      endDate: m.endDate || undefined,
      prescriber: m.prescriber,
      prescriberId: m.prescriberId || undefined,
      instructions: m.instructions || undefined,
      stopReason: m.stopReason || undefined,
      changeReason: m.changeReason || undefined,
      recentChangeNotes: m.recentChangeNotes || undefined,
      sideEffectsReported: m.sideEffectsReported ? JSON.parse(m.sideEffectsReported) : [],
      isRecentChange: m.isRecentChange,
      fallRiskWarning: m.fallRiskWarning,
      sedationRisk: m.sedationRisk,
      evidenceIds: m.evidenceIds ? JSON.parse(m.evidenceIds) : [],
    }));

    return NextResponse.json({ medications });
  } catch (error) {
    console.error('Error in GET /api/medications:', error);
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      name,
      genericName,
      dosage,
      frequency,
      route = 'Oral',
      indication = 'Prescribed via Doctor Clinical Portal',
      prescriber = 'Dr. Rajesh Sharma, MD',
      prescriberId = 'user-clinician-001',
      instructions = '',
      fallRiskWarning = false,
      sedationRisk = false,
      evidenceIds = [],
      changeReason,
      startDate = new Date().toISOString().split('T')[0],
    } = body;

    if (!name || !dosage || !frequency) {
      return NextResponse.json(
        { error: 'Name, dosage, and frequency are required' },
        { status: 400 }
      );
    }

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const firstPatient = await prisma.patient.findFirst();
      if (!firstPatient) {
        return NextResponse.json({ error: 'No patient found' }, { status: 404 });
      }
      targetPatientId = firstPatient.id;
    }

    // Auto-detect Beers Criteria / Sedation risk for common geriatric alert drugs
    const lowerName = name.toLowerCase();
    const isBeersDrug =
      lowerName.includes('zolpidem') ||
      lowerName.includes('lorazepam') ||
      lowerName.includes('diazepam') ||
      lowerName.includes('alprazolam') ||
      lowerName.includes('diphenhydramine') ||
      lowerName.includes('amitriptyline');

    const calculatedFallRisk = fallRiskWarning || isBeersDrug;
    const calculatedSedationRisk = sedationRisk || isBeersDrug;

    // 1. Create medication in DB
    const newMed = await prisma.medication.create({
      data: {
        patientId: targetPatientId,
        name,
        genericName: genericName || name,
        dosage,
        frequency,
        route,
        indication,
        status: 'active',
        startDate,
        prescriber,
        prescriberId,
        instructions,
        isRecentChange: true,
        fallRiskWarning: calculatedFallRisk,
        sedationRisk: calculatedSedationRisk,
        changeReason: changeReason || 'New prescription order issued',
        evidenceIds: JSON.stringify(evidenceIds),
      },
    });

    // 2. Create Timeline Event
    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        patientId: targetPatientId,
        date: startDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        type: 'medication_change',
        category: 'medication',
        title: `New Prescription: ${name} ${dosage}`,
        description: `${frequency}. Indication: ${indication}. Instructions: ${instructions || 'Take as directed'}${calculatedFallRisk ? ' [High Fall / Beers Warning]' : ''}`,
        severity: calculatedFallRisk ? 'high' : 'medium',
        sourceType: 'Prescription Order',
        sourceId: newMed.id,
        author: prescriber,
        authorRole: 'Attending Physician',
      },
    });

    // 3. Create semantic record chunk for AI retrieval
    await createRecordChunk({
      patientId: targetPatientId,
      sourceType: 'medication',
      sourceId: newMed.id,
      title: `Active Medication: ${name} ${dosage}`,
      date: startDate,
      category: 'medication',
      content: `Medication: ${name} ${dosage}, Route: ${route}, Frequency: ${frequency}. Indication: ${indication}. Prescribed by ${prescriber} on ${startDate}. Instructions: ${instructions}. Sedation/Fall Warning: ${calculatedFallRisk ? 'YES - Beers criteria or high fall risk sedative' : 'No'}.`,
      metadata: {
        medicationId: newMed.id,
        fallRisk: calculatedFallRisk,
        sedationRisk: calculatedSedationRisk,
      },
    });

    // 4. Log Audit Entry
    await prisma.auditEntry.create({
      data: {
        patientId: targetPatientId,
        timestamp: new Date().toISOString(),
        userId: prescriberId,
        userName: prescriber,
        userRole: 'doctor',
        eventType: 'create',
        action: `Prescribed ${name} ${dosage}`,
        resource: 'Medication Registry',
        details: `Prescription added: ${frequency}, indication: ${indication}. Beers fall alert: ${calculatedFallRisk}`,
        purposeOfUse: 'Direct Clinical Patient Care',
        status: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      medication: {
        id: newMed.id,
        patientId: newMed.patientId,
        name: newMed.name,
        genericName: newMed.genericName,
        dosage: newMed.dosage,
        frequency: newMed.frequency,
        route: newMed.route,
        indication: newMed.indication,
        status: newMed.status,
        startDate: newMed.startDate,
        prescriber: newMed.prescriber,
        instructions: newMed.instructions,
        isRecentChange: newMed.isRecentChange,
        fallRiskWarning: newMed.fallRiskWarning,
        sedationRisk: newMed.sedationRisk,
      },
      timelineEventId: timelineEvent.id,
    });
  } catch (error) {
    console.error('Error in POST /api/medications:', error);
    return NextResponse.json({ error: 'Failed to prescribe medication' }, { status: 500 });
  }
}
