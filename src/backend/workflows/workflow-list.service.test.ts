import { describe, expect, it, vi } from 'vitest';
import { getWorkflow, listWorkflows, type WorkflowListQueryClient } from './workflow-list.service';

describe('listWorkflows', () => {
  it('loads workflows with latest task details for table display', async () => {
    const createdAt = new Date('2026-07-06T01:00:00.000Z');
    const updatedAt = new Date('2026-07-06T01:05:00.000Z');
    const taskCreatedAt = new Date('2026-07-06T01:02:00.000Z');
    const taskUpdatedAt = new Date('2026-07-06T01:03:00.000Z');
    const findMany = vi.fn<WorkflowListQueryClient['workflow']['findMany']>().mockResolvedValue([
      {
        id: 7,
        status: 'active',
        createdAt,
        updatedAt,
        _count: {
          requests: 2,
          tasks: 3,
        },
        tasks: [
          {
            id: 9,
            requestId: 4,
            taskType: 'routing_decision',
            sequence: 1,
            status: 'completed',
            output: {
              route: 'doctor_assignment',
              priority: 'normal',
              caseSummary: 'Renal biopsy review requested.',
              reason: 'The request needs specialist review.',
            },
            reason: 'Latest task reason.',
            createdAt: taskCreatedAt,
            updatedAt: taskUpdatedAt,
          },
        ],
      },
    ]);
    const client: WorkflowListQueryClient = {
      workflow: { findMany, findUnique: vi.fn() },
    };

    const workflows = await listWorkflows({ client });

    expect(findMany).toHaveBeenCalledWith({
      include: {
        _count: {
          select: {
            requests: true,
            tasks: true,
          },
        },
        tasks: {
          orderBy: [{ sequence: 'desc' }, { createdAt: 'desc' }],
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(workflows).toEqual([
      {
        id: 7,
        status: 'active',
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        requestCount: 2,
        taskCount: 3,
        latestTaskStatus: 'completed',
        latestTaskType: 'routing_decision',
        route: 'doctor_assignment',
        priority: 'normal',
        caseSummary: 'Renal biopsy review requested.',
        reason: 'Latest task reason.',
      },
    ]);
  });
});

describe('getWorkflow', () => {
  it('loads a workflow with every task in sequence order', async () => {
    const createdAt = new Date('2026-07-06T01:00:00.000Z');
    const updatedAt = new Date('2026-07-06T01:10:00.000Z');
    const firstTaskCreatedAt = new Date('2026-07-06T01:02:00.000Z');
    const firstTaskUpdatedAt = new Date('2026-07-06T01:03:00.000Z');
    const secondTaskCreatedAt = new Date('2026-07-06T01:06:00.000Z');
    const secondTaskUpdatedAt = new Date('2026-07-06T01:07:00.000Z');
    const findUnique = vi.fn<WorkflowListQueryClient['workflow']['findUnique']>().mockResolvedValue({
      id: 7,
      status: 'active',
      createdAt,
      updatedAt,
      _count: {
        requests: 1,
        tasks: 2,
      },
      tasks: [
        {
          id: 9,
          requestId: 4,
          taskType: 'routing_decision',
          sequence: 1,
          status: 'completed',
          output: {
            route: 'doctor_assignment',
            priority: 'normal',
            caseSummary: 'Renal biopsy review requested.',
            reason: 'The request needs specialist review.',
          },
          reason: 'Routing reason.',
          createdAt: firstTaskCreatedAt,
          updatedAt: firstTaskUpdatedAt,
        },
        {
          id: 10,
          requestId: null,
          taskType: 'doctor_assignment',
          sequence: 2,
          status: 'pending',
          output: null,
          reason: 'Waiting for doctor assignment.',
          createdAt: secondTaskCreatedAt,
          updatedAt: secondTaskUpdatedAt,
        },
      ],
    });
    const client: WorkflowListQueryClient = {
      workflow: { findMany: vi.fn(), findUnique },
    };

    const workflow = await getWorkflow(7, { client });

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 7 },
      include: {
        _count: {
          select: {
            requests: true,
            tasks: true,
          },
        },
        tasks: {
          orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    expect(workflow).toEqual({
      id: 7,
      status: 'active',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      requestCount: 1,
      taskCount: 2,
      latestTaskStatus: 'pending',
      latestTaskType: 'doctor_assignment',
      route: null,
      priority: null,
      caseSummary: null,
      reason: 'Waiting for doctor assignment.',
      tasks: [
        {
          id: 9,
          requestId: 4,
          taskType: 'routing_decision',
          sequence: 1,
          status: 'completed',
          createdAt: firstTaskCreatedAt.toISOString(),
          updatedAt: firstTaskUpdatedAt.toISOString(),
          route: 'doctor_assignment',
          priority: 'normal',
          caseSummary: 'Renal biopsy review requested.',
          reason: 'Routing reason.',
        },
        {
          id: 10,
          requestId: null,
          taskType: 'doctor_assignment',
          sequence: 2,
          status: 'pending',
          createdAt: secondTaskCreatedAt.toISOString(),
          updatedAt: secondTaskUpdatedAt.toISOString(),
          route: null,
          priority: null,
          caseSummary: null,
          reason: 'Waiting for doctor assignment.',
        },
      ],
    });
  });
});
