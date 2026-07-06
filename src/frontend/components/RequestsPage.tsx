import { useState } from 'react';
import type { AppRoute, RequestSubmissionResult } from '../types';
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
        <section className="request-panel" aria-labelledby="request-title">
          <div className="request-heading">
            <p className="eyebrow">New Request</p>
            <h1 id="request-title">What should the pipeline route?</h1>
            <p className="intro">Describe the incoming request in plain language. The backend will classify it, create the first workflow task, and return the routing decision.</p>
          </div>

          {isSubmitting ? (
            <div className="request-thinking" role="status" aria-live="polite">
              <span className="thinking-spinner" aria-hidden="true" />
              <strong>Routing request</strong>
              <p>The server is thinking through the best workflow.</p>
            </div>
          ) : (
            <form className="request-composer" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="request-text">Request details</label>
              <textarea
                id="request-text"
                value={requestText}
                onChange={(event) => setRequestText(event.target.value)}
                placeholder="Paste or type the full request here..."
                rows={12}
              />
              <div className="composer-actions">
                <span>{requestText.trim().length} characters ready for routing</span>
                <button type="submit">Route Request</button>
              </div>
            </form>
          )}
        </section>

        {submissionState.status === 'success' ? (
          <aside className="routing-result" aria-live="polite">
            <span className="result-label">Routed to</span>
            <strong>{submissionState.result.routingDecision.route.split('_').join(' ')}</strong>
            <p>{submissionState.result.routingDecision.reason}</p>
            <dl>
              <div><dt>Priority</dt><dd>{submissionState.result.routingDecision.priority}</dd></div>
              <div><dt>Confidence</dt><dd>{Math.round(submissionState.result.routingDecision.confidence * 100)}%</dd></div>
              <div><dt>Workflow</dt><dd>#{submissionState.result.workflowId}</dd></div>
            </dl>
          </aside>
        ) : null}

        {submissionState.status === 'error' ? <p className="request-error" role="alert">{submissionState.error}</p> : null}
      </main>
    </section>
  );
}
