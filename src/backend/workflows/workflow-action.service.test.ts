import { describe, expect, it, vi } from 'vitest';
import type { CandidateDoctorPayload } from '../doctors/candidates';
import type { DoctorReassignmentSelectionClient, WorkflowActionClient } from '../inference/workflow-action';
import { processWorkflowAction, type WorkflowActionServiceClient } from './workflow-action.service';

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

describe('processWorkflowAction', () => {
  it('persists unsupported actions for auditability', async () => {
    const { client, createdTasks } = createWorkflowActionClient();
    const workflowActionClient: WorkflowActionClient = {
      classifyAction: vi.fn().mockResolvedValue({
        action: 'close_assignment',
        requestedAssigneeName: null,
        reason: 'The user asked to close the assignment.',
        confidence: 0.9,
      }),
    };

    await expect(processWorkflowAction(10, 'Close this assignment', { client, workflowActionClient })).resolves.toEqual({
      workflowId: 10,
      actionTaskId: 20,
      resultTaskId: null,
      action: 'close_assignment',
      status: 'unsupported',
      message: 'This workflow action is not implemented yet.',
    });

    expect(createdTasks).toEqual([expect.objectContaining({
      taskType: 'workflow_action',
      sequence: 5,
      status: 'unsupported',
      input: { message: 'Close this assignment' },
    })]);
  });

  it('reassigns to a named doctor and appends after the current max sequence', async () => {
    const { client, createdAssignments, createdTasks, workflowUpdate } = createWorkflowActionClient();
    const workflowActionClient: WorkflowActionClient = {
      classifyAction: vi.fn().mockResolvedValue({
        action: 'reassign_doctor',
        requestedAssigneeName: 'Dr. Emily Chen',
        reason: 'The user requested a doctor reassignment.',
        confidence: 0.94,
      }),
    };
    const doctorSelectionClient: DoctorReassignmentSelectionClient = {
      selectDoctor: vi.fn().mockResolvedValue({
        selectedDoctorId: 7,
        confidence: 0.95,
        reason: 'The requested name matches Dr. Emily Chen.',
        needsReview: false,
        needsReviewReason: null,
      }),
    };

    await expect(processWorkflowAction(10, 'Please assign this to Dr. Emily Chen', {
      client,
      workflowActionClient,
      doctorSelectionClient,
      findDoctorsByName: async () => candidateDoctors,
    })).resolves.toEqual({
      workflowId: 10,
      actionTaskId: 20,
      resultTaskId: 21,
      action: 'reassign_doctor',
      status: 'completed',
      message: 'Assigned to Dr. Emily Chen.',
    });

    expect(createdTasks.map((task) => [task.taskType, task.sequence, task.status])).toEqual([
      ['workflow_action', 5, 'completed'],
      ['doctor_reassignment', 6, 'completed'],
    ]);
    expect(createdTasks[1]?.input).toEqual(expect.objectContaining({
      previousAssignmentTaskId: 4,
      previousDoctorId: 3,
      previousDoctorName: 'Dr. Ravi Patel',
      requestedDoctorName: 'Dr. Emily Chen',
    }));
    expect(createdTasks[1]?.output).toEqual({
      assignedDoctorId: 7,
      assignedDoctorName: 'Dr. Emily Chen',
      assignmentReason: 'The requested name matches Dr. Emily Chen.',
      confidence: 0.95,
    });
    expect(createdAssignments).toEqual([{
      teamMemberId: 7,
      workflowTaskId: 21,
      summary: 'Reassigned from Dr. Ravi Patel to Dr. Emily Chen. The requested name matches Dr. Emily Chen.',
    }]);
    expect(workflowUpdate).toHaveBeenCalledWith({ where: { id: 10 }, data: { status: 'assigned' } });
  });

  it('stores needs_review when doctor selection references a non-candidate', async () => {
    const { client, createdTasks } = createWorkflowActionClient();
    const workflowActionClient: WorkflowActionClient = {
      classifyAction: vi.fn().mockResolvedValue({
        action: 'reassign_doctor',
        requestedAssigneeName: 'Dr. Emily Chen',
        reason: 'The user requested a doctor reassignment.',
        confidence: 0.94,
      }),
    };
    const doctorSelectionClient: DoctorReassignmentSelectionClient = {
      selectDoctor: vi.fn().mockResolvedValue({
        selectedDoctorId: 99,
        confidence: 0.95,
        reason: 'Invalid selection.',
        needsReview: false,
        needsReviewReason: null,
      }),
    };

    await expect(processWorkflowAction(10, 'Please assign this to Dr. Emily Chen', {
      client,
      workflowActionClient,
      doctorSelectionClient,
      findDoctorsByName: async () => candidateDoctors,
    })).resolves.toEqual(expect.objectContaining({
      action: 'reassign_doctor',
      status: 'needs_review',
      resultTaskId: null,
      message: 'Doctor reassignment selected non-candidate doctorId 99.',
    }));

    expect(createdTasks).toEqual([expect.objectContaining({
      taskType: 'workflow_action',
      sequence: 5,
      status: 'needs_review',
    })]);
  });
});

