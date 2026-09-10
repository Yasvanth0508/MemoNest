import { TimelineEvent } from '@/types';

export const timelineApiService = {
  async getTimelineEvents(
    patientId?: string,
    category?: string,
    search?: string
  ): Promise<TimelineEvent[]> {
    try {
      const params = new URLSearchParams();
      if (patientId) {
        params.set('patientId', patientId);
      } else if (typeof window !== 'undefined') {
        const savedEmail = window.localStorage.getItem('active_patient_email');
        if (savedEmail) {
          params.set('email', savedEmail);
        }
      }

      if (category && category !== 'all') {
        params.set('category', category);
      }

      const res = await fetch(`/api/timeline?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch timeline events (Status: ${res.status})`);
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
    } catch (err) {
      console.error('timelineApiService.getTimelineEvents error:', err);
      return [];
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
