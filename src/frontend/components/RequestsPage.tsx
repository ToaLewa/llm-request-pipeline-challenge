import { useState } from 'react';
import { formatLabel } from '../format';
import type { AppRoute, RequestSubmissionResult } from '../types';
import { useAppNavigation } from '../useAppNavigation';
import { LoadingSpinner } from './LoadingSpinner';
import { Navigation } from './Navigation';

type RequestsPageProps = {
  onNavigate: (route: AppRoute) => void;
};

type SubmissionState =
  | { status: 'idle'; result?: never; error?: never }
  | { status: 'submitting'; result?: never; error?: never }
  | { status: 'success'; result: RequestSubmissionResult; error?: never }
  | { status: 'error'; result?: never; error: string };

export function RequestsPage({ onNavigate }: RequestsPageProps) {
  const [requestText, setRequestText] = useState('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle' });
  const { handleNavigationClick } = useAppNavigation(onNavigate);
  const isSubmitting = submissionState.status === 'submitting';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const rawRequest = requestText.trim();

    if (!rawRequest) {
      setSubmissionState({ status: 'error', error: 'Enter a request before routing it.' });
      return;
    }

    setSubmissionState({ status: 'submitting' });

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawRequest }),
      });
      const payload = await response.json() as RequestSubmissionResult | { error?: string };

      if (!response.ok) {
        throw new Error('error' in payload && payload.error ? payload.error : `Request routing failed with ${response.status}.`);
      }

      setSubmissionState({ status: 'success', result: payload as RequestSubmissionResult });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request routing failed.';
      setSubmissionState({ status: 'error', error: message });
    }
  }

  return (
    <section className="page-shell requests-page">
      <Navigation route="/requests" onNavigate={onNavigate} />
      <main className="request-workspace">
        <section className="request-panel workflow-chat-panel" aria-labelledby="request-title">
          <div className="request-heading workflow-chat-summary">
            <span>
              <span className="eyebrow">New Request</span>
              <span className="workflow-chat-title" id="request-title">Route a request</span>
            </span>
          </div>

          <div className="workflow-chat-content">
            <p>Describe your request in plain language, and we will route this to the appropriate team.</p>

            <LoadingSpinner
              isLoading={isSubmitting}
              className="request-thinking workflow-action-thinking"
              spinnerClassName="workflow-action-spinner"
              message="The server is thinking through the best workflow."
            />

            {!isSubmitting ? (
              <form className="request-composer workflow-chat-composer" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="request-text">Request details</label>
                <textarea
                  id="request-text"
                  value={requestText}
                  onChange={(event) => setRequestText(event.target.value)}
                  placeholder="Paste or type the full request here..."
                  rows={4}
                />
                <div className="composer-actions">
                  <span>{requestText.trim().length} characters ready for routing</span>
                  <button type="submit">Route Request</button>
                </div>
              </form>
            ) : null}
          </div>
        </section>

        {submissionState.status === 'success' ? (
          <aside className="routing-result" aria-live="polite">
            <span className="result-label">Routed to</span>
            <strong>{formatLabel(submissionState.result.routingDecision.route)}</strong>
            <p>{submissionState.result.routingDecision.reason}</p>
            <dl>
              <div><dt>Priority</dt><dd>{submissionState.result.routingDecision.priority}</dd></div>
              <div><dt>Confidence</dt><dd>{Math.round(submissionState.result.routingDecision.confidence * 100)}%</dd></div>
              <div className="workflow-result">
                <a
                  className="workflow-result-link"
                  href={getWorkflowRoute(submissionState.result.workflowId)}
                  aria-label={`Open workflow ${submissionState.result.workflowId}`}
                  onClick={(event) => handleNavigationClick(event, getWorkflowRoute(submissionState.result.workflowId))}
                />
                <dt>Workflow</dt>
                <dd>#{submissionState.result.workflowId}</dd>
              </div>
            </dl>
          </aside>
        ) : null}

        {submissionState.status === 'error' ? <p className="request-error" role="alert">{submissionState.error}</p> : null}
      </main>
    </section>
  );
}

function getWorkflowRoute(workflowId: number): AppRoute {
  return `/workflows/${workflowId}`;
}
