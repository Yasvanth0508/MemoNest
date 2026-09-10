import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

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
      return NextResponse.json({ documents: [] });
    }

    const docs = await prisma.medicalDocument.findMany({
      where: { patientId: targetPatientId },
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, summary, keyFindings } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
    }

    const updated = await prisma.medicalDocument.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(summary && { summary }),
        ...(keyFindings && { keyFindings: JSON.stringify(keyFindings) }),
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
