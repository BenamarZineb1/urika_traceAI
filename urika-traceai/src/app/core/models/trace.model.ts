import { SkillType } from './task.model';

export type TraceStatus =
  | 'ok'
  | 'slow'
  | 'error';

export interface Trace {

  trace_id: string;

  service: string;

  endpoint: string;

  status: TraceStatus;

  duration_ms: number;

  message?: string;

  timestamp?: string;
}

export interface TraceAnalysis {

  diagnostic: string;

  recommandation: string;

  suggested_role: SkillType;
}