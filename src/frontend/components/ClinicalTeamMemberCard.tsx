import type { TeamMember } from '../types';
import { useAppNavigation } from '../useAppNavigation';
import type { AppRoute } from '../types';

type ClinicalTeamMemberCardProps = {
  member: TeamMember;
  onNavigate: (route: AppRoute) => void;
};

function availabilityLabel(member: TeamMember): string {
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

function SkillSection({ title, values }: { title: string; values: string[] }) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div className="skill-section">
      <h3>{title}</h3>
      <div className="tag-list"><Tags values={values} /></div>
    </div>
  );
}

export function ClinicalTeamMemberCard({ member, onNavigate }: ClinicalTeamMemberCardProps) {
  const { handleNavigationClick } = useAppNavigation(onNavigate);
  const muted = member.ptoStatus || !member.active;
  const statusClass = muted ? 'status-pto' : 'status-available';
  const memberCasesRoute: AppRoute = `/clinical-team/${member.id}/cases`;

  return (
    <a
      className={`clinical-team-member-card ${muted ? 'is-muted' : ''}`}
      href={memberCasesRoute}
      onClick={(event) => handleNavigationClick(event, memberCasesRoute)}
    >
      <div className="clinical-team-member-card-header">
        <div>
          <p className="clinical-team-member-role">{member.jobTitle}</p>
          <h2>{member.name}</h2>
        </div>
        <span className={`status-pill ${statusClass}`}>{availabilityLabel(member)}</span>
      </div>
      <p className="clinical-team-member-description">{member.description}</p>
      <div className="load-meter" aria-label={`Current load ${member.currentLoad}`}>
        <span>Current load</span>
        <strong>{member.currentLoad}</strong>
      </div>
      <SkillSection title="Specialties" values={member.specialties} />
      <SkillSection title="Clinical Skills" values={member.skills} />
      <SkillSection title="Case Types" values={member.caseTypes} />
    </a>
  );
}
