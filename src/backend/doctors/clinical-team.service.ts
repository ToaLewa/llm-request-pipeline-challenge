import { getPrisma } from '../database/client';

type SkillCategory = 'specialty' | 'clinical_skill' | 'case_type';

type ClinicalTeamSkill = {
  name: string;
  category: SkillCategory;
};

type ClinicalTeamRecord = {
  id: number;
  name: string;
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
  active: boolean;
  skills: Array<{
    skill: ClinicalTeamSkill;
  }>;
};

export type ClinicalTeamMember = {
  id: number;
  name: string;
  specialties: string[];
  skills: string[];
  caseTypes: string[];
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
  active: boolean;
};

export type ClinicalTeamQueryClient = {
  teamMember: {
    findMany(args: {
      include: {
        skills: {
          include: {
            skill: true;
          };
        };
      };
      orderBy: Array<{ active: 'desc' } | { ptoStatus: 'asc' } | { name: 'asc' }>;
    }): Promise<ClinicalTeamRecord[]>;
  };
};

export type GetClinicalTeamOptions = {
  client?: ClinicalTeamQueryClient;
};

export async function getClinicalTeam(options: GetClinicalTeamOptions = {}): Promise<ClinicalTeamMember[]> {
  const client: ClinicalTeamQueryClient = options.client ?? getPrisma();
  const teamMembers = await client.teamMember.findMany({
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: [{ active: 'desc' }, { ptoStatus: 'asc' }, { name: 'asc' }],
  });

  return teamMembers.map(toClinicalTeamMember);
}

function toClinicalTeamMember(teamMember: ClinicalTeamRecord): ClinicalTeamMember {
  return {
    id: teamMember.id,
    name: teamMember.name,
    specialties: skillNamesForCategory(teamMember, 'specialty'),
    skills: skillNamesForCategory(teamMember, 'clinical_skill'),
    caseTypes: skillNamesForCategory(teamMember, 'case_type'),
    description: teamMember.description,
    ptoStatus: teamMember.ptoStatus,
    currentLoad: teamMember.currentLoad,
    active: teamMember.active,
  };
}

function skillNamesForCategory(teamMember: ClinicalTeamRecord, category: SkillCategory): string[] {
  return teamMember.skills.filter(({ skill }) => skill.category === category).map(({ skill }) => skill.name);
}
