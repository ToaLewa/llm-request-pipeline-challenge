import { createWorkflowTask, type WorkflowTaskClient, type WorkflowTaskRecord } from '../database/workflow-task.queries';

export async function createHumanReviewTask(args: {
  client?: WorkflowTaskClient;
  workflowId: number;
  requestId: number;
  sequence: number;
  failedTask: Pick<WorkflowTaskRecord, 'id' | 'taskType' | 'status'>;
  failureContext: Record<string, string | number | boolean | null>;
  reason: string;
}): Promise<WorkflowTaskRecord> {
  return createWorkflowTask({
    client: args.client,
    data: {
      workflowId: args.workflowId,
      requestId: args.requestId,
      taskType: 'unknown_human_review',
      sequence: args.sequence,
      status: 'required',
      input: {
        failedTaskId: args.failedTask.id,
        failedTaskType: args.failedTask.taskType,
        ...args.failureContext,
      },
      output: {
        route: 'unknown_human_review',
        reason: args.reason,
      },
      reason: args.reason,
    },
  });
}
