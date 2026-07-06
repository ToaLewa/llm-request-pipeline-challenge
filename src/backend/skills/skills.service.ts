import { getPrisma } from '../database/client';

export type AvailableSkill = {
  id: number;
  name: string;
  skillCode: string;
  category: 'specialty' | 'clinical_skill' | 'case_type';
};

export type SkillQueryClient = {
  skill: {
    findMany(args: {
      select: {
        id: true;
        name: true;
        skillCode: true;
        category: true;
      };
      orderBy: Array<{ category: 'asc' } | { name: 'asc' } | { id: 'asc' }>;
    }): Promise<AvailableSkill[]>;
  };
};

export type ListAvailableSkillsOptions = {
  client?: SkillQueryClient;
};

export async function listAvailableSkills(options: ListAvailableSkillsOptions = {}): Promise<AvailableSkill[]> {
  const client: SkillQueryClient = options.client ?? getPrisma();

  return client.skill.findMany({
    select: {
      id: true,
      name: true,
      skillCode: true,
      category: true,
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }, { id: 'asc' }],
  });
}
