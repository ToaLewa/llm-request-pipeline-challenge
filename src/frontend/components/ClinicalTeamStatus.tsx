import type { ClinicalTeamState } from '../types';

type ClinicalTeamStatusProps = {
  clinicalTeamState: ClinicalTeamState;
};

export function ClinicalTeamStatus({ clinicalTeamState }: ClinicalTeamStatusProps) {
  if (clinicalTeamState.status === 'error') {
    return <p className="clinical-team-grid-message">Unable to load the clinical team from the database. {clinicalTeamState.error}</p>;
  }

  if (clinicalTeamState.status === 'loading') {
    return <p className="clinical-team-grid-message">Loading clinical team from the database...</p>;
  }

  return <p className="clinical-team-grid-message">No clinical team members found in the database.</p>;
}
