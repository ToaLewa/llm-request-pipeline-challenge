import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { formatLabel } from '../format';
import type { AppRoute, WorkflowActionResult, WorkflowDetail, WorkflowDetailState, WorkflowTaskSummary } from '../types';
import { ChatPanel } from './ChatPanel';
import { Navigation } from './Navigation';

type WorkflowDetailPageProps = {
  workflowId: number;
  onNavigate: (route: AppRoute) => void;
};

type WorkflowActionState =
  | { status: 'idle'; message?: never }
  | { status: 'submitting'; message?: never }
  | { status: 'completed' | 'unsupported' | 'needs_review' | 'error'; message: string };

export function WorkflowDetailPage({ workflowId, onNavigate }: WorkflowDetailPageProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowDetailState>({ status: 'loading' });
  const [taskDraft, setTaskDraft] = useState('');
  const [actionState, setActionState] = useState<WorkflowActionState>({ status: 'idle' });
  const isSubmitting = actionState.status === 'submitting';

  useEffect(() => {
    let ignore = false;

    void loadWorkflowDetails(workflowId).then(
      (workflow) => {
        if (!ignore) {
          setWorkflowState({ status: 'loaded', workflow });
        }
      },
      (error: unknown) => {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Workflow request failed.';
          setWorkflowState({ status: 'error', error: message });
        }
      },
    );

    return () => {
      ignore = true;
    };
  }, [workflowId]);

  function handleBackClick(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    window.history.pushState({}, '', '/workflows');
    onNavigate('/workflows');
  }

  async function handleTaskDraftSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const message = taskDraft.trim();

    if (!message) {
      setActionState({ status: 'error', message: 'Enter a workflow action before submitting.' });
      return;
    }

    setActionState({ status: 'submitting' });

    try {
      const response = await fetch(`/api/workflows/${workflowId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json() as WorkflowActionResult | { error?: string };

      if (!response.ok) {
        throw new Error('error' in payload && payload.error ? payload.error : `Workflow action failed with ${response.status}.`);
      }

      const result = payload as WorkflowActionResult;
      setTaskDraft('');
      setActionState({ status: result.status, message: result.message });
      setWorkflowState({ status: 'loaded', workflow: await loadWorkflowDetails(workflowId) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Workflow action failed.';
      setActionState({ status: 'error', message });
    }
  }

  return (
    <section className="page-shell workflows-page">
      <Navigation route="/workflows" onNavigate={onNavigate} />
      <header className="hero">
        <a className="workflow-back-link" href="/workflows" onClick={handleBackClick}>Back to workflows</a>
        <div className="hero-grid">
          <div>
            <h2>Tasks For Workflow #{workflowId}</h2>
          </div>
        </div>
      </header>

      <ChatPanel
        eyebrow="Workflow Action"
        title="Send an instruction"
        description="Tell the workflow what should happen next, such as reassigning the doctor. Unsupported actions will be recorded for auditability."
        textareaId="workflow-task-draft"
        textareaLabel="Task instruction"
        value={taskDraft}
        onChange={setTaskDraft}
        onSubmit={handleTaskDraftSubmit}
        placeholder="Example: Please reassign this to Dr. Emily Chen..."
        submitLabel="Send Action"
        isSubmitting={isSubmitting}
        expandable
        submitDisabled={!taskDraft.trim()}
        status={actionState.status !== 'idle' && actionState.status !== 'submitting' ? actionState.status : undefined}
        statusMessage={actionState.status !== 'idle' && actionState.status !== 'submitting' ? actionState.message : undefined}
      />

      {!isSubmitting &&
        <section className="workflow-table-shell" aria-label="Workflow tasks">
          <table className="workflow-table workflow-task-table">
            <thead>
              <tr>
                <th scope="col">Task</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
                <th scope="col">Request</th>
                <th scope="col">Reason</th>
                <th scope="col">Created</th>
              </tr>
            </thead>
            <tbody>
              {workflowState.status === 'loading' ? (
                <tr>
                  <td className="workflow-table-message" colSpan={7}>Loading workflow tasks...</td>
                </tr>
              ) : null}
              {workflowState.status === 'error' ? (
                <tr>
                  <td className="workflow-table-message is-error" colSpan={7}>{workflowState.error}</td>
                </tr>
              ) : null}
              {workflowState.status === 'loaded' && workflowState.workflow.tasks.length === 0 ? (
                <tr>
                  <td className="workflow-table-message" colSpan={7}>No tasks have been recorded for this workflow.</td>
                </tr>
              ) : null}
              {workflowState.status === 'loaded' ? workflowState.workflow.tasks.slice().reverse().map((task) => <WorkflowTaskRow key={task.id} task={task} />) : null}
            </tbody>
          </table>
        </section>
      }
    </section>
  );
}

function WorkflowTaskRow({ task }: { task: WorkflowTaskSummary }) {
  return (
    <tr>
      <th scope="row">
        <span className="workflow-id">#{task.sequence}</span>
        <span className="workflow-task-type">{formatLabel(task.taskType)}</span>
        <span className="workflow-task-status">Task ID #{task.id}</span>
      </th>
      <td><span className="status-pill status-available">{formatLabel(task.status)}</span></td>
      <td>{formatLabel(task.priority)}</td>
      <td>{task.requestId ? `#${task.requestId}` : 'Automated'}</td>
      <td>
        <span className="workflow-summary">{task.reason ?? task.caseSummary ?? 'No reason recorded'}</span>
        {task.assignedDoctorName ? <span className="workflow-task-status">Assigned to {task.assignedDoctorName}</span> : null}
      </td>
      <td>{formatDate(task.createdAt)}</td>
    </tr>
  );
}

async function loadWorkflowDetails(workflowId: number): Promise<WorkflowDetail> {
  const response = await fetch(`/api/workflows/${workflowId}`);
  const payload = (await response.json()) as { workflow?: WorkflowDetail; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? `Workflow request failed with ${response.status}.`);
  }

  if (!payload.workflow) {
    throw new Error('Workflow response did not include workflow details.');
  }

  return payload.workflow;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
