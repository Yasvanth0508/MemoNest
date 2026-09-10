import { TimelineEvent } from '@/types';
import { mockTimelineEvents } from '@/data/mock/timeline';

export const timelineApiService = {
  async getTimelineEvents(
    patientId?: string,
    category?: string,
    search?: string
  ): Promise<TimelineEvent[]> {
    try {
      let savedEmail = 'ravi@healthmemory.demo';
      if (typeof window !== 'undefined') {
        savedEmail = window.localStorage.getItem('active_patient_email') || savedEmail;
      }

      const params = new URLSearchParams();
      params.set('email', savedEmail);
      if (category && category !== 'all') {
        params.set('category', category);
      }

      const res = await fetch(`/api/timeline?${params.toString()}`);
      if (!res.ok) {
        return mockTimelineEvents;
      }

      const data = await res.json();
      let events: TimelineEvent[] = data.events || [];

      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            (e.sourceType && String(e.sourceType).toLowerCase().includes(q))
        );
      }

      return events;
    } catch {
      return mockTimelineEvents;
    }
  },

  async getTimelineEventById(eventId: string): Promise<TimelineEvent | null> {
    const events = await this.getTimelineEvents();
    return events.find((e) => e.id === eventId) || null;
  },

  async addTimelineEvent(event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const res = await fetch('/api/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      throw new Error('Failed to create timeline event');
    }

    const data = await res.json();
    return data.event;
  },
};
