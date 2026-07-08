import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { assignments } from './seed-data/assignments.ts';
import { teamMemberSkills } from './seed-data/team-member-skills.ts';
import { teamMembers } from './seed-data/team-members.ts';
import { skills } from './seed-data/skills.ts';
import { workflowRequests } from './seed-data/workflow-requests.ts';
import { workflowTasks } from './seed-data/workflow-tasks.ts';
import { workflows } from './seed-data/workflows.ts';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function buildCoverageSeedData() {
  const existingAssignmentCounts = assignments.reduce((counts, assignment) => {
    counts.set(assignment.teamMemberId, (counts.get(assignment.teamMemberId) ?? 0) + 1);
    return counts;
  }, new Map<number, number>());

  const coverageCases = teamMembers.flatMap((teamMember) => {
    const existingAssignmentCount = existingAssignmentCounts.get(teamMember.id) ?? 0;
    const additionalCaseCount = Math.max(targetAssignmentCountFor(teamMember.id) - existingAssignmentCount, 0);

    return Array.from({ length: additionalCaseCount }, (_, caseIndex) => ({
      teamMember,
      ...coverageCaseFor(teamMember, caseIndex),
    }));
  });
  const baseWorkflowId = Math.max(...workflows.map((workflow) => workflow.id));
  const baseRequestId = Math.max(...workflowRequests.map((request) => request.id));
  const baseTaskId = Math.max(...workflowTasks.map((task) => task.id));
  const baseAssignmentId = Math.max(...assignments.map((assignment) => assignment.id));
  const createdAt = new Date('2026-07-07T21:45:00.000Z');

  return {
    workflows: coverageCases.map((_, index) => ({
      id: baseWorkflowId + index + 1,
      status: 'assigned',
      createdAt,
      updatedAt: createdAt,
    })),
    workflowRequests: coverageCases.map(({ rawRequest }, index) => ({
      id: baseRequestId + index + 1,
      workflowId: baseWorkflowId + index + 1,
      rawRequest,
      source: 'seed',
      createdAt,
    })),
    workflowTasks: coverageCases.map(({ assignmentReason, rawRequest, taskType, teamMember }, index) => ({
      id: baseTaskId + index + 1,
      workflowId: baseWorkflowId + index + 1,
      requestId: baseRequestId + index + 1,
      taskType,
      sequence: 1,
      status: 'completed',
      input: {
        rawRequest,
      },
      output: {
        assignedDoctorId: teamMember.id,
        assignedDoctorName: teamMember.name,
        confidence: 1,
        assignmentReason,
      },
      reason: assignmentReason,
      createdAt,
      updatedAt: createdAt,
    })),
    assignments: coverageCases.map(({ summary, teamMember }, index) => ({
      id: baseAssignmentId + index + 1,
      teamMemberId: teamMember.id,
      workflowTaskId: baseTaskId + index + 1,
      summary,
      createdAt,
      updatedAt: createdAt,
    })),
  };
}

function targetAssignmentCountFor(teamMemberId: number): number {
  const heavierLoads = new Map([
    [4, 3],
    [6, 2],
    [9, 3],
    [11, 2],
    [13, 2],
    [15, 3],
    [19, 2],
    [24, 4],
    [26, 2],
    [29, 2],
    [32, 2],
  ]);

  return heavierLoads.get(teamMemberId) ?? 1;
}

