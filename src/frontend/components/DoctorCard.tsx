import type { Doctor } from '../types';

type DoctorCardProps = {
  doctor: Doctor;
};

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

export function DoctorCard({ doctor }: DoctorCardProps) {
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
