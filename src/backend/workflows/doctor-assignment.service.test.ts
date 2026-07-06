import { describe, expect, it, vi } from 'vitest';
import type { CandidateDoctorPayload } from '../doctors/candidates';
import type { DoctorRankingClient } from '../inference/doctor-ranking';
import type { RoutingDecision } from '../inference/routing';
import type { SkillsRankingClient } from '../inference/skills-ranking';
import type { AvailableSkill } from '../skills/skills.service';
import {
  processDoctorAssignmentWorkflow,
  type DoctorAssignmentWorkflowClient,
} from './doctor-assignment.service';

const doctorRoutingDecision: RoutingDecision = {
  route: 'doctor_assignment',
  confidence: 0.94,
  reason: 'Clinical review needed.',
  caseSummary: 'Renal biopsy review requested.',
  caseType: 'renal biopsy',
  priority: 'normal',
  requiredSpecialties: ['renal pathology'],
  requiredSkills: ['lupus nephritis'],
  patientContext: {},
};

const recordsRoutingDecision: RoutingDecision = {
  ...doctorRoutingDecision,
  route: 'records_request',
  requiredSpecialties: [],
  requiredSkills: [],
};

const availableSkills: AvailableSkill[] = [
  { id: 1, name: 'Renal Pathology', skillCode: 'renal-pathology', category: 'specialty' },
  { id: 2, name: 'Lupus Nephritis', skillCode: 'lupus-nephritis', category: 'clinical_skill' },
];

const candidateDoctors: CandidateDoctorPayload[] = [
  {
    id: 7,
    name: 'Dr. Emily Chen',
    specialties: ['Renal Pathology'],
    skills: ['Lupus Nephritis'],
    caseTypes: ['Renal Biopsy'],
    description: 'Renal pathologist.',
    ptoStatus: false,
    currentLoad: 3,
  },
];

