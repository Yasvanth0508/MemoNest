export type RiskPriority = 'high' | 'medium' | 'low';

export type RiskCategory =
  | 'falls'
  | 'medication'
  | 'cognitive'
  | 'mobility'
  | 'cardiovascular'
  | 'general';

export interface RiskSignal {
  id: string;
  patientId: string;
  title: string;
  priority: RiskPriority;
  category: RiskCategory;
  description: string;
  factors: string[];
  evidenceIds: string[];
  recommendations: string[];
  detectedAt: string;
  confidence?: string;
  status: 'active' | 'monitoring' | 'resolved';
}
