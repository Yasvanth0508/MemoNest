import { TimelineEvent } from '@/types';
import { mockTimelineEvents } from '@/data/mock';

const simulateDelay = (min = 50, max = 150): Promise<void> => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let timelineStore: TimelineEvent[] = JSON.parse(JSON.stringify(mockTimelineEvents));

export const timelineService = {
  async getTimelineEvents(
    patientId?: string,
    category?: string,
    search?: string
  ): Promise<TimelineEvent[]> {
    await simulateDelay();
    let events = [...timelineStore];

    if (patientId) {
      events = events.filter((e) => e.patientId === patientId);
    }

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      events = events.filter(
        (e) =>
          e.category?.toLowerCase() === catLower ||
          ((e as unknown as Record<string, unknown>).type as string | undefined)?.toLowerCase() === catLower
      );
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.sourceType && String(e.sourceType).toLowerCase().includes(q))
      );
    }

    // Return sorted newest to oldest
    return JSON.parse(
      JSON.stringify(
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
    );
  },

  async getTimelineEventById(eventId: string): Promise<TimelineEvent | null> {
    await simulateDelay();
    const found = timelineStore.find((e) => e.id === eventId);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  },
};

export const { getTimelineEvents, getTimelineEventById } = timelineService;
