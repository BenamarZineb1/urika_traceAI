export interface Trace {
  trace_id: string;
  timestamp: string;
  service: string;
  endpoint: string;
  duration_ms: number;
  status: 'ok' | 'slow' | 'error';
  message?: string; // rendu optionnel pour éviter crash si ES ne le renvoie pas
}

export interface TraceAnalysis {
  trace_id: string;
  diagnostic: string;
  recommandation: string;
  suggested_role: 'FRONTEND' | 'BACKEND' | 'MOBILE' | 'DEVOPS' | 'QA' | 'DBA' | 'SECURITY' | 'PM';
}
