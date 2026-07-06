import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const skills = [
  { name: 'Renal Pathology', skillCode: 'renal-pathology', category: 'specialty' },
  { name: 'Nephropathology', skillCode: 'nephropathology', category: 'specialty' },
  { name: 'General Surgical Pathology', skillCode: 'general-surgical-pathology', category: 'specialty' },
  { name: 'Renal Biopsy', skillCode: 'renal-biopsy', category: 'case_type' },
  { name: 'Biopsy Review', skillCode: 'biopsy-review', category: 'case_type' },
  { name: 'Lupus Nephritis', skillCode: 'lupus-nephritis', category: 'clinical_skill' },
  { name: 'Glomerulonephritis', skillCode: 'glomerulonephritis', category: 'clinical_skill' },
  { name: 'GI Pathology', skillCode: 'gi-pathology', category: 'clinical_skill' },
] as const;

const doctors = [
  {
    id: 'doc_chen',
    name: 'Dr. Emily Chen',
    description: 'Renal pathologist focused on autoimmune kidney disease and complex biopsy interpretation.',
    ptoStatus: false,
    currentLoad: 4,
    active: true,
    skillCodes: ['renal-pathology', 'nephropathology', 'renal-biopsy', 'lupus-nephritis', 'glomerulonephritis'],
  },
  {
    id: 'doc_patel',
    name: 'Dr. Ravi Patel',
    description: 'General surgical pathologist with broad biopsy review experience and GI pathology coverage.',
    ptoStatus: false,
    currentLoad: 2,
    active: true,
    skillCodes: ['general-surgical-pathology', 'biopsy-review', 'gi-pathology'],
  },
  {
    id: 'doc_gomez',
    name: 'Dr. Maria Gomez',
    description: 'Renal pathology specialist with glomerulonephritis expertise, currently unavailable for assignment.',
    ptoStatus: true,
    currentLoad: 1,
    active: true,
    skillCodes: ['renal-pathology', 'renal-biopsy', 'glomerulonephritis'],
  },
] as const;

async function main(): Promise<void> {
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { skillCode: skill.skillCode },
      update: { name: skill.name, category: skill.category },
      create: skill,
    });
  }

  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { id: doctor.id },
      update: {
        name: doctor.name,
        description: doctor.description,
        ptoStatus: doctor.ptoStatus,
        currentLoad: doctor.currentLoad,
        active: doctor.active,
      },
      create: {
        id: doctor.id,
        name: doctor.name,
        description: doctor.description,
        ptoStatus: doctor.ptoStatus,
        currentLoad: doctor.currentLoad,
        active: doctor.active,
      },
    });

    await prisma.doctorSkill.deleteMany({ where: { doctorId: doctor.id } });

    for (const skillCode of doctor.skillCodes) {
      const skill = await prisma.skill.findUniqueOrThrow({ where: { skillCode } });

      await prisma.doctorSkill.create({
        data: {
          doctorId: doctor.id,
          skillId: skill.id,
        },
      });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
