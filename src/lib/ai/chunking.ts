import { prisma } from '@/lib/db/prisma';

export interface ChunkInput {
  patientId: string;
  sourceType: 'document' | 'observation' | 'timeline' | 'medication' | 'profile';
  sourceId: string;
  title: string;
  date: string;
  category: string;
  content: string;
  metadata?: Record<string, any>;
}

export async function createRecordChunk(input: ChunkInput) {
  try {
    return await prisma.recordChunk.create({
      data: {
        patientId: input.patientId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        title: input.title,
        date: input.date,
        category: input.category,
        content: input.content.trim(),
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error creating record chunk:', error);
    return null;
  }
}

/**
 * Splits document text into manageable semantic sections (paragraphs or ~400 char segments)
 */
export function splitTextIntoChunks(text: string, maxChunkSize = 500): string[] {
  if (!text || text.trim() === '') return [];

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  if (paragraphs.length > 0) {
    return paragraphs;
  }

  // Fallback chunking by character boundary
  const chunks: string[] = [];
  let current = '';

  const sentences = text.split(/(?<=[.?!])\s+/);
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxChunkSize) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }

  if (current) chunks.push(current.trim());
  return chunks;
}
