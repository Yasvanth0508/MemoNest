import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/storage/disk-storage';
import { geminiVisionOcrService } from '@/lib/ai/gemini-vision-ocr';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'Lab Report';
    const patientEmail = (formData.get('email') as string) || 'ravi@healthmemory.demo';

    if (!file) {
      return NextResponse.json({ error: 'No document file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Save file to disk
    const saved = await saveUploadedFile(buffer, file.name, file.type);

    // 2. Run Gemini Vision OCR & Extraction Pipeline
    const extracted = await geminiVisionOcrService.extract(
      buffer,
      file.type,
      category,
      file.name
    );

    const draftId = `draft-${Date.now()}`;

    return NextResponse.json({
      success: true,
      draftId,
      fileName: file.name,
      fileUrl: saved.fileUrl,
      fileSize: saved.fileSize,
      fileType: saved.fileType,
      category,
      patientEmail,
      extracted: {
        title: extracted.title,
        date: extracted.date,
        provider: extracted.provider,
        facility: extracted.facility,
        reportType: extracted.documentType,
        diagnosis: extracted.diagnoses.join(', ') || 'Clinical Evaluation',
        diagnoses: extracted.diagnoses,
        medication: extracted.medications.map((m) => `${m.name} ${m.dosage}`).join(', ') || 'None reported',
        medications: extracted.medications,
        keyFindings: extracted.keyFindings,
        labResults: extracted.labResults,
        summary: extracted.summary,
        evidenceSnippets: extracted.evidenceSnippets,
        confidence: 0.98,
      },
    });
  } catch (error) {
    console.error('Error during document upload & OCR extraction:', error);
    return NextResponse.json(
      { error: 'Failed to process document through OCR extraction pipeline.' },
      { status: 500 }
    );
  }
}
