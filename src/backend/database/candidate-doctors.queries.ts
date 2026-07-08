import { getPrisma } from './client';

export type SkillCategory = 'specialty' | 'clinical_skill' | 'case_type';

type CandidateSkill = {
  skillCode: string;
  name: string;
  category: SkillCategory;
};

export type CandidateDoctorRecord = {
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

export type CandidateDoctorQueryClient = {
  teamMember: {
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
  teamMember: {
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

export async function findCandidateDoctorRecordsBySkillCodes(
  skillCodes: string[],
  client: CandidateDoctorQueryClient = defaultCandidateDoctorQueryClient(),
): Promise<CandidateDoctorRecord[]> {
  return client.teamMember.findMany({
    where: {
      active: true,
      ptoStatus: false,
      skills: {
        some: {
          skill: {
            skillCode: {
              in: skillCodes,
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
}

export async function findCandidateDoctorRecordsByName(args: {
  name: string;
  limit: number;
  client?: CandidateDoctorByNameQueryClient;
}): Promise<CandidateDoctorRecord[]> {
  const client = args.client ?? defaultCandidateDoctorByNameQueryClient();

  return client.teamMember.findMany({
    where: {
      active: true,
      ptoStatus: false,
      name: {
        contains: args.name,
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
    take: args.limit,
  });
}

function defaultCandidateDoctorQueryClient(): CandidateDoctorQueryClient {
  return getPrisma() as unknown as CandidateDoctorQueryClient;
}

function defaultCandidateDoctorByNameQueryClient(): CandidateDoctorByNameQueryClient {
  return getPrisma() as unknown as CandidateDoctorByNameQueryClient;
}
