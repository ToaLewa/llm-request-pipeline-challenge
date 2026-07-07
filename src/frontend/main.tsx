import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ClinicalTeamPage } from './components/ClinicalTeamPage';
import { LandingPage } from './components/LandingPage';
import { RequestsPage } from './components/RequestsPage';
import { WorkflowDetailPage } from './components/WorkflowDetailPage';
import { WorkflowsPage } from './components/WorkflowsPage';
import './styles.css';
import type { AppRoute, Doctor, ClinicalTeamState } from './types';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root element was not found.');
}

function getRoute(): AppRoute {
  if (window.location.pathname === '/requests') {
    return '/requests';
  }

  if (window.location.pathname === '/workflows') {
    return '/workflows';
  }

  const workflowMatch = /^\/workflows\/(\d+)$/.exec(window.location.pathname);

  if (workflowMatch) {
    return `/workflows/${Number.parseInt(workflowMatch[1], 10)}`;
  }

  return window.location.pathname === '/clinical-team' ? '/clinical-team' : '/';
}

function App() {
  const [route, setRoute] = useState<AppRoute>(getRoute);
  const [clinicalTeamState, setClinicalTeamState] = useState<ClinicalTeamState>({ status: 'loading', doctors: [] });

  useEffect(() => {
    function handlePopState(): void {
      setRoute(getRoute());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadClinicalTeam(): Promise<void> {
      setClinicalTeamState((current) => ({ status: 'loading', doctors: current.doctors }));

      try {
        const response = await fetch('/api/clinical-team');

        if (!response.ok) {
          throw new Error(`Clinical team request failed with ${response.status}.`);
        }

        const payload = (await response.json()) as { doctors?: Doctor[] };

        if (!ignore) {
          setClinicalTeamState({ status: 'loaded', doctors: payload.doctors ?? [] });
        }
      } catch (error) {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Clinical team request failed.';
          setClinicalTeamState((current) => ({ status: 'error', doctors: current.doctors, error: message }));
        }
      }
    }

    void loadClinicalTeam();

    return () => {
      ignore = true;
    };
  }, []);

  if (route === '/requests') {
    return <RequestsPage onNavigate={setRoute} />;
  }

  if (route === '/workflows') {
    return <WorkflowsPage onNavigate={setRoute} />;
  }

  if (route.startsWith('/workflows/')) {
    return <WorkflowDetailPage workflowId={Number.parseInt(route.slice('/workflows/'.length), 10)} onNavigate={setRoute} />;
  }

  return route === '/clinical-team' ? (
    <ClinicalTeamPage clinicalTeamState={clinicalTeamState} onNavigate={setRoute} />
  ) : (
    <LandingPage onNavigate={setRoute} />
  );
}

createRoot(app).render(<App />);
