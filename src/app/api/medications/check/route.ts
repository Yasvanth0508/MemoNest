import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, medicationName, dosage } = body;

    if (!medicationName) {
      return NextResponse.json({ error: 'Medication name is required.' }, { status: 400 });
    }

    let targetPatientId = patientId;
    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id || 'patient-001';
    }

    const activeMeds = await prisma.medication.findMany({
      where: { patientId: targetPatientId, status: 'active' },
    });

    const activeConditions = await prisma.condition.findMany({
      where: { patientId: targetPatientId, status: 'active' },
    });

    const newMedLower = medicationName.toLowerCase();

    const warnings: string[] = [];
    const recommendations: string[] = [];
    let isHighRisk = false;
    let beersFlag = false;

    // 1. Beers Criteria Evaluation
    const BEERS_SEDATIVES = ['zolpidem', 'eszopiclone', 'zaleplon', 'alprazolam', 'lorazepam', 'diazepam', 'temazepam'];
    const BEERS_ANTICHOLINERGICS = ['diphenhydramine', 'hydroxyzine', 'amitriptyline', 'oxybutynin'];
    const BEERS_NSAIDS = ['ibuprofen', 'naproxen', 'ketorolac', 'indomethacin', 'meloxicam'];

    if (BEERS_SEDATIVES.some((s) => newMedLower.includes(s))) {
      isHighRisk = true;
      beersFlag = true;
      warnings.push(
        `BEERS CRITERIA ALERT: ${medicationName} is a Z-drug / benzodiazepine-receptor sedative with documented high risk of nocturnal delirium, ataxia, and fall compounding in geriatric patients.`
      );
      recommendations.push(
        'Consider cognitive-behavioral sleep hygiene or lower-risk alternatives (e.g. low-dose Melatonin) before initiating Z-drugs in an elderly patient with prior falls.'
      );
    }

    if (BEERS_ANTICHOLINERGICS.some((s) => newMedLower.includes(s))) {
      isHighRisk = true;
      beersFlag = true;
      warnings.push(
        `BEERS CRITERIA ALERT: Anticholinergic burden from ${medicationName} carries strong risk of urinary retention, acute cognitive decline, and increased confusion in patients with MCI.`
      );
    }

    // 2. Drug-Drug Interactions
    if (newMedLower.includes('zolpidem')) {
      const hasAntihypertensive = activeMeds.some((m) =>
        ['amlodipine', 'lisinopril', 'losartan', 'metoprolol'].some((h) => m.name.toLowerCase().includes(h))
      );
      if (hasAntihypertensive) {
        warnings.push(
          'INTERACTION WARNING: Co-administration of Zolpidem with vasodilators/antihypertensives (Amlodipine) increases the risk of severe early-morning postural orthostatic hypotension and transfer-related slips.'
        );
      }
    }

    // 3. Drug-Disease Contraindications
    const hasMci = activeConditions.some((c) => c.name.toLowerCase().includes('cognitive') || c.name.toLowerCase().includes('mci'));
    if (hasMci && (beersFlag || newMedLower.includes('sedat'))) {
      warnings.push(
        'CONTRAINDICATION CAUTION: Patient has documented Mild Cognitive Impairment (MoCA 23/30). Central nervous system depressants accelerate acute confusion and temporal disorientation.'
      );
    }

    if (BEERS_NSAIDS.some((n) => newMedLower.includes(n))) {
      const hasCkd = activeConditions.some((c) => c.name.toLowerCase().includes('kidney') || c.name.toLowerCase().includes('ckd'));
      const hasStroke = activeConditions.some((c) => c.name.toLowerCase().includes('stroke'));
      if (hasCkd) {
        isHighRisk = true;
        warnings.push('RENAL SAFETY WARNING: NSAIDs are contraindicated with Stage 2/3 CKD due to risk of acute kidney injury.');
      }
      if (hasStroke) {
        warnings.push('BLEEDING RISK: NSAIDs combined with antiplatelet therapy (Aspirin 81mg) substantially increase GI bleeding hazard.');
      }
    }

    return NextResponse.json({
      medicationName,
      dosage: dosage || 'Standard',
      activeMedicationsCount: activeMeds.length,
      isHighRisk,
      beersCriteriaFlag: beersFlag,
      warnings,
      recommendations,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Polypharmacy check error:', error);
    return NextResponse.json({ error: 'Failed to run polypharmacy check' }, { status: 500 });
  }
}
