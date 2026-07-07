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

export type ClinicalTeamDoctor = {
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
  doctor: {
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

export async function getClinicalTeam(options: GetClinicalTeamOptions = {}): Promise<ClinicalTeamDoctor[]> {
  const client: ClinicalTeamQueryClient = options.client ?? getPrisma();
  const doctors = await client.doctor.findMany({
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: [{ active: 'desc' }, { ptoStatus: 'asc' }, { name: 'asc' }],
  });

  return doctors.map(toClinicalTeamDoctor);
}

function toClinicalTeamDoctor(doctor: ClinicalTeamRecord): ClinicalTeamDoctor {
  return {
    id: doctor.id,
    name: doctor.name,
    specialties: skillNamesForCategory(doctor, 'specialty'),
    skills: skillNamesForCategory(doctor, 'clinical_skill'),
    caseTypes: skillNamesForCategory(doctor, 'case_type'),
    description: doctor.description,
    ptoStatus: doctor.ptoStatus,
    currentLoad: doctor.currentLoad,
    active: doctor.active,
  };
}

function skillNamesForCategory(doctor: ClinicalTeamRecord, category: SkillCategory): string[] {
  return doctor.skills.filter(({ skill }) => skill.category === category).map(({ skill }) => skill.name);
}
