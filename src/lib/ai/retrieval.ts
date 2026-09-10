import { prisma } from '@/lib/db/prisma';

export interface RetrievedChunk {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  date: string;
  category: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

/**
 * Semantic chunk retrieval over patient longitudinal records.
 * Matches clinical query terms, categories, and entities against the patient's RecordChunk table.
 */
export async function retrievePatientChunks(
  patientId: string,
  queryText: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  try {
    const allChunks = await prisma.recordChunk.findMany({
      where: { patientId },
    });

    if (!allChunks || allChunks.length === 0) {
      return [];
    }

    const queryTerms = queryText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const scored = allChunks.map((chunk) => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.title.toLowerCase();
      const catLower = chunk.category.toLowerCase();

      for (const term of queryTerms) {
        if (titleLower.includes(term)) score += 3.0;
        if (catLower.includes(term)) score += 2.5;
        if (contentLower.includes(term)) {
          // Count occurrences
          const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
          score += Math.min(matches * 1.0, 4.0);
        }
      }

      // Domain-specific clinical semantic associations
      if (queryText.toLowerCase().includes('fall') || queryText.toLowerCase().includes('mobility')) {
        if (catLower.includes('fall') || contentLower.includes('slip') || contentLower.includes('zolpidem')) {
          score += 4.0;
        }
      }

      if (queryText.toLowerCase().includes('adherence') || queryText.toLowerCase().includes('medication')) {
        if (catLower.includes('medication') || contentLower.includes('dose') || contentLower.includes('adherence')) {
          score += 4.0;
        }
      }

      if (queryText.toLowerCase().includes('cognitive') || queryText.toLowerCase().includes('confusion') || queryText.toLowerCase().includes('memory')) {
        if (catLower.includes('cognitive') || contentLower.includes('moca') || contentLower.includes('disorientation')) {
          score += 4.0;
        }
      }

      // Small recency bonus
      const chunkDate = new Date(chunk.date).getTime();
      if (!isNaN(chunkDate)) {
        const daysAgo = (Date.now() - chunkDate) / (1000 * 60 * 60 * 24);
        if (daysAgo < 30) score += 1.5;
        else if (daysAgo < 180) score += 0.8;
      }

      return {
        id: chunk.id,
        sourceType: chunk.sourceType,
        sourceId: chunk.sourceId,
        title: chunk.title,
        date: chunk.date,
        category: chunk.category,
        content: chunk.content,
        score,
        metadata: chunk.metadata ? JSON.parse(chunk.metadata) : undefined,
      };
    });

    // Sort by descending score
    scored.sort((a, b) => b.score - a.score);

    // Filter to positive match or top items
    const results = scored.slice(0, topK);
    return results;
  } catch (error) {
    console.error('Error retrieving patient chunks:', error);
    return [];
  }
}
