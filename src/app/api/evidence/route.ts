import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');
    const riskId = searchParams.get('riskId');
    const patientId = searchParams.get('patientId');

    if (id) {
      const snippet = await prisma.evidenceSnippet.findUnique({ where: { id } });
      if (!snippet) return NextResponse.json({ error: 'Evidence snippet not found' }, { status: 404 });
      return NextResponse.json({ evidence: snippet });
    }

    if (ids) {
      const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);
      const snippets = await prisma.evidenceSnippet.findMany({
        where: { id: { in: idList } },
      });
      return NextResponse.json({ evidence: snippets });
    }

    if (riskId) {
      const risk = await prisma.riskSignal.findUnique({ where: { id: riskId } });
      if (!risk || !risk.evidenceIds) {
        return NextResponse.json({ evidence: [] });
      }
      const parsedIds: string[] = JSON.parse(risk.evidenceIds);
      const snippets = await prisma.evidenceSnippet.findMany({
        where: { id: { in: parsedIds } },
      });
      return NextResponse.json({ evidence: snippets });
    }

    let targetPatientId: string | undefined = patientId || undefined;
    if (!targetPatientId) {
      const firstPatient = await prisma.patient.findFirst();
      targetPatientId = firstPatient?.id;
    }

    const snippets = await prisma.evidenceSnippet.findMany({
      where: targetPatientId ? { patientId: targetPatientId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ evidence: snippets });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json({ error: 'Failed to fetch evidence snippets' }, { status: 500 });
  }
}
