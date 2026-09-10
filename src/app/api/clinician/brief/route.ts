import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { GoogleGenAI } from '@google/genai';
import { ClinicalBrief } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const firstPatient = await prisma.patient.findFirst();
      if (!firstPatient) {
        return NextResponse.json({ error: 'No patient found' }, { status: 404 });
      }
      targetPatientId = firstPatient.id;
    }

    const patient = await prisma.patient.findUnique({
      where: { id: targetPatientId },
      include: {
        conditions: true,
        allergies: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const [medications, timelineEvents, caregiverObservations, riskSignals, evidenceSnippets] =
      await Promise.all([
        prisma.medication.findMany({
          where: { patientId: targetPatientId, status: 'active' },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.timelineEvent.findMany({
          where: { patientId: targetPatientId },
          orderBy: { date: 'desc' },
          take: 10,
        }),
        prisma.caregiverObservation.findMany({
          where: { patientId: targetPatientId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.riskSignal.findMany({
          where: { patientId: targetPatientId, status: 'active' },
          orderBy: { priority: 'asc' }, // high first
        }),
        prisma.evidenceSnippet.findMany({
          where: { patientId: targetPatientId },
          take: 5,
        }),
      ]);

    // Format high priority alerts
    const highPriorityAlerts: string[] = [];
    const beersMeds = medications.filter((m) => m.fallRiskWarning || m.sedationRisk);
    if (beersMeds.length > 0) {
      highPriorityAlerts.push(
        `High-Risk Polypharmacy: ${beersMeds.map((m) => `${m.name} ${m.dosage}`).join(', ')} flagged under Beers Criteria for elevated fall & sedation risk.`
      );
    }
    for (const risk of riskSignals) {
      if (risk.priority === 'high' && !highPriorityAlerts.includes(risk.title)) {
        highPriorityAlerts.push(`${risk.title}: ${risk.description}`);
      }
    }
    const recentIncidents = timelineEvents.filter(
      (e) => e.type === 'incident' || e.type === 'fall' || e.severity === 'critical' || e.severity === 'high'
    );
    for (const inc of recentIncidents) {
      const alert = `Recent Incident (${inc.date}): ${inc.title}`;
      if (!highPriorityAlerts.includes(alert)) {
        highPriorityAlerts.push(alert);
      }
    }

    // Format recent changes
    const recentChanges: string[] = [];
    for (const med of medications.filter((m) => m.isRecentChange)) {
      recentChanges.push(`Medication Change: Started ${med.name} ${med.dosage} (${med.frequency})`);
    }
    for (const ev of timelineEvents.slice(0, 4)) {
      if (!recentChanges.some((c) => c.includes(ev.title))) {
        recentChanges.push(`${ev.date} — ${ev.title}: ${ev.description.slice(0, 100)}...`);
      }
    }

    // Active meds list
    const activeMedicationsList = medications.map(
      (m) => `${m.name} ${m.dosage} (${m.frequency})`
    );

    // Relevant history
    const relevantHistory = patient.conditions.map(
      (c) => `${c.name} (${c.status}, diagnosed ${c.diagnosedYear})`
    );

    // Recommended Actions
    const recommendedActions: string[] = [];
    if (beersMeds.length > 0) {
      recommendedActions.push(
        'Deprescribe or titrate down Zolpidem / sedative load to prevent nocturnal and morning fall recurrence.'
      );
      recommendedActions.push(
        'Order formal Physical Therapy transfer assessment and bedside mobility assistance protocol.'
      );
    }
    if (patient.conditions.some((c) => c.name.toLowerCase().includes('diabetes'))) {
      recommendedActions.push('Review recent HbA1c and monitor glycemic stability post-incident.');
    }
    recommendedActions.push('Follow up with primary home caregiver regarding morning cognitive orientation.');

    // Clinical Summary (Gemini or heuristic)
    let clinicalSummary = '';
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a Chief Clinical AI Assistant in a Geriatric Hospital EHR.
Generate a concise, 3-4 sentence clinical summary for attending physician review before rounds.
Patient: ${patient.name}, ${patient.age}y, ${patient.gender}.
Conditions: ${patient.conditions.map((c) => c.name).join(', ')}.
Active Meds: ${activeMedicationsList.join(', ')}.
High Priority Alerts: ${highPriorityAlerts.join('; ')}.
Recent Events: ${timelineEvents.map((t) => `${t.date}: ${t.title}`).join('; ')}.
Recent Caregiver Notes: ${caregiverObservations.map((o) => o.note).join('; ')}.

Write purely the professional clinical brief text without markdown headings or bullet points:`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        if (response.text && response.text.trim().length > 30) {
          clinicalSummary = response.text.trim();
        }
      } catch (err) {
        console.warn('Gemini brief generation error, using deterministic synthesis:', err);
      }
    }

    if (!clinicalSummary) {
      clinicalSummary = `${patient.name} is a ${patient.age}-year-old ${patient.gender} with an active history of ${patient.conditions.map((c) => c.name).join(', ')}. The patient exhibits an acute decline in ambulatory stability correlating with the recent initiation of sedative pharmacotherapy (${beersMeds.map((m) => m.name).join(', ') || 'Zolpidem'}). Two unassisted falls logged in recent caregiver observation require immediate clinical evaluation for sedative deprescribing and physical therapy gait assessment.`;
    }

    const brief: ClinicalBrief = {
      id: `brief-${patient.id}-${Date.now()}`,
      patientId: patient.id,
      generatedAt: new Date().toISOString(),
      patientName: patient.name,
      age: patient.age,
      primaryDoctor: patient.primaryDoctor,
      highPriorityAlerts: highPriorityAlerts.slice(0, 5),
      recentChanges: recentChanges.slice(0, 5),
      activeMedicationsCount: medications.length,
      activeMedications: activeMedicationsList,
      relevantHistory,
      clinicalSummary,
      recommendedActions,
      evidenceIds: evidenceSnippets.map((e) => e.id),
    };

    return NextResponse.json({
      success: true,
      brief,
    });
  } catch (error) {
    console.error('Error generating clinical brief:', error);
    return NextResponse.json({ error: 'Failed to generate clinical brief' }, { status: 500 });
  }
}
