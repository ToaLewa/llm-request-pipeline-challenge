export type Doctor = {
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

export type DoctorPoolState =
  | { status: 'loading'; doctors: Doctor[]; error?: never }
  | { status: 'loaded'; doctors: Doctor[]; error?: never }
  | { status: 'error'; doctors: Doctor[]; error: string };

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
};

export type WorkflowDetail = WorkflowSummary & {
  tasks: WorkflowTaskSummary[];
};

export type WorkflowDetailState =
  | { status: 'loading'; workflow?: never; error?: never }
  | { status: 'loaded'; workflow: WorkflowDetail; error?: never }
  | { status: 'error'; workflow?: never; error: string };

export type AppRoute = '/' | '/requests' | '/doctors' | '/workflows' | `/workflows/${number}`;
