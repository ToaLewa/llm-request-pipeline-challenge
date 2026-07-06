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
  { name: 'Gastrointestinal Pathology', skillCode: 'gastrointestinal-pathology', category: 'specialty' },
  { name: 'Dermatopathology', skillCode: 'dermatopathology', category: 'specialty' },
  { name: 'Hematopathology', skillCode: 'hematopathology', category: 'specialty' },
  { name: 'Cytopathology', skillCode: 'cytopathology', category: 'specialty' },
  { name: 'Breast Pathology', skillCode: 'breast-pathology', category: 'specialty' },
  { name: 'Thoracic Pathology', skillCode: 'thoracic-pathology', category: 'specialty' },
  { name: 'Neuropathology', skillCode: 'neuropathology', category: 'specialty' },
  { name: 'Molecular Pathology', skillCode: 'molecular-pathology', category: 'specialty' },
  { name: 'Gynecologic Pathology', skillCode: 'gynecologic-pathology', category: 'specialty' },
  { name: 'Genitourinary Pathology', skillCode: 'genitourinary-pathology', category: 'specialty' },
  { name: 'Pediatric Pathology', skillCode: 'pediatric-pathology', category: 'specialty' },
  { name: 'Renal Biopsy', skillCode: 'renal-biopsy', category: 'case_type' },
  { name: 'Biopsy Review', skillCode: 'biopsy-review', category: 'case_type' },
  { name: 'Resection Review', skillCode: 'resection-review', category: 'case_type' },
  { name: 'Frozen Section', skillCode: 'frozen-section', category: 'case_type' },
  { name: 'Fine Needle Aspiration', skillCode: 'fine-needle-aspiration', category: 'case_type' },
  { name: 'Bone Marrow Biopsy', skillCode: 'bone-marrow-biopsy', category: 'case_type' },
  { name: 'Skin Biopsy', skillCode: 'skin-biopsy', category: 'case_type' },
  { name: 'Lymph Node Biopsy', skillCode: 'lymph-node-biopsy', category: 'case_type' },
  { name: 'Needle Core Biopsy', skillCode: 'needle-core-biopsy', category: 'case_type' },
  { name: 'Autopsy Review', skillCode: 'autopsy-review', category: 'case_type' },
  { name: 'Lupus Nephritis', skillCode: 'lupus-nephritis', category: 'clinical_skill' },
  { name: 'Glomerulonephritis', skillCode: 'glomerulonephritis', category: 'clinical_skill' },
  { name: 'GI Pathology', skillCode: 'gi-pathology', category: 'clinical_skill' },
  { name: 'Inflammatory Bowel Disease', skillCode: 'inflammatory-bowel-disease', category: 'clinical_skill' },
  { name: 'Colon Dysplasia', skillCode: 'colon-dysplasia', category: 'clinical_skill' },
  { name: 'Melanocytic Lesions', skillCode: 'melanocytic-lesions', category: 'clinical_skill' },
  { name: 'Cutaneous Lymphoma', skillCode: 'cutaneous-lymphoma', category: 'clinical_skill' },
  { name: 'Leukemia Workup', skillCode: 'leukemia-workup', category: 'clinical_skill' },
  { name: 'Lymphoma Classification', skillCode: 'lymphoma-classification', category: 'clinical_skill' },
  { name: 'Flow Cytometry Correlation', skillCode: 'flow-cytometry-correlation', category: 'clinical_skill' },
  { name: 'Pap Cytology', skillCode: 'pap-cytology', category: 'clinical_skill' },
  { name: 'Thyroid FNA', skillCode: 'thyroid-fna', category: 'clinical_skill' },
  { name: 'Breast Biomarkers', skillCode: 'breast-biomarkers', category: 'clinical_skill' },
  { name: 'Lung Tumor Typing', skillCode: 'lung-tumor-typing', category: 'clinical_skill' },
  { name: 'Brain Tumor Classification', skillCode: 'brain-tumor-classification', category: 'clinical_skill' },
  { name: 'NGS Interpretation', skillCode: 'ngs-interpretation', category: 'clinical_skill' },
  { name: 'Endometrial Cancer', skillCode: 'endometrial-cancer', category: 'clinical_skill' },
  { name: 'Prostate Grading', skillCode: 'prostate-grading', category: 'clinical_skill' },
  { name: 'Pediatric Solid Tumors', skillCode: 'pediatric-solid-tumors', category: 'clinical_skill' },
  { name: 'Transplant Pathology', skillCode: 'transplant-pathology', category: 'clinical_skill' },
  { name: 'Infectious Disease Pathology', skillCode: 'infectious-disease-pathology', category: 'clinical_skill' },
  { name: 'Immunohistochemistry', skillCode: 'immunohistochemistry', category: 'clinical_skill' },
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
  {
    id: 'doc_williams',
    name: 'Dr. Aisha Williams',
    description: 'GI pathologist specializing in inflammatory bowel disease and dysplasia surveillance.',
    ptoStatus: false,
    currentLoad: 5,
    active: true,
    skillCodes: ['gastrointestinal-pathology', 'biopsy-review', 'gi-pathology', 'inflammatory-bowel-disease', 'colon-dysplasia'],
  },
  {
    id: 'doc_kim',
    name: 'Dr. Daniel Kim',
    description: 'Dermatopathologist focused on melanocytic lesions and complex inflammatory skin disease.',
    ptoStatus: false,
    currentLoad: 3,
    active: true,
    skillCodes: ['dermatopathology', 'skin-biopsy', 'melanocytic-lesions', 'immunohistochemistry'],
  },
  {
    id: 'doc_nguyen',
    name: 'Dr. Linh Nguyen',
    description: 'Hematopathologist with leukemia and lymphoma classification expertise.',
    ptoStatus: false,
    currentLoad: 6,
    active: true,
    skillCodes: ['hematopathology', 'bone-marrow-biopsy', 'lymph-node-biopsy', 'leukemia-workup', 'lymphoma-classification', 'flow-cytometry-correlation'],
  },
  {
    id: 'doc_smith',
    name: 'Dr. Laura Smith',
    description: 'Cytopathologist covering thyroid, pulmonary, and head and neck aspiration cases.',
    ptoStatus: false,
    currentLoad: 2,
    active: true,
    skillCodes: ['cytopathology', 'fine-needle-aspiration', 'thyroid-fna', 'immunohistochemistry'],
  },
  {
    id: 'doc_brown',
    name: 'Dr. Marcus Brown',
    description: 'Breast pathologist experienced in core biopsies, resections, and biomarker interpretation.',
    ptoStatus: false,
    currentLoad: 4,
    active: true,
    skillCodes: ['breast-pathology', 'needle-core-biopsy', 'resection-review', 'breast-biomarkers'],
  },
  {
    id: 'doc_garcia',
    name: 'Dr. Sofia Garcia',
    description: 'Thoracic pathologist focused on lung tumor typing and small biopsy triage.',
    ptoStatus: false,
    currentLoad: 7,
    active: true,
    skillCodes: ['thoracic-pathology', 'needle-core-biopsy', 'lung-tumor-typing', 'molecular-pathology', 'ngs-interpretation'],
  },
  {
    id: 'doc_miller',
    name: 'Dr. Hannah Miller',
    description: 'Neuropathologist with experience in brain tumor classification and intraoperative consultation.',
    ptoStatus: false,
    currentLoad: 3,
    active: true,
    skillCodes: ['neuropathology', 'frozen-section', 'brain-tumor-classification', 'molecular-pathology'],
  },
  {
    id: 'doc_davis',
    name: 'Dr. Owen Davis',
    description: 'Molecular pathologist supporting oncology sequencing and biomarker interpretation.',
    ptoStatus: false,
    currentLoad: 5,
    active: true,
    skillCodes: ['molecular-pathology', 'ngs-interpretation', 'lung-tumor-typing', 'breast-biomarkers'],
  },
  {
    id: 'doc_martinez',
    name: 'Dr. Elena Martinez',
    description: 'Gynecologic pathologist specializing in endometrial carcinoma and frozen section support.',
    ptoStatus: false,
    currentLoad: 4,
    active: true,
    skillCodes: ['gynecologic-pathology', 'resection-review', 'frozen-section', 'endometrial-cancer'],
  },
  {
    id: 'doc_anderson',
    name: 'Dr. Peter Anderson',
    description: 'Genitourinary pathologist focused on prostate grading and renal mass resections.',
    ptoStatus: false,
    currentLoad: 6,
    active: true,
    skillCodes: ['genitourinary-pathology', 'needle-core-biopsy', 'resection-review', 'prostate-grading'],
  },
  {
    id: 'doc_taylor',
    name: 'Dr. Maya Taylor',
    description: 'Pediatric pathologist covering solid tumors, autopsy review, and complex consults.',
    ptoStatus: false,
    currentLoad: 2,
    active: true,
    skillCodes: ['pediatric-pathology', 'pediatric-solid-tumors', 'autopsy-review', 'frozen-section'],
  },
  {
    id: 'doc_thompson',
    name: 'Dr. Claire Thompson',
    description: 'Renal and transplant pathologist with strong biopsy interpretation experience.',
    ptoStatus: false,
    currentLoad: 5,
    active: true,
    skillCodes: ['renal-pathology', 'nephropathology', 'renal-biopsy', 'transplant-pathology'],
  },
  {
    id: 'doc_moore',
    name: 'Dr. Jamal Moore',
    description: 'General surgical pathologist handling frozen sections, resections, and infectious disease cases.',
    ptoStatus: false,
    currentLoad: 1,
    active: true,
    skillCodes: ['general-surgical-pathology', 'frozen-section', 'resection-review', 'infectious-disease-pathology'],
  },
  {
    id: 'doc_jackson',
    name: 'Dr. Priya Jackson',
    description: 'Dermatopathologist with cutaneous lymphoma and melanocytic lesion expertise.',
    ptoStatus: false,
    currentLoad: 4,
    active: true,
    skillCodes: ['dermatopathology', 'skin-biopsy', 'cutaneous-lymphoma', 'melanocytic-lesions', 'lymphoma-classification'],
  },
  {
    id: 'doc_white',
    name: 'Dr. Ethan White',
    description: 'GI pathologist focused on colon dysplasia, IBD, and resection correlation.',
    ptoStatus: true,
    currentLoad: 3,
    active: true,
    skillCodes: ['gastrointestinal-pathology', 'resection-review', 'inflammatory-bowel-disease', 'colon-dysplasia'],
  },
  {
    id: 'doc_harris',
    name: 'Dr. Nora Harris',
    description: 'Cytopathologist specializing in Pap cytology and thyroid FNA quality review.',
    ptoStatus: false,
    currentLoad: 6,
    active: true,
    skillCodes: ['cytopathology', 'fine-needle-aspiration', 'pap-cytology', 'thyroid-fna'],
  },
  {
    id: 'doc_clark',
    name: 'Dr. Samuel Clark',
    description: 'Hematopathologist supporting marrow biopsies, lymphoma workups, and flow correlation.',
    ptoStatus: false,
    currentLoad: 2,
    active: true,
    skillCodes: ['hematopathology', 'bone-marrow-biopsy', 'lymph-node-biopsy', 'lymphoma-classification', 'flow-cytometry-correlation'],
  },
  {
    id: 'doc_lewis',
    name: 'Dr. Grace Lewis',
    description: 'Breast and gynecologic pathologist with biomarker and endometrial cancer expertise.',
    ptoStatus: false,
    currentLoad: 5,
    active: true,
    skillCodes: ['breast-pathology', 'gynecologic-pathology', 'needle-core-biopsy', 'breast-biomarkers', 'endometrial-cancer'],
  },
  {
    id: 'doc_robinson',
    name: 'Dr. Victor Robinson',
    description: 'Thoracic and molecular pathologist focused on lung cancer sequencing workflows.',
    ptoStatus: false,
    currentLoad: 4,
    active: true,
    skillCodes: ['thoracic-pathology', 'molecular-pathology', 'lung-tumor-typing', 'ngs-interpretation'],
  },
  {
    id: 'doc_walker',
    name: 'Dr. Isabel Walker',
    description: 'Neuropathologist covering brain tumors, autopsy neuropathology, and frozen sections.',
    ptoStatus: false,
    currentLoad: 3,
    active: true,
    skillCodes: ['neuropathology', 'brain-tumor-classification', 'autopsy-review', 'frozen-section'],
  },
  {
    id: 'doc_young',
    name: 'Dr. Benjamin Young',
    description: 'Genitourinary pathologist with prostate biopsy and resection review focus.',
    ptoStatus: false,
    currentLoad: 7,
    active: true,
    skillCodes: ['genitourinary-pathology', 'biopsy-review', 'needle-core-biopsy', 'prostate-grading'],
  },
  {
    id: 'doc_allen',
    name: 'Dr. Fatima Allen',
    description: 'Pediatric and infectious disease pathologist handling unusual biopsy consults.',
    ptoStatus: false,
    currentLoad: 2,
    active: true,
    skillCodes: ['pediatric-pathology', 'biopsy-review', 'pediatric-solid-tumors', 'infectious-disease-pathology'],
  },
  {
    id: 'doc_king',
    name: 'Dr. Thomas King',
    description: 'General surgical pathologist with broad resection, biopsy, and IHC experience.',
    ptoStatus: false,
    currentLoad: 8,
    active: true,
    skillCodes: ['general-surgical-pathology', 'biopsy-review', 'resection-review', 'immunohistochemistry'],
  },
  {
    id: 'doc_wright',
    name: 'Dr. Zoe Wright',
    description: 'Renal pathologist specializing in transplant pathology and glomerular disease.',
    ptoStatus: true,
    currentLoad: 2,
    active: true,
    skillCodes: ['renal-pathology', 'renal-biopsy', 'transplant-pathology', 'glomerulonephritis'],
  },
  {
    id: 'doc_scott',
    name: 'Dr. Adrian Scott',
    description: 'Dermatopathologist and molecular pathology consultant for difficult skin tumors.',
    ptoStatus: false,
    currentLoad: 5,
    active: true,
    skillCodes: ['dermatopathology', 'molecular-pathology', 'skin-biopsy', 'melanocytic-lesions', 'ngs-interpretation'],
  },
  {
    id: 'doc_baker',
    name: 'Dr. Miles Baker',
    description: 'Hematopathology and molecular consultant for leukemia sequencing correlation.',
    ptoStatus: false,
    currentLoad: 6,
    active: false,
    skillCodes: ['hematopathology', 'molecular-pathology', 'leukemia-workup', 'ngs-interpretation', 'flow-cytometry-correlation'],
  },
  {
    id: 'doc_adams',
    name: 'Dr. Naomi Adams',
    description: 'Breast pathologist covering urgent core biopsies and frozen section consultation.',
    ptoStatus: false,
    currentLoad: 1,
    active: true,
    skillCodes: ['breast-pathology', 'needle-core-biopsy', 'frozen-section', 'breast-biomarkers'],
  },
] as const;

async function main(): Promise<void> {
  await prisma.doctor.deleteMany({
    where: {
      id: {
        notIn: doctors.map((doctor) => doctor.id),
      },
    },
  });

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
