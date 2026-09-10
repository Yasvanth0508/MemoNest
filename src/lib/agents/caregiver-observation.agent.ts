import { GoogleGenAI } from '@google/genai';
import { ObservationCategory } from '@/types';

export interface ProcessedObservation {
  category: ObservationCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  incidentReported: boolean;
  location?: string;
  actionTaken?: string;
  vitalsChecked: boolean;
  extractedSignals: string[];
  urgencyAlert: boolean;
}

export class CaregiverObservationAgent {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  public async process(
    rawText: string,
    suggestedCategory?: ObservationCategory,
    suggestedSeverity?: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<ProcessedObservation> {
    if (this.ai) {
      try {
        return await this.processWithGemini(rawText, suggestedCategory, suggestedSeverity);
      } catch (err) {
        console.warn('Gemini observation processing error, falling back to heuristic:', err);
      }
    }
    return this.processWithHeuristics(rawText, suggestedCategory, suggestedSeverity);
  }

  private async processWithGemini(
    rawText: string,
    suggestedCategory?: ObservationCategory,
    suggestedSeverity?: string
  ): Promise<ProcessedObservation> {
    const prompt = `You are a clinical AI agent analyzing an unstructured caregiver observation note or voice transcription for an elderly patient.
Extract the clinical facts and return a strictly valid JSON object matching this schema:
{
  "category": "fall" | "mobility" | "confusion" | "drowsiness" | "appetite" | "behavior" | "medication_adherence" | "physical_symptom" | "general",
  "severity": "low" | "medium" | "high" | "critical",
  "summary": "Concise 1-2 sentence clinical summary of what occurred",
  "incidentReported": boolean,
  "location": "where event occurred if mentioned",
  "actionTaken": "what the caregiver did in response",
  "vitalsChecked": boolean,
  "extractedSignals": ["signal1", "signal2"],
  "urgencyAlert": boolean
}

Raw caregiver observation:
"""
${rawText}
"""
Suggested category from UI: ${suggestedCategory || 'unknown'}
Suggested severity from UI: ${suggestedSeverity || 'unknown'}
`;

    const response = await this.ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return {
      category: parsed.category || suggestedCategory || 'general',
      severity: parsed.severity || suggestedSeverity || 'low',
      summary: parsed.summary || rawText.substring(0, 150),
      incidentReported: Boolean(parsed.incidentReported || parsed.category === 'fall'),
      location: parsed.location || undefined,
      actionTaken: parsed.actionTaken || undefined,
      vitalsChecked: Boolean(parsed.vitalsChecked),
      extractedSignals: parsed.extractedSignals || [],
      urgencyAlert: Boolean(parsed.urgencyAlert || parsed.severity === 'critical' || parsed.category === 'fall'),
    };
  }

  private processWithHeuristics(
    rawText: string,
    suggestedCategory?: ObservationCategory,
    suggestedSeverity?: 'low' | 'medium' | 'high' | 'critical'
  ): ProcessedObservation {
    const lower = rawText.toLowerCase();

    const isFall = lower.includes('fall') || lower.includes('slipped') || lower.includes('fell') || lower.includes('tripped') || lower.includes('buckled');
    const isConfusion = lower.includes('confus') || lower.includes('disorient') || lower.includes('forgot') || lower.includes('wandering') || lower.includes('hallucinat');
    const isDrowsiness = lower.includes('sleep') || lower.includes('drows') || lower.includes('grogg') || lower.includes('letharg') || lower.includes('sedat');
    const isMed = lower.includes('pill') || lower.includes('medicat') || lower.includes('dose') || lower.includes('tablet') || lower.includes('refus');
    const isAppetite = lower.includes('eat') || lower.includes('appetite') || lower.includes('meal') || lower.includes('drink') || lower.includes('hydrat');
    const isMobility = lower.includes('walk') || lower.includes('transfer') || lower.includes('walker') || lower.includes('wheelchair') || lower.includes('cane') || lower.includes('unsteady');

    let category: ObservationCategory = suggestedCategory || 'general';
    if (isFall) category = 'fall';
    else if (isConfusion) category = 'confusion';
    else if (isMobility) category = 'mobility';
    else if (isMed) category = 'medication_adherence';
    else if (isDrowsiness) category = 'drowsiness';
    else if (isAppetite) category = 'appetite';

    let severity: 'low' | 'medium' | 'high' | 'critical' = suggestedSeverity || 'low';
    if (isFall && (lower.includes('head') || lower.includes('unconscious') || lower.includes('second fall') || lower.includes('er') || lower.includes('hospital'))) {
      severity = 'critical';
    } else if (isFall) {
      severity = 'high';
    } else if (isConfusion && (lower.includes('severe') || lower.includes('delirium') || lower.includes('acute'))) {
      severity = 'high';
    } else if (lower.includes('pain') || lower.includes('dizzy') || lower.includes('unsteady')) {
      severity = 'medium';
    }

    let location: string | undefined;
    if (lower.includes('bathroom')) location = 'Bathroom';
    else if (lower.includes('bedroom') || lower.includes('bedside')) location = 'Bedroom / Bedside';
    else if (lower.includes('kitchen')) location = 'Kitchen';
    else if (lower.includes('hallway')) location = 'Hallway';
    else if (lower.includes('living room')) location = 'Living Room';

    let actionTaken: string | undefined;
    if (lower.includes('assisted') || lower.includes('helped')) {
      actionTaken = 'Caregiver assisted patient and ensured physical safety.';
    } else if (lower.includes('ice') || lower.includes('compress')) {
      actionTaken = 'Applied cold compress to affected area.';
    }

    const vitalsChecked = lower.includes('bp') || lower.includes('blood pressure') || lower.includes('pulse') || lower.includes('vitals') || lower.includes('oxygen');

    const signals: string[] = [];
    if (isFall) signals.push('Acute Fall Event');
    if (isConfusion) signals.push('Cognitive Disorientation');
    if (lower.includes('dizzy')) signals.push('Morning Dizziness / Orthostasis');
    if (lower.includes('contusion') || lower.includes('bruise')) signals.push('Minor Soft-Tissue Contusion');

    const summary = `${category.replace('_', ' ').toUpperCase()}: ${rawText.substring(0, 160)}${rawText.length > 160 ? '...' : ''}`;

    return {
      category,
      severity,
      summary,
      incidentReported: isFall || severity === 'high' || severity === 'critical',
      location,
      actionTaken,
      vitalsChecked,
      extractedSignals: signals,
      urgencyAlert: isFall || severity === 'high' || severity === 'critical',
    };
  }
}

export const caregiverObservationAgent = new CaregiverObservationAgent();
