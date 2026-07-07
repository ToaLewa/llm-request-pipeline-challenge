import type { AppRoute, ClinicalTeamState } from '../types';
import { DoctorCard } from './DoctorCard';
import { ClinicalTeamStatus } from './ClinicalTeamStatus';
import { Navigation } from './Navigation';

type DoctorsPageProps = {
  clinicalTeamState: ClinicalTeamState;
  onNavigate: (route: AppRoute) => void;
};

export function DoctorsPage({ clinicalTeamState, onNavigate }: DoctorsPageProps) {
  const { doctors } = clinicalTeamState;

  return (
    <section className="page-shell doctors-page">
      <Navigation route="/clinical-team" onNavigate={onNavigate} />
      <header className="hero">
        <div className="hero-grid">
          <div>
            <h2>Clinical Team</h2>
            <p className="intro">Specialists available to the request pipeline, grouped by normalized skills and case types.</p>
          </div>
          <aside className="summary-card" aria-label="Clinical team summary">
            <span className="summary-number">{doctors.length}</span>
            <span className="summary-label">Clinical team members</span>
            <span className="summary-detail">{doctors.filter((doctor) => !doctor.ptoStatus && doctor.active).length} available for auto-assignment</span>
          </aside>
        </div>
      </header>

      <section className="doctor-grid" aria-label="Doctors">
        {doctors.length > 0 ? doctors.map((doctor) => <DoctorCard doctor={doctor} key={doctor.id} />) : <ClinicalTeamStatus clinicalTeamState={clinicalTeamState} />}
      </section>
    </section>
  );
}
