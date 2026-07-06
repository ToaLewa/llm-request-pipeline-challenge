import type { AppRoute } from '../types';
import { Navigation } from './Navigation';

type LandingPageProps = {
  onNavigate: (route: AppRoute) => void;
};

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <section className="page-shell landing-page">
      <Navigation route="/" onNavigate={onNavigate} />
      <header className="landing-hero">
        <p className="eyebrow">LLM Request Pipeline</p>
        <h1>Route requests to the right clinical workflow.</h1>
        <p className="intro">
          Classify incoming operational requests, identify doctor-assignment cases, and prepare structured context for candidate matching.
        </p>
        <div className="hero-actions">
          <a href="/requests" className="button-link" onClick={(event) => {
            event.preventDefault();
            window.history.pushState({}, '', '/requests');
            onNavigate('/requests');
          }}>Create Request</a>
          <a href="/doctors" className="button-link" onClick={(event) => {
            event.preventDefault();
            window.history.pushState({}, '', '/doctors');
            onNavigate('/doctors');
          }}>View Doctor Pool</a>
          <span className="action-note">Normalized skills power assignment decisions.</span>
        </div>
      </header>
      <section className="feature-grid" aria-label="Pipeline capabilities">
        <article className="feature-card">
          <span className="feature-number">01</span>
          <h2>Classify</h2>
          <p>Turn raw requests into structured routing decisions with priority, case type, and clinical context.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">02</span>
          <h2>Match</h2>
          <p>Use normalized specialties, clinical skills, and case types to find available doctors.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">03</span>
          <h2>Rank</h2>
          <p>Prepare concise candidate payloads for ranking by expertise fit and current workload.</p>
        </article>
      </section>
    </section>
  );
}
