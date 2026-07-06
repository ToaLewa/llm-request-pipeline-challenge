import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DoctorsPage } from './components/DoctorsPage';
import { LandingPage } from './components/LandingPage';
import { RequestsPage } from './components/RequestsPage';
import './styles.css';
import type { AppRoute, Doctor, DoctorPoolState } from './types';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root element was not found.');
}

function getRoute(): AppRoute {
  if (window.location.pathname === '/requests') {
    return '/requests';
  }

  return window.location.pathname === '/doctors' ? '/doctors' : '/';
}

function App() {
  const [route, setRoute] = useState<AppRoute>(getRoute);
  const [doctorPoolState, setDoctorPoolState] = useState<DoctorPoolState>({ status: 'loading', doctors: [] });

  useEffect(() => {
    function handlePopState(): void {
      setRoute(getRoute());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadDoctorPool(): Promise<void> {
      setDoctorPoolState((current) => ({ status: 'loading', doctors: current.doctors }));

      try {
        const response = await fetch('/api/doctors');

        if (!response.ok) {
          throw new Error(`Doctor pool request failed with ${response.status}.`);
        }

        const payload = (await response.json()) as { doctors?: Doctor[] };

        if (!ignore) {
          setDoctorPoolState({ status: 'loaded', doctors: payload.doctors ?? [] });
        }
      } catch (error) {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Doctor pool request failed.';
          setDoctorPoolState((current) => ({ status: 'error', doctors: current.doctors, error: message }));
        }
      }
    }

    void loadDoctorPool();

    return () => {
      ignore = true;
    };
  }, []);

  if (route === '/requests') {
    return <RequestsPage onNavigate={setRoute} />;
  }

  return route === '/doctors' ? (
    <DoctorsPage doctorPoolState={doctorPoolState} onNavigate={setRoute} />
  ) : (
    <LandingPage onNavigate={setRoute} />
  );
}

createRoot(app).render(<App />);
