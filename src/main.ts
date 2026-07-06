import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root element was not found.');
}

const appRoot = app;

const doctors = [
  {
    name: 'Dr. Emily Chen',
    description: 'Renal pathologist focused on autoimmune kidney disease and complex biopsy interpretation.',
    ptoStatus: false,
    active: true,
    currentLoad: 4,
    specialties: ['Renal Pathology', 'Nephropathology'],
    skills: ['Lupus Nephritis', 'Glomerulonephritis'],
    caseTypes: ['Renal Biopsy'],
  },
  {
    name: 'Dr. Ravi Patel',
    description: 'General surgical pathologist with broad biopsy review experience and GI pathology coverage.',
    ptoStatus: false,
    active: true,
    currentLoad: 2,
    specialties: ['General Surgical Pathology'],
    skills: ['GI Pathology'],
    caseTypes: ['Biopsy Review'],
  },
  {
    name: 'Dr. Maria Gomez',
    description: 'Renal pathology specialist with glomerulonephritis expertise, currently unavailable for assignment.',
    ptoStatus: true,
    active: true,
    currentLoad: 1,
    specialties: ['Renal Pathology'],
    skills: ['Glomerulonephritis'],
    caseTypes: ['Renal Biopsy'],
  },
];

type AppRoute = '/' | '/doctors';

function renderTags(values: string[]): string {
  return values.map((value) => `<span class="tag">${value}</span>`).join('');
}

function availabilityLabel(doctor: (typeof doctors)[number]): string {
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
        ${doctors
          .map(
            (doctor) => `
              <article class="doctor-card ${doctor.ptoStatus ? 'is-muted' : ''}">
                <div class="doctor-card-header">
                  <div>
                    <p class="doctor-role">Pathologist</p>
                    <h2>${doctor.name}</h2>
                  </div>
                  <span class="status-pill ${doctor.ptoStatus ? 'status-pto' : 'status-available'}">
                    ${availabilityLabel(doctor)}
                  </span>
                </div>
                <p class="doctor-description">${doctor.description}</p>
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
            `,
          )
          .join('')}
      </section>
    </section>
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
