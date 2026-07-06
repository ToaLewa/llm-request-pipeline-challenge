import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root element was not found.');
}

const appRoot = app;

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

let doctorPoolState: DoctorPoolState = { status: 'loading', doctors: [] };

async function loadDoctorPool(): Promise<void> {
  doctorPoolState = { status: 'loading', doctors: doctorPoolState.doctors };
  renderApp();

  try {
    const response = await fetch('/api/doctors');

    if (!response.ok) {
      throw new Error(`Doctor pool request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as { doctors?: Doctor[] };
    doctorPoolState = { status: 'loaded', doctors: payload.doctors ?? [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Doctor pool request failed.';
    doctorPoolState = { status: 'error', doctors: doctorPoolState.doctors, error: message };
  }

  if (getRoute() === '/doctors') {
    renderApp();
  }
}

function renderTags(values: string[]): string {
  return values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join('');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    };

    return replacements[character];
  });
}

function availabilityLabel(doctor: Doctor): string {
  if (!doctor.active) {
    return 'Inactive';
  }

  return doctor.ptoStatus ? 'On PTO' : 'Available';
}

function getRoute(): AppRoute {
  return window.location.pathname === '/doctors' ? '/doctors' : '/';
}

function renderNavigation(route: AppRoute): string {
  return `
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="/" class="brand" data-link>Request Pipeline</a>
      <div class="nav-links">
        <a href="/" class="${route === '/' ? 'is-active' : ''}" data-link>Home</a>
        <a href="/doctors" class="${route === '/doctors' ? 'is-active' : ''}" data-link>Doctor Pool</a>
      </div>
    </nav>
  `;
}

function renderLandingPage(): string {
  return `
    <section class="page-shell landing-page">
      ${renderNavigation('/')}
      <header class="landing-hero">
        <p class="eyebrow">LLM Request Pipeline</p>
        <h1>Route requests to the right clinical workflow.</h1>
        <p class="intro">
          Classify incoming operational requests, identify doctor-assignment cases, and prepare structured context for candidate matching.
        </p>
        <div class="hero-actions">
          <a href="/doctors" class="button-link" data-link>View Doctor Pool</a>
          <span class="action-note">Normalized skills power assignment decisions.</span>
        </div>
      </header>
      <section class="feature-grid" aria-label="Pipeline capabilities">
        <article class="feature-card">
          <span class="feature-number">01</span>
          <h2>Classify</h2>
          <p>Turn raw requests into structured routing decisions with priority, case type, and clinical context.</p>
        </article>
        <article class="feature-card">
          <span class="feature-number">02</span>
          <h2>Match</h2>
          <p>Use normalized specialties, clinical skills, and case types to find available doctors.</p>
        </article>
        <article class="feature-card">
          <span class="feature-number">03</span>
          <h2>Rank</h2>
          <p>Prepare concise candidate payloads for ranking by expertise fit and current workload.</p>
        </article>
      </section>
    </section>
  `;
}

function renderDoctorsPage(): string {
  const { doctors } = doctorPoolState;
  const doctorCards = doctors.map(renderDoctorCard).join('');
  const statusContent = renderDoctorPoolStatus();

  return `
    <section class="page-shell doctors-page">
      ${renderNavigation('/doctors')}
      <header class="hero">
        <p class="eyebrow">Doctor Assignment</p>
        <div class="hero-grid">
          <div>
            <h1>Doctor Pool</h1>
            <p class="intro">
              Specialists available to the request pipeline, grouped by normalized skills and case types.
            </p>
          </div>
          <aside class="summary-card" aria-label="Doctor pool summary">
            <span class="summary-number">${doctors.length}</span>
            <span class="summary-label">Doctors in pool</span>
            <span class="summary-detail">${doctors.filter((doctor) => !doctor.ptoStatus && doctor.active).length} available for auto-assignment</span>
          </aside>
        </div>
      </header>

      <section class="doctor-grid" aria-label="Doctors">
        ${doctorCards || statusContent}
      </section>
    </section>
  `;
}

function renderDoctorPoolStatus(): string {
  if (doctorPoolState.status === 'error') {
    return `<p class="doctor-grid-message">Unable to load doctors from the database. ${escapeHtml(doctorPoolState.error)}</p>`;
  }

  if (doctorPoolState.status === 'loading') {
    return '<p class="doctor-grid-message">Loading doctors from the database...</p>';
  }

  return '<p class="doctor-grid-message">No doctors found in the database.</p>';
}

function renderDoctorCard(doctor: Doctor): string {
  const statusClass = doctor.ptoStatus || !doctor.active ? 'status-pto' : 'status-available';

  return `
    <article class="doctor-card ${doctor.ptoStatus || !doctor.active ? 'is-muted' : ''}">
      <div class="doctor-card-header">
        <div>
          <p class="doctor-role">Pathologist</p>
          <h2>${escapeHtml(doctor.name)}</h2>
        </div>
        <span class="status-pill ${statusClass}">
          ${availabilityLabel(doctor)}
        </span>
      </div>
      <p class="doctor-description">${escapeHtml(doctor.description)}</p>
      <div class="load-meter" aria-label="Current load ${doctor.currentLoad}">
        <span>Current load</span>
        <strong>${doctor.currentLoad}</strong>
      </div>
      <div class="skill-section">
        <h3>Specialties</h3>
        <div class="tag-list">${renderTags(doctor.specialties)}</div>
      </div>
      <div class="skill-section">
        <h3>Clinical Skills</h3>
        <div class="tag-list">${renderTags(doctor.skills)}</div>
      </div>
      <div class="skill-section">
        <h3>Case Types</h3>
        <div class="tag-list">${renderTags(doctor.caseTypes)}</div>
      </div>
    </article>
  `;
}

function renderApp(): void {
  const route = getRoute();
  appRoot.innerHTML = route === '/doctors' ? renderDoctorsPage() : renderLandingPage();
}

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-link]');

  if (!link || link.origin !== window.location.origin) {
    return;
  }

  event.preventDefault();
  window.history.pushState({}, '', link.href);
  renderApp();
});

window.addEventListener('popstate', renderApp);

renderApp();
void loadDoctorPool();
