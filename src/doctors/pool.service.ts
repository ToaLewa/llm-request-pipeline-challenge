import { getPrisma } from '../database/client';

type SkillCategory = 'specialty' | 'clinical_skill' | 'case_type';

type DoctorPoolSkill = {
  name: string;
  category: SkillCategory;
};

type DoctorPoolRecord = {
  id: string;
  name: string;
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
  active: boolean;
  skills: Array<{
    skill: DoctorPoolSkill;
  }>;
};

export type DoctorPoolDoctor = {
  id: string;
  name: string;
  specialties: string[];
  skills: string[];
  caseTypes: string[];
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
  active: boolean;
};

export type DoctorPoolQueryClient = {
  doctor: {
    findMany(args: {
      include: {
        skills: {
          include: {
            skill: true;
          };
        };
      };
      orderBy: Array<{ active: 'desc' } | { ptoStatus: 'asc' } | { name: 'asc' }>;
    }): Promise<DoctorPoolRecord[]>;
  };
};

export type GetDoctorPoolOptions = {
  client?: DoctorPoolQueryClient;
};

export async function getDoctorPool(options: GetDoctorPoolOptions = {}): Promise<DoctorPoolDoctor[]> {
  const client: DoctorPoolQueryClient = options.client ?? getPrisma();
  const doctors = await client.doctor.findMany({
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: [{ active: 'desc' }, { ptoStatus: 'asc' }, { name: 'asc' }],
  });

  return doctors.map(toDoctorPoolDoctor);
}

function toDoctorPoolDoctor(doctor: DoctorPoolRecord): DoctorPoolDoctor {
  return {
    id: doctor.id,
    name: doctor.name,
    specialties: skillNamesForCategory(doctor, 'specialty'),
    skills: skillNamesForCategory(doctor, 'clinical_skill'),
    caseTypes: skillNamesForCategory(doctor, 'case_type'),
    description: doctor.description,
    ptoStatus: doctor.ptoStatus,
    currentLoad: doctor.currentLoad,
    active: doctor.active,
  };
}

function skillNamesForCategory(doctor: DoctorPoolRecord, category: SkillCategory): string[] {
  return doctor.skills.filter(({ skill }) => skill.category === category).map(({ skill }) => skill.name);
}
