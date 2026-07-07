import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { formatLabel } from '../format';
import type { AppRoute, WorkflowDetail, WorkflowDetailState, WorkflowTaskSummary } from '../types';
import { Navigation } from './Navigation';

type WorkflowDetailPageProps = {
  workflowId: number;
  onNavigate: (route: AppRoute) => void;
};

export function WorkflowDetailPage({ workflowId, onNavigate }: WorkflowDetailPageProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowDetailState>({ status: 'loading' });
  const [taskDraft, setTaskDraft] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadWorkflow(): Promise<void> {
      setWorkflowState({ status: 'loading' });

      try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        const payload = (await response.json()) as { workflow?: WorkflowDetail; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? `Workflow request failed with ${response.status}.`);
        }

        if (!payload.workflow) {
          throw new Error('Workflow response did not include workflow details.');
        }

        if (!ignore) {
          setWorkflowState({ status: 'loaded', workflow: payload.workflow });
        }
      } catch (error) {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Workflow request failed.';
          setWorkflowState({ status: 'error', error: message });
        }
      }
    }

    void loadWorkflow();

    return () => {
      ignore = true;
    };
  }, [workflowId]);

  function handleBackClick(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    window.history.pushState({}, '', '/workflows');
    onNavigate('/workflows');
  }

  function handleTaskDraftSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
  }

  return (
    <section className="page-shell workflows-page">
      <Navigation route="/workflows" onNavigate={onNavigate} />
      <header className="hero">
        <a className="workflow-back-link" href="/workflows" onClick={handleBackClick}>Back to workflows</a>
        <p className="eyebrow header-label">
          <span className="logo-mark" aria-hidden="true"></span>
          <span>Workflow Tasks</span>
        </p>
        <div className="hero-grid">
          <div>
            <h1>Workflow #{workflowId}</h1>
            <p className="intro">Review every task associated with this workflow in execution order.</p>
          </div>
          {workflowState.status === 'loaded' ? (
            <aside className="summary-card" aria-label="Workflow task summary">
              <span className="summary-number">{workflowState.workflow.tasks.length}</span>
              <span className="summary-label">Tasks recorded</span>
              <span className="summary-detail">{formatLabel(workflowState.workflow.status)} workflow with {workflowState.workflow.requestCount} request source{workflowState.workflow.requestCount === 1 ? '' : 's'}</span>
            </aside>
          ) : null}
        </div>
      </header>

      <details className="workflow-chat-panel">
        <summary className="workflow-chat-summary">
          <span>
            <span className="eyebrow">Task Chat</span>
            <span className="workflow-chat-title">Create a follow-up task</span>
          </span>
          <span className="workflow-chat-toggle">Expand</span>
        </summary>
        <div className="workflow-chat-content">
          <p>Draft the next instruction for this workflow. Task creation will be connected here next.</p>
          <form className="workflow-chat-composer" onSubmit={handleTaskDraftSubmit}>
            <label className="sr-only" htmlFor="workflow-task-draft">Task instruction</label>
            <textarea
              id="workflow-task-draft"
              value={taskDraft}
              onChange={(event) => setTaskDraft(event.target.value)}
              placeholder="Ask for a new task, clarification, or follow-up action for this workflow..."
              rows={4}
            />
            <div className="composer-actions">
              <span>{taskDraft.trim().length} characters drafted</span>
              <button type="submit" disabled>Create task soon</button>
            </div>
          </form>
        </div>
      </details>

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
      <td><span className="workflow-summary">{task.reason ?? task.caseSummary ?? 'No reason recorded'}</span></td>
      <td>{formatDate(task.createdAt)}</td>
    </tr>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
