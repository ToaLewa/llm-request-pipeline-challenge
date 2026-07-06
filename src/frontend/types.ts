export type Doctor = {
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

export type DoctorPoolState =
  | { status: 'loading'; doctors: Doctor[]; error?: never }
  | { status: 'loaded'; doctors: Doctor[]; error?: never }
  | { status: 'error'; doctors: Doctor[]; error: string };

export type AppRoute = '/' | '/doctors';
