import type { AppRoute, ClinicalTeamState } from '../types';
import { ClinicalTeamMemberCard } from './ClinicalTeamMemberCard';
import { ClinicalTeamStatus } from './ClinicalTeamStatus';
import { Navigation } from './Navigation';

type ClinicalTeamPageProps = {
  clinicalTeamState: ClinicalTeamState;
  onNavigate: (route: AppRoute) => void;
};

export function ClinicalTeamPage({ clinicalTeamState, onNavigate }: ClinicalTeamPageProps) {
  const { teamMembers } = clinicalTeamState;

  return (
    <section className="page-shell clinical-team-page">
      <Navigation route="/clinical-team" onNavigate={onNavigate} />
      <header className="hero">
        <div className="hero-grid">
          <div>
            <h2>Clinical Team</h2>
            <p className="intro">Specialists available to the request pipeline, grouped by normalized skills and case types.</p>
          </div>
          <aside className="summary-card" aria-label="Clinical team summary">
            <span className="summary-number">{teamMembers.length}</span>
            <span className="summary-label">Clinical team members</span>
            <span className="summary-detail">{teamMembers.filter((teamMember) => !teamMember.ptoStatus && teamMember.active).length} available for auto-assignment</span>
          </aside>
        </div>
      </header>

      <section className="clinical-team-grid" aria-label="Clinical team members">
        {teamMembers.length > 0 ? teamMembers.map((member) => <ClinicalTeamMemberCard member={member} key={member.id} />) : <ClinicalTeamStatus clinicalTeamState={clinicalTeamState} />}
      </section>
    </section>
  );
}
