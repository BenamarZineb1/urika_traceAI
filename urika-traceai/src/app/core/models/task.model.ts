export type SkillType =
  | 'FRONTEND'
  | 'BACKEND'
  | 'MOBILE'
  | 'DEVOPS'
  | 'QA'
  | 'DBA'
  | 'SECURITY'
  | 'PM';

export type TaskStatus =
  | 'UNASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface User {

  id: number;

  username: string;

  skills: string[];

  currentWorkload: number;
}

export interface Task {

  id: number;

  title: string;

  description: string;

  traceId: string;

  requiredSkill: SkillType;

  priority: number;

  status: TaskStatus;

  assignedRole?: string;

  serviceName?: string;

  endpoint?: string;

  durationMs?: number;

  errorDetails?: string;

  aiDiagnostic?: string;

  createdAt?: string;

  completedAt?: string | null;

  workflow?: unknown;

  assignee?: User;
}