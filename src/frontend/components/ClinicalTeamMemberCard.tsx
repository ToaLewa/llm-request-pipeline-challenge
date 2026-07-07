import type { Doctor } from '../types';

type ClinicalTeamMemberCardProps = {
  member: Doctor;
};

function availabilityLabel(member: Doctor): string {
  if (!member.active) {
    return 'Inactive';
  }

  return member.ptoStatus ? 'On PTO' : 'Available';
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

export function ClinicalTeamMemberCard({ member }: ClinicalTeamMemberCardProps) {
  const muted = member.ptoStatus || !member.active;
  const statusClass = muted ? 'status-pto' : 'status-available';

  return (
    <article className={`clinical-team-member-card ${muted ? 'is-muted' : ''}`}>
      <div className="clinical-team-member-card-header">
        <div>
          <p className="clinical-team-member-role">Pathologist</p>
          <h2>{member.name}</h2>
        </div>
        <span className={`status-pill ${statusClass}`}>{availabilityLabel(member)}</span>
      </div>
      <p className="clinical-team-member-description">{member.description}</p>
      <div className="load-meter" aria-label={`Current load ${member.currentLoad}`}>
        <span>Current load</span>
        <strong>{member.currentLoad}</strong>
      </div>
      <div className="skill-section">
        <h3>Specialties</h3>
        <div className="tag-list"><Tags values={member.specialties} /></div>
      </div>
      <div className="skill-section">
        <h3>Clinical Skills</h3>
        <div className="tag-list"><Tags values={member.skills} /></div>
      </div>
      <div className="skill-section">
        <h3>Case Types</h3>
        <div className="tag-list"><Tags values={member.caseTypes} /></div>
      </div>
    </article>
  );
}
