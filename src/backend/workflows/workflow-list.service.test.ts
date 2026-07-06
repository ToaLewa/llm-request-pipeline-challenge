import { describe, expect, it, vi } from 'vitest';
import { listWorkflows, type WorkflowListQueryClient } from './workflow-list.service';

describe('listWorkflows', () => {
  it('loads workflows with latest task details for table display', async () => {
    const createdAt = new Date('2026-07-06T01:00:00.000Z');
    const updatedAt = new Date('2026-07-06T01:05:00.000Z');
    const taskCreatedAt = new Date('2026-07-06T01:02:00.000Z');
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
            taskType: 'routing_decision',
            status: 'completed',
            output: {
              route: 'doctor_assignment',
              priority: 'normal',
              caseSummary: 'Renal biopsy review requested.',
              reason: 'The request needs specialist review.',
            },
            reason: 'Latest task reason.',
            createdAt: taskCreatedAt,
          },
        ],
      },
    ]);
    const client: WorkflowListQueryClient = {
      workflow: { findMany },
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
