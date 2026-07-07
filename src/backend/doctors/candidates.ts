import { getPrisma } from '../database/client';
import type { RoutingDecision } from '../inference/routing';

export type SkillCategory = 'specialty' | 'clinical_skill' | 'case_type';

type CandidateSkill = {
  skillCode: string;
  name: string;
  category: SkillCategory;
};

type CandidateDoctorRecord = {
  id: number;
  name: string;
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
  active: boolean;
  skills: Array<{
    skill: CandidateSkill;
  }>;
};

export type CandidateDoctorPayload = {
  id: number;
  name: string;
  specialties: string[];
  skills: string[];
  caseTypes: string[];
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
};

export type CandidateDoctorQueryClient = {
  doctor: {
    findMany(args: {
      where: {
        active: true;
        ptoStatus: false;
        skills: {
          some: {
            skill: {
              skillCode: {
                in: string[];
              };
            };
          };
        };
      };
      include: {
        skills: {
          include: {
            skill: true;
          };
        };
      };
      orderBy: Array<{ currentLoad: 'asc' }>;
    }): Promise<CandidateDoctorRecord[]>;
  };
};

export type CandidateDoctorByNameQueryClient = {
  doctor: {
    findMany(args: {
      where: {
        active: true;
        ptoStatus: false;
        name: {
          contains: string;
          mode: 'insensitive';
        };
      };
      include: {
        skills: {
          include: {
            skill: true;
          };
        };
      };
      orderBy: Array<{ currentLoad: 'asc' }>;
      take: number;
    }): Promise<CandidateDoctorRecord[]>;
  };
};

export type FindCandidateDoctorsOptions = {
  client?: CandidateDoctorQueryClient;
  limit?: number;
};

export function normalizeSkillCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function skillCodesFromRoutingDecision(routing: RoutingDecision): string[] {
  const values = [
    ...routing.requiredSpecialties,
    ...routing.requiredSkills,
    ...(routing.caseType ? [routing.caseType] : []),
  ];

  return [...new Set(values.map(normalizeSkillCode).filter(Boolean))];
}

export async function findCandidateDoctors(
  routing: RoutingDecision,
  options: FindCandidateDoctorsOptions = {},
): Promise<CandidateDoctorPayload[]> {
  const requiredSkillCodes = skillCodesFromRoutingDecision(routing);

  return findCandidateDoctorsBySkillCodes(requiredSkillCodes, options);
}

export async function findCandidateDoctorsBySkillCodes(
  skillCodes: string[],
  options: FindCandidateDoctorsOptions = {},
): Promise<CandidateDoctorPayload[]> {
  const requiredSkillCodes = [...new Set(skillCodes.map((skillCode) => skillCode.trim()).filter(Boolean))];

  if (requiredSkillCodes.length === 0) {
    return [];
  }

  const client: CandidateDoctorQueryClient = options.client ?? getPrisma();
  const limit = options.limit ?? 8;
  const requiredSkillCodeSet = new Set(requiredSkillCodes);

  const candidates = await client.doctor.findMany({
    where: {
      active: true,
      ptoStatus: false,
      skills: {
        some: {
          skill: {
            skillCode: {
              in: requiredSkillCodes,
            },
          },
        },
      },
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: [{ currentLoad: 'asc' }],
  });

  return candidates
    .map((candidate) => ({
      candidate,
      matchCount: candidate.skills.filter(({ skill }) => requiredSkillCodeSet.has(skill.skillCode)).length,
    }))
    .sort((a, b) => b.matchCount - a.matchCount || a.candidate.currentLoad - b.candidate.currentLoad)
    .slice(0, limit)
    .map(({ candidate }) => toCandidateDoctorPayload(candidate));
}

export async function findCandidateDoctorsByName(
  name: string,
  options: { client?: CandidateDoctorByNameQueryClient; limit?: number } = {},
): Promise<CandidateDoctorPayload[]> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return [];
  }

  const client: CandidateDoctorByNameQueryClient = options.client ?? getPrisma();
  const candidates = await client.doctor.findMany({
    where: {
      active: true,
      ptoStatus: false,
      name: {
        contains: normalizedName,
        mode: 'insensitive',
      },
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: [{ currentLoad: 'asc' }],
    take: options.limit ?? 8,
  });

  return candidates.map(toCandidateDoctorPayload);
}

function toCandidateDoctorPayload(candidate: CandidateDoctorRecord): CandidateDoctorPayload {
  return {
    id: candidate.id,
    name: candidate.name,
    specialties: skillNamesForCategory(candidate, 'specialty'),
    skills: skillNamesForCategory(candidate, 'clinical_skill'),
    caseTypes: skillNamesForCategory(candidate, 'case_type'),
    description: candidate.description,
    ptoStatus: candidate.ptoStatus,
    currentLoad: candidate.currentLoad,
  };
}

function skillNamesForCategory(candidate: CandidateDoctorRecord, category: SkillCategory): string[] {
  return candidate.skills
    .filter(({ skill }) => skill.category === category)
    .map(({ skill }) => skill.name);
}