describe('processDoctorAssignmentWorkflow', () => {
  it('stops when the route is not doctor_assignment', async () => {
    const { client, workflowTaskCreate } = createWorkflowClient(recordsRoutingDecision);

    await expect(processDoctorAssignmentWorkflow(10, { client })).resolves.toEqual({ status: 'skipped', workflowId: 10 });
    expect(workflowTaskCreate).not.toHaveBeenCalled();
  });

  it('appends ranking and assignment tasks in order when validation succeeds', async () => {
    const { client, createdTasks, workflowUpdate } = createWorkflowClient(doctorRoutingDecision);
    const skillsRankingClient: SkillsRankingClient = {
      rankSkills: vi.fn().mockResolvedValue({
        rankedSkills: [
          { skillId: 1, skillCode: 'renal-pathology', score: 0.9, reason: 'Specialty match.' },
          { skillId: 2, skillCode: 'lupus-nephritis', score: 0.87, reason: 'Clinical skill match.' },
        ],
        confidence: 0.88,
        reason: 'Relevant canonical skills found.',
      }),
    };
    const doctorRankingClient: DoctorRankingClient = {
      rankDoctors: vi.fn().mockResolvedValue({
        selectedDoctorId: 7,
        confidence: 0.91,
        assignmentReason: 'Best renal pathology fit.',
        rankedCandidates: [{ doctorId: 7, score: 0.96, reason: 'Best match.' }],
        unassignable: false,
        unassignableReason: null,
      }),
    };

    await expect(processDoctorAssignmentWorkflow(10, {
      client,
      skillsRankingClient,
      doctorRankingClient,
      loadAvailableSkills: async () => availableSkills,
      findCandidateDoctors: async () => candidateDoctors,
    })).resolves.toEqual({ status: 'assigned', workflowId: 10 });

    expect(createdTasks.map((task) => task.taskType)).toEqual(['skills_ranking', 'doctor_ranking', 'doctor_assignment']);
    expect(createdTasks.map((task) => task.sequence)).toEqual([2, 3, 4]);
    expect(createdTasks[createdTasks.length - 1]?.status).toBe('completed');
    expect(workflowUpdate).toHaveBeenCalledWith({ where: { id: 10 }, data: { status: 'assigned' } });
  });

  it('marks the workflow needs_review when skill ranking references unknown skills', async () => {
    const { client, createdTasks, workflowUpdate } = createWorkflowClient(doctorRoutingDecision);
    const skillsRankingClient: SkillsRankingClient = {
      rankSkills: vi.fn().mockResolvedValue({
        rankedSkills: [{ skillId: 99, skillCode: 'made-up', score: 0.8, reason: 'bad' }],
        confidence: 0.8,
        reason: 'bad',
      }),
    };

    await expect(processDoctorAssignmentWorkflow(10, {
      client,
      skillsRankingClient,
      loadAvailableSkills: async () => availableSkills,
    })).resolves.toEqual({ status: 'needs_review', workflowId: 10 });

    expect(createdTasks.map((task) => task.taskType)).toEqual(['skills_ranking']);
    expect(createdTasks[0]?.status).toBe('needs_review');
    expect(workflowUpdate).toHaveBeenCalledWith({ where: { id: 10 }, data: { status: 'needs_review' } });
  });

  it('creates unassignable tasks when no doctors match ranked skills', async () => {
    const { client, createdTasks, workflowUpdate } = createWorkflowClient(doctorRoutingDecision);
    const skillsRankingClient: SkillsRankingClient = {
      rankSkills: vi.fn().mockResolvedValue({
        rankedSkills: [{ skillId: 1, skillCode: 'renal-pathology', score: 0.9, reason: 'Specialty match.' }],
        confidence: 0.9,
        reason: 'Relevant skill found.',
      }),
    };

    await expect(processDoctorAssignmentWorkflow(10, {
      client,
      skillsRankingClient,
      loadAvailableSkills: async () => availableSkills,
      findCandidateDoctors: async () => [],
    })).resolves.toEqual({ status: 'unassignable', workflowId: 10 });

    expect(createdTasks.map((task) => task.status)).toEqual(['completed', 'unassignable', 'unassignable']);
    expect(workflowUpdate).toHaveBeenCalledWith({ where: { id: 10 }, data: { status: 'unassignable' } });
  });

  it('creates a needs_review assignment when doctor ranking confidence is below threshold', async () => {
    const { client, createdTasks, workflowUpdate } = createWorkflowClient(doctorRoutingDecision);
    const skillsRankingClient: SkillsRankingClient = {
      rankSkills: vi.fn().mockResolvedValue({
        rankedSkills: [{ skillId: 1, skillCode: 'renal-pathology', score: 0.9, reason: 'Specialty match.' }],
        confidence: 0.9,
        reason: 'Relevant skill found.',
      }),
    };
    const doctorRankingClient: DoctorRankingClient = {
      rankDoctors: vi.fn().mockResolvedValue({
        selectedDoctorId: 7,
        confidence: 0.4,
        assignmentReason: 'Uncertain fit.',
        rankedCandidates: [{ doctorId: 7, score: 0.6, reason: 'Possible match.' }],
        unassignable: false,
        unassignableReason: null,
      }),
    };

    await expect(processDoctorAssignmentWorkflow(10, {
      client,
      skillsRankingClient,
      doctorRankingClient,
      loadAvailableSkills: async () => availableSkills,
      findCandidateDoctors: async () => candidateDoctors,
    })).resolves.toEqual({ status: 'needs_review', workflowId: 10 });

    expect(createdTasks.map((task) => task.status)).toEqual(['completed', 'needs_review', 'needs_review']);
    expect(workflowUpdate).toHaveBeenCalledWith({ where: { id: 10 }, data: { status: 'needs_review' } });
  });
});

function createWorkflowClient(routingDecision: RoutingDecision): {
  client: DoctorAssignmentWorkflowClient;
  createdTasks: Array<{ taskType: string; sequence: number; status: string }>;
  workflowTaskCreate: ReturnType<typeof vi.fn>;
  workflowUpdate: ReturnType<typeof vi.fn>;
} {
  const createdTasks: Array<{ taskType: string; sequence: number; status: string }> = [];
  const workflowTaskCreate = vi.fn(async (args: { data: { taskType: string; sequence: number; status: string } }) => {
    const task = { id: createdTasks.length + 2, requestId: 1, input: null, output: null, reason: null, ...args.data };
    createdTasks.push(task);

    return task;
  });
  const workflowUpdate = vi.fn(async (args: { where: { id: number }; data: { status: string } }) => ({
    id: args.where.id,
    status: args.data.status,
  }));
  const client: DoctorAssignmentWorkflowClient = {
    workflow: {
      findUnique: vi.fn().mockResolvedValue({
        id: 10,
        requests: [{ id: 1, rawRequest: 'Need renal biopsy review.' }],
        tasks: [
          {
            id: 1,
            requestId: 1,
            taskType: 'routing_decision',
            sequence: 1,
            status: 'completed',
            input: { rawRequest: 'Need renal biopsy review.' },
            output: routingDecision,
            reason: routingDecision.reason,
          },
        ],
      }),
    },
    $transaction: vi.fn((handler) => handler({
      workflowTask: { create: workflowTaskCreate },
      workflow: { update: workflowUpdate },
    })),
  };

  return { client, createdTasks, workflowTaskCreate, workflowUpdate };
}