function coverageCaseFor(teamMember: (typeof teamMembers)[number], caseIndex: number): {
  assignmentReason: string;
  rawRequest: string;
  summary: string;
  taskType: string;
} {
  const title = teamMember.jobTitle.toLowerCase();

  if (title.includes('renal') || title.includes('nephro')) {
    return clinicalCoverageCase(teamMember, renalCases[caseIndex % renalCases.length], 'renal biopsy interpretation and clinicopathologic correlation');
  }

  if (title.includes('gi') || title.includes('gastrointestinal')) {
    return clinicalCoverageCase(teamMember, giCases[caseIndex % giCases.length], 'GI pathology review and dysplasia assessment');
  }

  if (title.includes('hematopath')) {
    return clinicalCoverageCase(teamMember, hematopathologyCases[caseIndex % hematopathologyCases.length], 'hematopathology classification and flow cytometry correlation');
  }

  if (title.includes('cytopath')) {
    return clinicalCoverageCase(teamMember, cytopathologyCases[caseIndex % cytopathologyCases.length], 'cytopathology adequacy review and diagnostic interpretation');
  }

  if (title.includes('breast')) {
    return clinicalCoverageCase(teamMember, breastCases[caseIndex % breastCases.length], 'breast pathology review and biomarker coordination');
  }

  if (title.includes('thoracic')) {
    return clinicalCoverageCase(teamMember, thoracicCases[caseIndex % thoracicCases.length], 'thoracic pathology tumor typing and molecular triage');
  }

  if (title.includes('neuro')) {
    return clinicalCoverageCase(teamMember, neuropathologyCases[caseIndex % neuropathologyCases.length], 'neuropathology frozen section review and tumor classification');
  }

  if (title.includes('molecular')) {
    return clinicalCoverageCase(teamMember, molecularCases[caseIndex % molecularCases.length], 'molecular pathology interpretation and biomarker reporting');
  }

  if (title.includes('gynecologic')) {
    return clinicalCoverageCase(teamMember, gynecologicCases[caseIndex % gynecologicCases.length], 'gynecologic pathology review and cancer workup');
  }

  if (title.includes('genitourinary')) {
    return clinicalCoverageCase(teamMember, genitourinaryCases[caseIndex % genitourinaryCases.length], 'genitourinary pathology review and grading');
  }

  if (title.includes('pediatric')) {
    return clinicalCoverageCase(teamMember, pediatricCases[caseIndex % pediatricCases.length], 'pediatric pathology diagnosis and consult coordination');
  }

  if (title.includes('dermatopath')) {
    return clinicalCoverageCase(teamMember, dermatopathologyCases[caseIndex % dermatopathologyCases.length], 'dermatopathology review and lesion assessment');
  }

  if (title.includes('surgical pathologist')) {
    return clinicalCoverageCase(teamMember, surgicalPathologyCases[caseIndex % surgicalPathologyCases.length], 'general surgical pathology review');
  }

  if (title.includes('coordinator')) {
    return administrativeCoverageCase(teamMember, coordinatorCases[caseIndex % coordinatorCases.length], 'case coordination and handoff tracking');
  }

  if (title.includes('administrator')) {
    return administrativeCoverageCase(teamMember, administratorCases[caseIndex % administratorCases.length], 'staffing logistics and escalation management');
  }

  if (title.includes('operations')) {
    return administrativeCoverageCase(teamMember, operationsCases[caseIndex % operationsCases.length], 'lab operations and capacity coordination');
  }

  if (title.includes('scheduling')) {
    return administrativeCoverageCase(teamMember, schedulingCases[caseIndex % schedulingCases.length], 'coverage scheduling and follow-up coordination');
  }

  return clinicalCoverageCase(teamMember, generalClinicalCases[caseIndex % generalClinicalCases.length], 'case review aligned with the team member role');
}

const renalCases = [
  'native kidney biopsy with suspected immune-complex glomerulonephritis',
  'transplant kidney biopsy with rising creatinine and possible antibody-mediated rejection',
  'renal biopsy from a diabetic patient with nephrotic-range proteinuria and atypical serologies',
];

const giCases = [
  'colon biopsy series from a patient with worsening inflammatory bowel disease',
  'esophageal biopsies with Barrett mucosa and concern for low-grade dysplasia',
  'liver biopsy from a patient with cholestatic enzymes and suspected autoimmune injury',
];

const hematopathologyCases = [
  'bone marrow biopsy with suspected acute leukemia',
  'lymph node excision requiring lymphoma classification and immunophenotype correlation',
  'post-treatment marrow biopsy needing minimal residual disease correlation',
];

const cytopathologyCases = [
  'thyroid fine needle aspiration with indeterminate cytology',
  'endobronchial ultrasound-guided lymph node aspirate needing adequacy and tumor typing',
  'pancreatic cyst fluid cytology with elevated tumor markers and scant cellularity',
];

const breastCases = [
  'urgent breast core biopsy requiring tumor typing and biomarker planning',
  'lumpectomy specimen requiring margin assessment after neoadjuvant therapy',
  'sentinel lymph node frozen section for newly diagnosed invasive breast carcinoma',
];

const thoracicCases = [
  'small lung biopsy from a patient with suspected non-small cell carcinoma',
  'pleural biopsy needing mesothelioma versus metastatic carcinoma workup',
  'mediastinal mass biopsy requiring rapid tumor classification and molecular triage',
];

const neuropathologyCases = [
  'intraoperative brain tumor consult requiring preliminary classification',
  'temporal lobe resection from an epilepsy surgery case needing cortical dysplasia review',
  'spinal cord lesion biopsy requiring demyelination versus neoplasm correlation',
];

const molecularCases = [
  'oncology specimen needing sequencing result interpretation for targeted therapy',
  'lung adenocarcinoma panel with discordant EGFR and ALK results needing reconciliation',
  'sarcoma fusion assay requiring interpretation before tumor board review',
];

const gynecologicCases = [
  'endometrial biopsy concerning for carcinoma',
  'ovarian mass frozen section requiring tumor type and staging guidance',
  'cervical cone biopsy needing margin review for high-grade dysplasia',
];

const genitourinaryCases = [
  'prostate needle core biopsy requiring grading and risk stratification',
  'renal mass resection needing tumor subtype and margin assessment',
  'bladder tumor resection requiring muscle invasion assessment',
];

