import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ravi@healthmemory.demo';

    let patient = await prisma.patient.findFirst({ where: { email } });
    if (!patient) {
      patient = await prisma.patient.findFirst();
    }

    if (!patient) {
      return NextResponse.json({ documents: [] });
    }

    const docs = await prisma.medicalDocument.findMany({
      where: { patientId: patient.id },
      include: {
        evidenceSnippets: true,
      },
      orderBy: { date: 'desc' },
    });

    const formattedDocs = docs.map((d) => ({
      id: d.id,
      patientId: d.patientId,
      title: d.title,
      type: d.type,
      date: d.date,
      facility: d.facility,
      author: d.author,
      fileType: d.fileType,
      fileSize: d.fileSize,
      fileUrl: d.fileUrl || undefined,
      summary: d.summary,
      keyFindings: d.keyFindings ? JSON.parse(d.keyFindings) : [],
      extractedEntities: d.extractedEntities ? JSON.parse(d.extractedEntities) : [],
      evidenceSnippets: d.evidenceSnippets.map((ev) => ev.id),
    }));

    return NextResponse.json({ documents: formattedDocs });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
