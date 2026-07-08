import { getPrisma } from './client';

export type SkillCategory = 'specialty' | 'clinical_skill' | 'case_type';

export type ClinicalTeamSkill = {
  name: string;
  category: SkillCategory;
};

export type ClinicalTeamRecord = {
  id: number;
  name: string;
  jobTitle: string;
  description: string;
  ptoStatus: boolean;
  active: boolean;
  _count: {
    assignments: number;
  };
  skills: Array<{
    skill: ClinicalTeamSkill;
  }>;
};

export type AssignedCaseRecord = {
  id: number;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
  workflowTask: {
    id: number;
    workflowId: number;
    requestId: number | null;
    taskType: string;
    status: string;
    input?: unknown;
    output: unknown;
    reason: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type TeamMemberCasesRecord = {
  id: number;
  name: string;
  assignments: AssignedCaseRecord[];
};

export type ClinicalTeamQueryClient = {
  teamMember: {
    findMany(args: {
      include: {
        _count: {
          select: {
            assignments: true;
          };
        };
        skills: {
          include: {
            skill: true;
          };
        };
      };
      orderBy: Array<{ active: 'desc' } | { ptoStatus: 'asc' } | { name: 'asc' }>;
    }): Promise<ClinicalTeamRecord[]>;
    findUnique(args: {
      where: { id: number };
      select: {
        id: true;
        name: true;
        assignments: {
          include: {
            workflowTask: true;
          };
          orderBy: { createdAt: 'desc' };
        };
      };
    }): Promise<TeamMemberCasesRecord | null>;
  };
};

export async function listClinicalTeamRecords(client: ClinicalTeamQueryClient = getPrisma()): Promise<ClinicalTeamRecord[]> {
  return client.teamMember.findMany({
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: [{ active: 'desc' }, { ptoStatus: 'asc' }, { name: 'asc' }],
  });
}

export async function getTeamMemberCasesRecord(
  teamMemberId: number,
  client: ClinicalTeamQueryClient = getPrisma(),
): Promise<TeamMemberCasesRecord | null> {
  return client.teamMember.findUnique({
    where: { id: teamMemberId },
    select: {
      id: true,
      name: true,
      assignments: {
        include: {
          workflowTask: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