function createWorkflowActionClient(): {
  client: WorkflowActionServiceClient;
  createdAssignments: Array<{ teamMemberId: number; workflowTaskId: number; summary: string }>;
  createdTasks: Array<{ id: number; taskType: string; sequence: number; status: string; input: unknown; output: unknown }>;
  workflowUpdate: ReturnType<typeof vi.fn>;
} {
  const createdAssignments: Array<{ teamMemberId: number; workflowTaskId: number; summary: string }> = [];
  const createdTasks: Array<{ id: number; taskType: string; sequence: number; status: string; input: unknown; output: unknown }> = [];
  const workflowTaskCreate = vi.fn(async (args: { data: { taskType: string; sequence: number; status: string; input: unknown; output: unknown } }) => {
    const task = { id: 20 + createdTasks.length, requestId: 1, reason: null, ...args.data };
    createdTasks.push(task);

    return task;
  });
  const assignmentCreate = vi.fn(async (args: { data: { teamMemberId: number; workflowTaskId: number; summary: string } }) => {
    createdAssignments.push(args.data);

    return { id: createdAssignments.length };
  });
  const workflowUpdate = vi.fn(async (args: { where: { id: number }; data: { status: string } }) => ({
    id: args.where.id,
    status: args.data.status,
  }));
  const client: WorkflowActionServiceClient = {
    workflow: {
      findUnique: vi.fn().mockResolvedValue({
        id: 10,
        status: 'assigned',
        requests: [{ id: 1, rawRequest: 'Need renal biopsy review.' }],
        tasks: [
          { id: 1, requestId: 1, taskType: 'routing_decision', sequence: 1, status: 'completed', input: null, output: null, reason: 'Routed.' },
          { id: 2, requestId: 1, taskType: 'skills_ranking', sequence: 2, status: 'completed', input: null, output: null, reason: 'Ranked.' },
          { id: 3, requestId: 1, taskType: 'doctor_ranking', sequence: 3, status: 'completed', input: null, output: null, reason: 'Ranked.' },
          {
            id: 4,
            requestId: 1,
            taskType: 'doctor_assignment',
            sequence: 4,
            status: 'completed',
            input: null,
            output: { assignedDoctorId: 3, assignedDoctorName: 'Dr. Ravi Patel' },
            reason: 'Assigned.',
          },
        ],
      }),
    },
    $transaction: vi.fn((handler) => handler({
      workflowTask: { create: workflowTaskCreate },
      assignment: { create: assignmentCreate },
      workflow: { update: workflowUpdate },
    })),
  };

  return { client, createdAssignments, createdTasks, workflowUpdate };
}
