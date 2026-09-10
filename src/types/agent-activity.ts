export type AgentType =
  | 'medical_history'
  | 'medication'
  | 'cognitive'
  | 'functional'
  | 'risk_orchestrator'
  | 'brief_synthesis';

export interface AgentActivity {
  id: string;
  patientId: string;
  agentType: AgentType;
  agentName: string;
  timestamp: string;
  action: string;
  status: 'completed' | 'processing' | 'idle' | 'failed';
  details: string;
}
