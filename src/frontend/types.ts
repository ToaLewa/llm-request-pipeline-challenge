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

export type AppRoute = '/' | '/requests' | '/doctors';
