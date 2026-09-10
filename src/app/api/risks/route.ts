import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const email = searchParams.get('email');
    const riskId = searchParams.get('id');

    if (riskId) {
      const r = await prisma.riskSignal.findUnique({ where: { id: riskId } });
      if (!r) return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
      return NextResponse.json({
        risk: {
          id: r.id,
          patientId: r.patientId,
          title: r.title,
          priority: r.priority,
          category: r.category,
          description: r.description,
          factors: r.factors ? JSON.parse(r.factors) : [],
          evidenceIds: r.evidenceIds ? JSON.parse(r.evidenceIds) : [],
          recommendations: r.recommendations ? JSON.parse(r.recommendations) : [],
          detectedAt: r.detectedAt,
          confidence: r.confidence || 'high',
          status: r.status,
        },
      });
    }

    let targetPatientId: string | undefined = patientId || undefined;
    if (!targetPatientId && email) {
      const p = await prisma.patient.findFirst({ where: { email } });
      targetPatientId = p?.id || undefined;
    }
    if (!targetPatientId) {
      const p = await prisma.patient.findFirst();
      targetPatientId = p?.id || undefined;
    }

    const risks = await prisma.riskSignal.findMany({
      where: targetPatientId ? { patientId: targetPatientId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      risks: risks.map((r) => ({
        id: r.id,
        patientId: r.patientId,
        title: r.title,
        priority: r.priority,
        category: r.category,
        description: r.description,
        factors: r.factors ? JSON.parse(r.factors) : [],
        evidenceIds: r.evidenceIds ? JSON.parse(r.evidenceIds) : [],
        recommendations: r.recommendations ? JSON.parse(r.recommendations) : [],
        detectedAt: r.detectedAt,
        confidence: r.confidence || 'high',
        status: r.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching risks:', error);
    return NextResponse.json({ error: 'Failed to fetch risk signals' }, { status: 500 });
  }
}
