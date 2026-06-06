import { SkillType } from './task.model';

export interface TaskCreationDTO {

  title: string;

  description: string;

  traceId: string;

  requiredSkill: SkillType;

  priority: number;

  force?: boolean;
}