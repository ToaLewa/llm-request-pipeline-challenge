import { useEffect, useState, type MouseEvent } from 'react';
import { formatLabel } from '../format';
import type { AppRoute, WorkflowListState, WorkflowSummary } from '../types';
import { Navigation } from './Navigation';

type WorkflowsPageProps = {
  onNavigate: (route: AppRoute) => void;
};

export function WorkflowsPage({ onNavigate }: WorkflowsPageProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowListState>({ status: 'loading', workflows: [] });

  useEffect(() => {
    let ignore = false;

    async function loadWorkflows(): Promise<void> {
      setWorkflowState((current) => ({ status: 'loading', workflows: current.workflows }));

      try {
        const response = await fetch('/api/workflows');

        if (!response.ok) {
          throw new Error(`Workflow request failed with ${response.status}.`);
        }

        const payload = (await response.json()) as { workflows?: WorkflowSummary[] };

        if (!ignore) {
          setWorkflowState({ status: 'loaded', workflows: payload.workflows ?? [] });
        }
      } catch (error) {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Workflow request failed.';
          setWorkflowState((current) => ({ status: 'error', workflows: current.workflows, error: message }));
        }
      }
    }

    void loadWorkflows();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="page-shell workflows-page">
      <Navigation route="/workflows" onNavigate={onNavigate} />
      <header className="hero">
        <p className="eyebrow header-label">
          <span className="logo-mark" aria-hidden="true"></span>
          <span>Workflow Monitor</span>
        </p>
        <div className="hero-grid">
          <div>
            <h1>Workflows</h1>
            <p className="intro">Track routed requests as durable workflows with their latest task state and routing context.</p>
          </div>
          <aside className="summary-card" aria-label="Workflow summary">
            <span className="summary-number">{workflowState.workflows.length}</span>
            <span className="summary-label">Workflows tracked</span>
            <span className="summary-detail">{workflowState.workflows.filter((workflow) => workflow.status === 'active').length} active in the pipeline</span>
          </aside>
        </div>
      </header>

      <section className="workflow-table-shell" aria-label="Workflows">
        <table className="workflow-table">
          <thead>
            <tr>
              <th scope="col">Workflow</th>
              <th scope="col">Status</th>
              <th scope="col">Route</th>
              <th scope="col">Priority</th>
              <th scope="col">Latest Task</th>
              <th scope="col">Requests</th>
              <th scope="col">Tasks</th>
              <th scope="col">Created</th>
            </tr>
          </thead>
          <tbody>
            {workflowState.status === 'loading' && workflowState.workflows.length === 0 ? (
              <tr>
                <td className="workflow-table-message" colSpan={8}>Loading workflows...</td>
              </tr>
            ) : null}
            {workflowState.status === 'error' ? (
              <tr>
                <td className="workflow-table-message is-error" colSpan={8}>{workflowState.error}</td>
              </tr>
            ) : null}
            {workflowState.status === 'loaded' && workflowState.workflows.length === 0 ? (
              <tr>
                <td className="workflow-table-message" colSpan={8}>No workflows have been created yet.</td>
              </tr>
            ) : null}
            {workflowState.workflows.map((workflow) => <WorkflowTableRow key={workflow.id} workflow={workflow} onNavigate={onNavigate} />)}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function WorkflowTableRow({ workflow, onNavigate }: { workflow: WorkflowSummary; onNavigate: (route: AppRoute) => void }) {
  const workflowRoute = `/workflows/${workflow.id}` as const;

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    window.history.pushState({}, '', workflowRoute);
    onNavigate(workflowRoute);
  }

  return (
    <tr>
      <th scope="row">
        <a className="workflow-row-link" href={workflowRoute} onClick={handleClick}>
          <span className="workflow-id">#{workflow.id}</span>
          <span className="workflow-summary">{workflow.caseSummary ?? workflow.reason ?? 'Routing details pending'}</span>
        </a>
      </th>
      <td><span className="status-pill status-available">{formatLabel(workflow.status)}</span></td>
      <td>{formatLabel(workflow.route)}</td>
      <td>{formatLabel(workflow.priority)}</td>
      <td>
        <span className="workflow-task-type">{formatLabel(workflow.latestTaskType)}</span>
        <span className="workflow-task-status">{formatLabel(workflow.latestTaskStatus)}</span>
      </td>
      <td>{workflow.requestCount}</td>
      <td>{workflow.taskCount}</td>
      <td>{formatDate(workflow.createdAt)}</td>
    </tr>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
