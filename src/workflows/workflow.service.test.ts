import { describe, expect, it, vi } from 'vitest';
import type { RoutingDecision } from '../inference/routing';
import { createInitialWorkflow, type InitialWorkflowClient } from './workflow.service';

const routingDecision: RoutingDecision = {
  route: 'doctor_assignment',
  confidence: 0.93,
  reason: 'The request needs specialist review.',
  caseSummary: 'Renal biopsy review requested.',
  caseType: 'renal biopsy',
  priority: 'normal',
  requiredSpecialties: ['renal pathology'],
  requiredSkills: ['renal biopsy'],
  patientContext: {},
};

describe('createInitialWorkflow', () => {
  it('creates a request, workflow, linked request, and first routing task in a transaction', async () => {
    const workflowRequestCreate = vi.fn().mockResolvedValue({ id: 1 });
    const workflowCreate = vi.fn().mockResolvedValue({ id: 2 });
    const workflowRequestUpdate = vi.fn().mockResolvedValue({ id: 1 });
    const workflowTaskCreate = vi.fn().mockResolvedValue({ id: 3 });
    const tx = {
      workflowRequest: {
        create: workflowRequestCreate,
        update: workflowRequestUpdate,
      },
      workflow: {
        create: workflowCreate,
      },
      workflowTask: {
        create: workflowTaskCreate,
      },
    };
    const client: InitialWorkflowClient = {
      $transaction: vi.fn((handler) => handler(tx)),
    };

    const result = await createInitialWorkflow('  Need renal biopsy review.  ', routingDecision, { client });

    expect(client.$transaction).toHaveBeenCalledOnce();
    expect(workflowRequestCreate).toHaveBeenCalledWith({
      data: {
        rawRequest: 'Need renal biopsy review.',
        source: 'user',
      },
    });
    expect(workflowCreate).toHaveBeenCalledWith({ data: {} });
    expect(workflowRequestUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { workflowId: 2 },
    });
    expect(workflowTaskCreate).toHaveBeenCalledWith({
      data: {
        workflowId: 2,
        requestId: 1,
        taskType: 'routing_decision',
        sequence: 1,
        status: 'completed',
        input: { rawRequest: 'Need renal biopsy review.' },
        output: routingDecision,
        reason: routingDecision.reason,
      },
    });
    expect(result).toEqual({
      workflowId: 2,
      requestId: 1,
      taskId: 3,
    });
  });

  it('rejects blank raw requests before opening a transaction', async () => {
    const client: InitialWorkflowClient = {
      $transaction: vi.fn(),
    };

    await expect(createInitialWorkflow('   ', routingDecision, { client })).rejects.toThrow('raw request is required');
    expect(client.$transaction).not.toHaveBeenCalled();
  });
});
