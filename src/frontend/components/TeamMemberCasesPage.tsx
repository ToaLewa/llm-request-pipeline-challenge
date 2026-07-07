import { useEffect, useState, type MouseEvent } from 'react';
import { formatLabel } from '../format';
import type { AppRoute, AssignedCase, TeamMemberCases, TeamMemberCasesState } from '../types';
import { useAppNavigation } from '../useAppNavigation';
import { Navigation } from './Navigation';

type TeamMemberCasesPageProps = {
  teamMemberId: number;
  onNavigate: (route: AppRoute) => void;
};

export function TeamMemberCasesPage({ teamMemberId, onNavigate }: TeamMemberCasesPageProps) {
  const [teamMemberCasesState, setTeamMemberCasesState] = useState<TeamMemberCasesState>({ status: 'loading' });

  useEffect(() => {
    let ignore = false;

    void loadTeamMemberCases(teamMemberId).then(
      (teamMemberCases) => {
        if (!ignore) {
          setTeamMemberCasesState({ status: 'loaded', teamMemberCases });
        }
      },
      (error: unknown) => {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Team member cases request failed.';
          setTeamMemberCasesState({ status: 'error', error: message });
        }
      },
    );

    return () => {
      ignore = true;
    };
  }, [teamMemberId]);

  function handleBackClick(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    window.history.pushState({}, '', '/clinical-team');
    onNavigate('/clinical-team');
  }

  const loadedCases = teamMemberCasesState.status === 'loaded' ? teamMemberCasesState.teamMemberCases.cases : [];
  const teamMemberName = teamMemberCasesState.status === 'loaded' ? teamMemberCasesState.teamMemberCases.teamMember.name : `Team member #${teamMemberId}`;

  return (
    <section className="page-shell workflows-page">
      <Navigation route="/clinical-team" onNavigate={onNavigate} />
      <header className="hero">
        <a className="workflow-back-link" href="/clinical-team" onClick={handleBackClick}>Back to clinical team</a>
        <div className="hero-grid">
          <div>
            <h2>{teamMemberName}</h2>
            <p className="intro">Assigned cases for this clinical team member, including workflow context and current task status.</p>
          </div>
          <aside className="summary-card" aria-label="Assigned cases summary">
            <span className="summary-number">{loadedCases.length}</span>
            <span className="summary-label">Assigned cases</span>
            <span className="summary-detail">Cases currently recorded for this member</span>
          </aside>
        </div>
      </header>

      <section className="workflow-table-shell" aria-label="Assigned cases">
        <table className="workflow-table assigned-cases-table">
          <thead>
            <tr>
              <th scope="col">Case</th>
              <th scope="col">Workflow</th>
              <th scope="col">Status</th>
              <th scope="col">Priority</th>
              <th scope="col">Case Type</th>
              <th scope="col">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {teamMemberCasesState.status === 'loading' ? (
              <tr>
                <td className="workflow-table-message" colSpan={6}>Loading assigned cases...</td>
              </tr>
            ) : null}
            {teamMemberCasesState.status === 'error' ? (
              <tr>
                <td className="workflow-table-message is-error" colSpan={6}>{teamMemberCasesState.error}</td>
              </tr>
            ) : null}
            {teamMemberCasesState.status === 'loaded' && loadedCases.length === 0 ? (
              <tr>
                <td className="workflow-table-message" colSpan={6}>No cases are assigned to this team member.</td>
              </tr>
            ) : null}
            {teamMemberCasesState.status === 'loaded' ? loadedCases.map((assignedCase) => <AssignedCaseRow assignedCase={assignedCase} key={assignedCase.id} onNavigate={onNavigate} />) : null}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function AssignedCaseRow({ assignedCase, onNavigate }: { assignedCase: AssignedCase; onNavigate: (route: AppRoute) => void }) {
  const { handleNavigationClick } = useAppNavigation(onNavigate);
  const workflowRoute: AppRoute = `/workflows/${assignedCase.workflowId}`;

  return (
    <tr>
      <th scope="row">
        <span className="workflow-id">Assignment #{assignedCase.id}</span>
        <span className="workflow-summary">{assignedCase.caseSummary ?? assignedCase.assignmentSummary}</span>
        {assignedCase.reason ? <span className="workflow-task-status">{assignedCase.reason}</span> : null}
      </th>
      <td>
        <a className="workflow-row-link" href={workflowRoute} onClick={(event) => handleNavigationClick(event, workflowRoute)}>
          <span className="workflow-task-type">Workflow #{assignedCase.workflowId}</span>
          <span className="workflow-task-status">Task #{assignedCase.workflowTaskId}</span>
        </a>
      </td>
      <td><span className="status-pill status-available">{formatLabel(assignedCase.status)}</span></td>
      <td>{formatLabel(assignedCase.priority)}</td>
      <td>{formatLabel(assignedCase.caseType)}</td>
      <td>{formatDate(assignedCase.assignedAt)}</td>
    </tr>
  );
}

async function loadTeamMemberCases(teamMemberId: number): Promise<TeamMemberCases> {
  const response = await fetch(`/api/clinical-team/${teamMemberId}/cases`);
  const payload = (await response.json()) as TeamMemberCases | { error?: string };

  if (!response.ok) {
    throw new Error('error' in payload && payload.error ? payload.error : `Team member cases request failed with ${response.status}.`);
  }

  if (!('teamMember' in payload) || !Array.isArray(payload.cases)) {
    throw new Error('Team member cases response did not include assigned cases.');
  }

  return payload;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
