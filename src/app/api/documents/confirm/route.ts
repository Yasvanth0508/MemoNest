import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createRecordChunk, splitTextIntoChunks } from '@/lib/ai/chunking';
import { DocumentType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      patientEmail,
      title,
      reportType,
      date,
      facility,
      provider,
      summary,
      diagnosis,
      diagnoses,
      medication,
      medications,
      keyFindings,
      fileUrl,
      fileSize,
      fileType,
      evidenceSnippets,
    } = body;

    let targetPatient = null;
    if (patientId) {
      targetPatient = await prisma.patient.findUnique({ where: { id: patientId } });
    } else if (patientEmail) {
      targetPatient = await prisma.patient.findFirst({ where: { email: patientEmail } });
    } else {
      targetPatient = await prisma.patient.findFirst();
    }

    if (!targetPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const docType: DocumentType = (reportType?.toLowerCase().replace(/ /g, '_') as DocumentType) || 'clinical_note';
    const cleanDate = date || new Date().toISOString().split('T')[0];

    const diagList: string[] = Array.isArray(diagnoses)
      ? diagnoses
      : diagnosis
      ? diagnosis.split(',').map((d: string) => d.trim())
      : [];

    const findingsList: string[] = Array.isArray(keyFindings)
      ? keyFindings
      : [summary || 'Document reviewed and committed.'];

    // 1. Create MedicalDocument
    const newDoc = await prisma.medicalDocument.create({
      data: {
        patientId: targetPatient.id,
        title: title || 'Clinical Medical Document',
        type: docType,
        date: cleanDate,
        facility: facility || 'MetroHealth Diagnostic & Clinical Pavilion',
        author: provider || 'Reviewing Clinician',
        fileType: fileType || 'PDF',
        fileSize: fileSize || '1.2 MB',
        fileUrl: fileUrl || null,
        summary: summary || 'Document extracted and committed to health memory.',
        keyFindings: JSON.stringify(findingsList),
        extractedEntities: JSON.stringify(diagList),
      },
    });

    // 2. Create Timeline Event
    const timelineEvent = await prisma.timelineEvent.create({
      data: {
        patientId: targetPatient.id,
        date: cleanDate,
        time: '10:00',
        type: docType === 'lab_report' ? 'lab_result' : docType === 'prescription' ? 'medication_change' : 'routine_visit',
        category: docType === 'lab_report' ? 'labs' : docType === 'prescription' ? 'medication' : 'medical',
        title: title || 'New Clinical Document Added',
        description: summary || `Confirmed ${docType} from ${facility || 'healthcare clinic'}.`,
        severity: 'low',
        sourceType: docType,
        sourceId: newDoc.id,
        author: provider || 'Healthcare Provider',
        authorRole: 'Clinical Provider',
      },
    });

    // 3. Create Grounded Evidence Snippets
    const evidenceIds: string[] = [];
    if (Array.isArray(evidenceSnippets) && evidenceSnippets.length > 0) {
      for (const ev of evidenceSnippets) {
        const snippet = await prisma.evidenceSnippet.create({
          data: {
            patientId: targetPatient.id,
            documentId: newDoc.id,
            documentTitle: newDoc.title,
            documentDate: newDoc.date,
            sourceType: docType,
            quote: ev.quote || summary || 'Evidence excerpt.',
            context: ev.context || `Extracted from ${newDoc.title}`,
            linkedEntity: ev.linkedEntity || diagList[0] || 'Medical Record',
            confidenceScore: ev.confidenceScore || 0.98,
            pageNumber: ev.pageNumber || 1,
            author: newDoc.author,
          },
        });
        evidenceIds.push(snippet.id);
      }
    } else {
      const defaultSnippet = await prisma.evidenceSnippet.create({
        data: {
          patientId: targetPatient.id,
          documentId: newDoc.id,
          documentTitle: newDoc.title,
          documentDate: newDoc.date,
          sourceType: docType,
          quote: summary || 'Document findings reviewed and validated.',
          context: 'Document Key Findings',
          linkedEntity: diagList[0] || 'Health Record',
          confidenceScore: 0.98,
          pageNumber: 1,
          author: newDoc.author,
        },
      });
      evidenceIds.push(defaultSnippet.id);
    }

    // Link evidence to timeline event
    await prisma.timelineEvent.update({
      where: { id: timelineEvent.id },
      data: { evidenceId: evidenceIds[0] },
    });

    // 4. Chunk document and index into RecordChunk for the Doctor AI Chatbot
    const chunks = splitTextIntoChunks(summary || title);
    for (let i = 0; i < chunks.length; i++) {
      await createRecordChunk({
        patientId: targetPatient.id,
        sourceType: 'document',
        sourceId: newDoc.id,
        title: `${newDoc.title} (Part ${i + 1})`,
        date: cleanDate,
        category: docType,
        content: `Document: ${newDoc.title}. Date: ${cleanDate}. Facility: ${newDoc.facility}. Provider: ${newDoc.author}. Text: ${chunks[i]}. Diagnoses: ${diagList.join(', ')}. Key Findings: ${findingsList.join('; ')}.`,
        metadata: {
          documentId: newDoc.id,
          docType,
          evidenceId: evidenceIds[0],
        },
      });
    }

    // 5. Create Patient Notification
    await prisma.patientNotification.create({
      data: {
        patientId: targetPatient.id,
        category: 'health_record',
        title: 'New medical document added to your timeline',
        message: `${newDoc.title} confirmed and added to your unified health record.`,
        timestamp: new Date().toISOString(),
        severity: 'info',
        isRead: false,
        actionLabel: 'View Timeline',
        actionUrl: '/patient/timeline',
        source: newDoc.facility,
      },
    });

    // 6. Record Audit Entry
    await prisma.auditEntry.create({
      data: {
        patientId: targetPatient.id,
        timestamp: new Date().toISOString(),
        userId: 'system-upload',
        userName: provider || targetPatient.name,
        userRole: 'patient',
        eventType: 'create',
        action: `Uploaded and Confirmed ${newDoc.title}`,
        resource: 'Medical Document Repository',
        details: `OCR parsed and confirmed: ${docType} with ${diagList.length} entities and ${evidenceIds.length} evidence snippets.`,
        purposeOfUse: 'Longitudinal health memory ingestion',
        status: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      document: newDoc,
      timelineEvent,
      evidenceIds,
    });
  } catch (error) {
    console.error('Error confirming document:', error);
    return NextResponse.json(
      { error: 'Failed to commit confirmed document to database.' },
      { status: 500 }
    );
  }
}
