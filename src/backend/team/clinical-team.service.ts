import {
  getTeamMemberCasesRecord,
  listClinicalTeamRecords,
  type AssignedCaseRecord,
  type ClinicalTeamQueryClient,
  type ClinicalTeamRecord,
  type SkillCategory,
} from '../database/clinical-team.queries';

export type { ClinicalTeamQueryClient } from '../database/clinical-team.queries';

export type ClinicalTeamMember = {
  id: number;
  name: string;
  jobTitle: string;
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

export type GetClinicalTeamOptions = {
  client?: ClinicalTeamQueryClient;
};

export async function getClinicalTeam(options: GetClinicalTeamOptions = {}): Promise<ClinicalTeamMember[]> {
  const teamMembers = await listClinicalTeamRecords(options.client);

  return teamMembers.map(toClinicalTeamMember);
}

export async function getTeamMemberCases(teamMemberId: number, options: GetClinicalTeamOptions = {}): Promise<TeamMemberCases | null> {
  const teamMember = await getTeamMemberCasesRecord(teamMemberId, options.client);

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
    jobTitle: teamMember.jobTitle,
    specialties: skillNamesForCategory(teamMember, 'specialty'),
    skills: skillNamesForCategory(teamMember, 'clinical_skill'),
    caseTypes: skillNamesForCategory(teamMember, 'case_type'),
    description: teamMember.description,
    ptoStatus: teamMember.ptoStatus,
    currentLoad: teamMember._count.assignments,
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
