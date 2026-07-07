export type TeamMember = {
  id: number;
  name: string;
  description: string;
  ptoStatus: boolean;
  active: boolean;
  currentLoad: number;
  specialties: string[];
  skills: string[];
  caseTypes: string[];
};

export type ClinicalTeamState =
  | { status: 'loading'; teamMembers: TeamMember[]; error?: never }
  | { status: 'loaded'; teamMembers: TeamMember[]; error?: never }
  | { status: 'error'; teamMembers: TeamMember[]; error: string };

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
  teamMember: Pick<TeamMember, 'id' | 'name'>;
  cases: AssignedCase[];
};

export type TeamMemberCasesState =
  | { status: 'loading'; teamMemberCases?: never; error?: never }
  | { status: 'loaded'; teamMemberCases: TeamMemberCases; error?: never }
  | { status: 'error'; teamMemberCases?: never; error: string };

export type RoutingDecision = {
  route: string;
  confidence: number;
  reason: string;
  caseSummary: string;
  caseType: string | null;
  priority: string;
  requiredSpecialties: string[];
  requiredSkills: string[];
  patientContext: Record<string, string | number | boolean | null>;
};

export type RequestSubmissionResult = {
  workflowId: number;
  requestId: number;
  taskId: number;
  routingDecision: RoutingDecision;
};

export type WorkflowSummary = {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
  taskCount: number;
  latestTaskStatus: string | null;
  latestTaskType: string | null;
  route: string | null;
  priority: string | null;
  caseSummary: string | null;
  reason: string | null;
};

export type WorkflowListState =
  | { status: 'loading'; workflows: WorkflowSummary[]; error?: never }
  | { status: 'loaded'; workflows: WorkflowSummary[]; error?: never }
  | { status: 'error'; workflows: WorkflowSummary[]; error: string };

export type WorkflowTaskSummary = {
  id: number;
  requestId: number | null;
  taskType: string;
  sequence: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  route: string | null;
  priority: string | null;
  caseSummary: string | null;
  reason: string | null;
  assignedDoctorId: number | null;
  assignedDoctorName: string | null;
  confidence: number | null;
};

export type WorkflowDetail = WorkflowSummary & {
  tasks: WorkflowTaskSummary[];
};

export type WorkflowDetailState =
  | { status: 'loading'; workflow?: never; error?: never }
  | { status: 'loaded'; workflow: WorkflowDetail; error?: never }
  | { status: 'error'; workflow?: never; error: string };

export type AppRoute = '/' | '/requests' | '/clinical-team' | `/clinical-team/${number}/cases` | '/workflows' | `/workflows/${number}`;

export type WorkflowActionResult = {
  workflowId: number;
  actionTaskId: number;
  resultTaskId: number | null;
  action: string;
  status: 'completed' | 'unsupported' | 'needs_review';
  message: string;
};
