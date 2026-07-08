import { listAvailableSkillRecords, type AvailableSkill, type SkillQueryClient } from '../database/skills.queries';

export type { AvailableSkill, SkillQueryClient } from '../database/skills.queries';

export type ListAvailableSkillsOptions = {
  client?: SkillQueryClient;
};

export async function listAvailableSkills(options: ListAvailableSkillsOptions = {}): Promise<AvailableSkill[]> {
  return listAvailableSkillRecords(options.client);
}
