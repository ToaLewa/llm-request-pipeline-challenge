import type { AppRoute, DoctorPoolState } from '../types';
import { DoctorCard } from './DoctorCard';
import { DoctorPoolStatus } from './DoctorPoolStatus';
import { Navigation } from './Navigation';

type DoctorsPageProps = {
  doctorPoolState: DoctorPoolState;
  onNavigate: (route: AppRoute) => void;
};

export function DoctorsPage({ doctorPoolState, onNavigate }: DoctorsPageProps) {
  const { doctors } = doctorPoolState;

  return (
    <section className="page-shell doctors-page">
      <Navigation route="/doctors" onNavigate={onNavigate} />
      <header className="hero">
        <div className="hero-grid">
          <div>
            <h2>Doctor Pool</h2>
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
