import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Doctor = {
  id: number;
  name: string;
  description: string;
  ptoStatus: boolean;
  active: boolean;
  currentLoad: number;
  specialties: string[];
  skills: string[];
  caseTypes: string[];
};

type DoctorPoolState =
  | { status: 'loading'; doctors: Doctor[]; error?: never }
  | { status: 'loaded'; doctors: Doctor[]; error?: never }
  | { status: 'error'; doctors: Doctor[]; error: string };

type AppRoute = '/' | '/doctors';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root element was not found.');
}

function getRoute(): AppRoute {
  return window.location.pathname === '/doctors' ? '/doctors' : '/';
}

function availabilityLabel(doctor: Doctor): string {
  if (!doctor.active) {
    return 'Inactive';
  }

  return doctor.ptoStatus ? 'On PTO' : 'Available';
}

function Tags({ values }: { values: string[] }) {
  return (
    <>
      {values.map((value) => (
        <span className="tag" key={value}>
          {value}
        </span>
      ))}
    </>
  );
}

function Navigation({ route, onNavigate }: { route: AppRoute; onNavigate: (route: AppRoute) => void }) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, nextRoute: AppRoute): void {
    event.preventDefault();
    window.history.pushState({}, '', nextRoute);
    onNavigate(nextRoute);
  }

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <a href="/" className="brand" onClick={(event) => handleClick(event, '/')}>Request Pipeline</a>
      <div className="nav-links">
        <a href="/" className={route === '/' ? 'is-active' : ''} onClick={(event) => handleClick(event, '/')}>Home</a>
        <a href="/doctors" className={route === '/doctors' ? 'is-active' : ''} onClick={(event) => handleClick(event, '/doctors')}>Doctor Pool</a>
      </div>
    </nav>
  );
}

function LandingPage({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
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

function DoctorsPage({
  doctorPoolState,
  onNavigate,
}: {
  doctorPoolState: DoctorPoolState;
  onNavigate: (route: AppRoute) => void;
}) {
  const { doctors } = doctorPoolState;

  return (
    <section className="page-shell doctors-page">
      <Navigation route="/doctors" onNavigate={onNavigate} />
      <header className="hero">
        <p className="eyebrow">Doctor Assignment</p>
        <div className="hero-grid">
          <div>
            <h1>Doctor Pool</h1>
            <p className="intro">Specialists available to the request pipeline, grouped by normalized skills and case types.</p>
          </div>
          <aside className="summary-card" aria-label="Doctor pool summary">
            <span className="summary-number">{doctors.length}</span>
            <span className="summary-label">Doctors in pool</span>
            <span className="summary-detail">{doctors.filter((doctor) => !doctor.ptoStatus && doctor.active).length} available for auto-assignment</span>
          </aside>
        </div>
      </header>

      <section className="doctor-grid" aria-label="Doctors">
        {doctors.length > 0 ? doctors.map((doctor) => <DoctorCard doctor={doctor} key={doctor.id} />) : <DoctorPoolStatus doctorPoolState={doctorPoolState} />}
      </section>
    </section>
  );
}

function DoctorPoolStatus({ doctorPoolState }: { doctorPoolState: DoctorPoolState }) {
  if (doctorPoolState.status === 'error') {
    return <p className="doctor-grid-message">Unable to load doctors from the database. {doctorPoolState.error}</p>;
  }

  if (doctorPoolState.status === 'loading') {
    return <p className="doctor-grid-message">Loading doctors from the database...</p>;
  }

  return <p className="doctor-grid-message">No doctors found in the database.</p>;
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const muted = doctor.ptoStatus || !doctor.active;
  const statusClass = muted ? 'status-pto' : 'status-available';

  return (
    <article className={`doctor-card ${muted ? 'is-muted' : ''}`}>
      <div className="doctor-card-header">
        <div>
          <p className="doctor-role">Pathologist</p>
          <h2>{doctor.name}</h2>
        </div>
        <span className={`status-pill ${statusClass}`}>{availabilityLabel(doctor)}</span>
      </div>
      <p className="doctor-description">{doctor.description}</p>
      <div className="load-meter" aria-label={`Current load ${doctor.currentLoad}`}>
        <span>Current load</span>
        <strong>{doctor.currentLoad}</strong>
      </div>
      <div className="skill-section">
        <h3>Specialties</h3>
        <div className="tag-list"><Tags values={doctor.specialties} /></div>
      </div>
      <div className="skill-section">
        <h3>Clinical Skills</h3>
        <div className="tag-list"><Tags values={doctor.skills} /></div>
      </div>
      <div className="skill-section">
        <h3>Case Types</h3>
        <div className="tag-list"><Tags values={doctor.caseTypes} /></div>
      </div>
    </article>
  );
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

  return route === '/doctors' ? (
    <DoctorsPage doctorPoolState={doctorPoolState} onNavigate={setRoute} />
  ) : (
    <LandingPage onNavigate={setRoute} />
  );
}

createRoot(app).render(<App />);
