import type { DoctorPoolState } from '../types';

type DoctorPoolStatusProps = {
  doctorPoolState: DoctorPoolState;
};

export function DoctorPoolStatus({ doctorPoolState }: DoctorPoolStatusProps) {
  if (doctorPoolState.status === 'error') {
    return <p className="doctor-grid-message">Unable to load doctors from the database. {doctorPoolState.error}</p>;
  }

  if (doctorPoolState.status === 'loading') {
    return <p className="doctor-grid-message">Loading doctors from the database...</p>;
  }

  return <p className="doctor-grid-message">No doctors found in the database.</p>;
}