const pediatricCases = [
  'pediatric solid tumor biopsy needing subspecialty review',
  'infant liver biopsy with neonatal cholestasis and possible metabolic disease',
  'pediatric lymph node biopsy requiring infectious versus malignant workup',
];

const dermatopathologyCases = [
  'skin biopsy with atypical melanocytic lesion',
  'punch biopsy for suspected cutaneous T-cell lymphoma',
  'rapidly progressive blistering rash biopsy needing immunofluorescence correlation',
];

const surgicalPathologyCases = [
  'general surgical resection specimen requiring margin and frozen section correlation',
  'appendectomy specimen with possible goblet cell adenocarcinoma',
  'soft tissue excision requiring tumor classification and margin review',
];

const generalClinicalCases = [
  'complex biopsy consult requiring subspecialty review',
  'outside pathology consult needing diagnostic confirmation before treatment planning',
  'urgent tumor board case requiring final pathology correlation',
];

const coordinatorCases = [
  'Coordinate missing outside slides and paperwork for an incoming consult case.',
  'Track a delayed send-out block needed for molecular testing before sign-out.',
  'Confirm referral documents and insurance authorization for a second-opinion consult.',
];

const administratorCases = [
  'Review departmental staffing escalation for next-day subspecialty coverage.',
  'Coordinate temporary coverage after an unexpected call-out on the frozen section bench.',
  'Prepare a service-capacity update for leadership before afternoon case routing.',
];

const operationsCases = [
  'Resolve a specimen flow bottleneck delaying consult case accessioning.',
  'Investigate a cassette labeling discrepancy before cases move to clinical review.',
  'Prioritize courier pickup for outside slides needed for morning conference.',
];

const schedulingCases = [
  'Arrange coverage schedule updates around PTO and follow-up appointment needs.',
  'Move a follow-up consult review to match specialist availability after clinic changes.',
  'Coordinate same-day coverage for an urgent frozen section add-on.',
];

function clinicalCoverageCase(teamMember: (typeof teamMembers)[number], rawCase: string, assignmentReason: string) {
  return {
    assignmentReason,
    rawRequest: `Assign ${rawCase} to ${teamMember.name}.`,
    summary: `${teamMember.name} is assigned to ${rawCase}. The task fits their role as ${teamMember.jobTitle}, requiring ${assignmentReason}.`,
    taskType: 'doctor_assignment',
  };
}

function administrativeCoverageCase(teamMember: (typeof teamMembers)[number], rawRequest: string, assignmentReason: string) {
  return {
    assignmentReason,
    rawRequest,
    summary: `${teamMember.name} is assigned to ${rawRequest.toLowerCase()} This fits their role as ${teamMember.jobTitle}, requiring ${assignmentReason}.`,
    taskType: 'administrative_assignment',
  };
}

async function resetSequence(tableName: string, maxId: number): Promise<void> {
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), ${maxId}, true)`);
}

function maxSeedId(records: Array<{ id?: number | null }>): number {
  return Math.max(
    ...records.map((record) => {
      if (typeof record.id !== 'number') {
        throw new Error('Seed records must include explicit numeric IDs.');
      }

      return record.id;
    }),
  );
}

async function main(): Promise<void> {
  const coverageSeedData = buildCoverageSeedData();

  await prisma.assignment.deleteMany();
  await prisma.workflowTask.deleteMany();
  await prisma.workflowRequest.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.teamMemberSkill.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.skill.deleteMany();

  await prisma.skill.createMany({ data: skills });
  await prisma.teamMember.createMany({ data: teamMembers });
  await prisma.teamMemberSkill.createMany({ data: teamMemberSkills });
  await prisma.workflow.createMany({ data: workflows });
  await prisma.workflowRequest.createMany({ data: workflowRequests });
  await prisma.workflowTask.createMany({ data: workflowTasks });
  await prisma.assignment.createMany({ data: assignments });

  if (coverageSeedData.assignments.length > 0) {
    await prisma.workflow.createMany({ data: coverageSeedData.workflows });
    await prisma.workflowRequest.createMany({ data: coverageSeedData.workflowRequests });
    await prisma.workflowTask.createMany({ data: coverageSeedData.workflowTasks });
    await prisma.assignment.createMany({ data: coverageSeedData.assignments });
  }

  await resetSequence('Skill', maxSeedId(skills));
  await resetSequence('TeamMember', maxSeedId(teamMembers));
  await resetSequence('Workflow', maxSeedId([...workflows, ...coverageSeedData.workflows]));
  await resetSequence('WorkflowRequest', maxSeedId([...workflowRequests, ...coverageSeedData.workflowRequests]));
  await resetSequence('WorkflowTask', maxSeedId([...workflowTasks, ...coverageSeedData.workflowTasks]));
  await resetSequence('Assignment', maxSeedId([...assignments, ...coverageSeedData.assignments]));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
