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

type AssignedCaseRecord = {
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

export type AssignedCase = {
  id: number;
  assignmentSummary: string;
  workflowId: number;
  workflowTaskId: number;
  requestId: number | null;
  taskType: string;
  status: string;
  priority: string | null;
  caseSummary: string | null;
  caseType: string | null;
  reason: string | null;
  assignedAt: string;
  updatedAt: string;
};

export type TeamMemberCases = {
  teamMember: Pick<ClinicalTeamMember, 'id' | 'name'>;
  cases: AssignedCase[];
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
    }): Promise<{ id: number; name: string; assignments: AssignedCaseRecord[] } | null>;
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

export async function getTeamMemberCases(teamMemberId: number, options: GetClinicalTeamOptions = {}): Promise<TeamMemberCases | null> {
  const client: ClinicalTeamQueryClient = options.client ?? getPrisma();
  const teamMember = await client.teamMember.findUnique({
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

  return teamMember
    ? {
      teamMember: { id: teamMember.id, name: teamMember.name },
      cases: teamMember.assignments.map(toAssignedCase),
    }
    : null;
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

function toAssignedCase(assignment: AssignedCaseRecord): AssignedCase {
  const task = assignment.workflowTask;
  const routingOutput = toTaskRoutingOutput(task);

  return {
    id: assignment.id,
    assignmentSummary: assignment.summary,
    workflowId: task.workflowId,
    workflowTaskId: task.id,
    requestId: task.requestId,
    taskType: task.taskType,
    status: task.status,
    priority: routingOutput.priority,
    caseSummary: routingOutput.caseSummary,
    caseType: routingOutput.caseType,
    reason: task.reason ?? routingOutput.reason,
    assignedAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
  };
}

function toTaskRoutingOutput(task: AssignedCaseRecord['workflowTask']): { priority: string | null; caseSummary: string | null; caseType: string | null; reason: string | null } {
  const outputRouting = toRoutingOutput(task.output);

  if (outputRouting.priority || outputRouting.caseSummary || outputRouting.caseType || outputRouting.reason) {
    return outputRouting;
  }

  return toRoutingOutput(task.input);
}

function toRoutingOutput(output: unknown): { priority: string | null; caseSummary: string | null; caseType: string | null; reason: string | null } {
  if (!output || typeof output !== 'object') {
    return { priority: null, caseSummary: null, caseType: null, reason: null };
  }

  const record = output as Record<string, unknown>;
  const routingDecision = record.routingDecision && typeof record.routingDecision === 'object'
    ? record.routingDecision as Record<string, unknown>
    : null;

  return {
    priority: stringOrNull(record.priority) ?? stringOrNull(routingDecision?.priority),
    caseSummary: stringOrNull(record.caseSummary) ?? stringOrNull(routingDecision?.caseSummary),
    caseType: stringOrNull(record.caseType) ?? stringOrNull(routingDecision?.caseType),
    reason: stringOrNull(record.reason) ?? stringOrNull(routingDecision?.reason),
  };
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
