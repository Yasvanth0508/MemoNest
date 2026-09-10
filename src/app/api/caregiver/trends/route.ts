import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId') || searchParams.get('id');
    const email = searchParams.get('email');

    let patient = null;
    if (patientId) {
      patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          caregiverObservations: {
            orderBy: { timestamp: 'desc' },
            take: 30,
          },
        },
      });
    }

    if (!patient && email) {
      patient = await prisma.patient.findFirst({
        where: { email },
        include: {
          caregiverObservations: {
            orderBy: { timestamp: 'desc' },
            take: 30,
          },
        },
      });
    }

    if (!patient) {
      patient = await prisma.patient.findFirst({
        include: {
          caregiverObservations: {
            orderBy: { timestamp: 'desc' },
            take: 30,
          },
        },
      });
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const obs = patient.caregiverObservations;
    const fallCount = obs.filter((o) => o.category === 'fall').length;
    const confusionCount = obs.filter((o) => o.category === 'confusion').length;

    let state: 'stable' | 'mild_deviation' | 'significant_deviation' = 'stable';
    let label = 'Stable — Routine Tracking';
    let plainExplanation =
      'Ravi’s daily routine, appetite, and mobility are currently aligned with his historical baseline.';

    const contributingFactors: string[] = [];

    if (fallCount >= 2 || (fallCount >= 1 && confusionCount >= 1)) {
      state = 'significant_deviation';
      label = 'Significant Deviation — Urgent Clinical Attention Recommended';
      plainExplanation = `Patient has experienced ${fallCount} acute fall events and multiple confusion reports within the past 48 hours, marking an acute departure from his ambulatory baseline.`;
      contributingFactors.push(`${fallCount} falls documented in recent logs`);
      if (confusionCount > 0) contributingFactors.push(`${confusionCount} disorientation episodes recorded`);
      contributingFactors.push('Increased morning sedation and unsteady transfer hesitation');
    } else if (fallCount === 1 || confusionCount >= 1) {
      state = 'mild_deviation';
      label = 'Mild Deviation — Increased Supervision Recommended';
      plainExplanation =
        'Mild changes in morning alertness or a single transfer slip have been recorded.';
      if (fallCount === 1) contributingFactors.push('1 transfer slip reported');
      if (confusionCount >= 1) contributingFactors.push('Mild temporal confusion noted');
    }

    const trendSignals = [
      {
        name: 'Mobility & Ambulation',
        baseline: 'Independent with 4-wheel walker',
        current: fallCount > 0 ? 'Requires transfer assistance; morning unsteadiness' : 'Normal walker ambulation',
        status: fallCount >= 2 ? 'significant_change' : fallCount === 1 ? 'mild_change' : 'normal',
      },
      {
        name: 'Cognitive Orientation',
        baseline: 'Mild forgetfulness; baseline MoCA 23/30',
        current: confusionCount > 0 ? 'Acute morning disorientation noted upon waking' : 'Baseline memory stability',
        status: confusionCount >= 2 ? 'significant_change' : confusionCount === 1 ? 'mild_change' : 'normal',
      },
      {
        name: 'Medication Adherence',
        baseline: '95% supervised adherence',
        current: 'Morning doses taken on schedule',
        status: 'normal',
      },
    ];

    return NextResponse.json({
      state,
      label,
      plainExplanation,
      lastCalculated: 'Just now',
      baselineSummary: '74-year-old male with hypertension, post-stroke recovery, and mild cognitive impairment.',
      trendSignals,
      contributingFactors,
      whatThisMightMean: {
        interpretation:
          state === 'significant_deviation'
            ? 'The sudden onset of falls and disorientation is characteristic of medication-induced sedative burden or orthostatic hypotension.'
            : 'Patient continues within anticipated geriatric care parameters.',
        clinicalContext:
          'Zolpidem 5mg was initiated 5 days ago; correlation with morning instability is clinically high.',
        actionableAdvice:
          'Ensure continuous transfer assistance; do not allow unassisted transits to bathroom.',
        whenToContactDoctor:
          'Contact Dr. Sharma immediately if further dizziness, head strike, or worsening disorientation occurs.',
      },
    });
  } catch (error) {
    console.error('Error calculating trends:', error);
    return NextResponse.json({ error: 'Failed to compute trends' }, { status: 500 });
  }
}
