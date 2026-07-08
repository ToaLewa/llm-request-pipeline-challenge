import type { MouseEvent } from 'react';
import type { AppRoute } from '../types';
import { Navigation } from './Navigation';

type LandingPageProps = {
  onNavigate: (route: AppRoute) => void;
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  function handleNavigationClick(event: MouseEvent<HTMLAnchorElement>, route: AppRoute): void {
    event.preventDefault();
    window.history.pushState({}, '', route);
    onNavigate(route);
  }

  return (
    <section className="page-shell landing-page">
      <Navigation route="/" onNavigate={onNavigate} />
      <header className="landing-hero hero-grid">
        <div>
          <p className="eyebrow">Clinical Operations Command Center</p>
          <h2>Turn urgent medical requests into coordinated care.</h2>
          <p className="intro">
            Dragon Flight Medical gives intake teams one place to capture requests, launch durable workflows, and keep the right clinicians aligned from first message to final handoff.
          </p>
          <div className="hero-actions">
            <a href="/requests" className="button-link" onClick={(event) => handleNavigationClick(event, '/requests')}>Start a Request</a>
            <a href="/workflows" className="button-link button-link-secondary" onClick={(event) => handleNavigationClick(event, '/workflows')}>See Active Workflows</a>
            <span className="action-note">Built for high-stakes coordination, not spreadsheet triage.</span>
          </div>
        </div>
      </header>

      <section className="feature-grid" aria-label="Platform benefits">
        <article className="feature-card">
          <span className="feature-number">Faster Intake</span>
          <h2>Capture the full story once.</h2>
          <p>Bring free-text medical operations requests into a guided workspace that preserves context and gets teams moving quickly.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">Clear Ownership</span>
          <h2>Know who is handling what.</h2>
          <p>Track open workflows, assigned clinicians, priorities, and status without digging through chat threads or inboxes.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">Safer Handoffs</span>
          <h2>Keep decisions visible.</h2>
          <p>Document routing context and follow-up actions so every handoff carries the reasoning needed for confident care coordination.</p>
        </article>
      </section>

      <section className="landing-proof" aria-label="Why teams use Dragon Flight Medical">
        <div>
          <p className="eyebrow">Purpose Built</p>
          <h2>Less administrative drag. More clinical momentum.</h2>
        </div>
        <p>
          The platform connects intake, workflow tracking, and clinical team visibility so operational requests do not disappear between systems. It is a focused workspace for teams that need speed, accountability, and a reliable record of what happened next.
        </p>
      </section>
    </section>
  );
}
