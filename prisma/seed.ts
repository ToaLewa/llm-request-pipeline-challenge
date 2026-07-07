import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { assignments } from './seed-data/assignments.ts';
import { doctorSkills } from './seed-data/doctor-skills.ts';
import { doctors } from './seed-data/doctors.ts';
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

async function resetSequence(tableName: string, maxId: number): Promise<void> {
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), ${maxId}, true)`);
}

async function main(): Promise<void> {
  await prisma.assignment.deleteMany();
  await prisma.workflowTask.deleteMany();
  await prisma.workflowRequest.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.doctorSkill.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.skill.deleteMany();

  await prisma.skill.createMany({ data: skills });
  await prisma.doctor.createMany({ data: doctors });
  await prisma.doctorSkill.createMany({ data: doctorSkills });
  await prisma.workflow.createMany({ data: workflows });
  await prisma.workflowRequest.createMany({ data: workflowRequests });
  await prisma.workflowTask.createMany({ data: workflowTasks });
  await prisma.assignment.createMany({ data: assignments });

  await resetSequence('Skill', Math.max(...skills.map((skill) => skill.id)));
  await resetSequence('Doctor', Math.max(...doctors.map((doctor) => doctor.id)));
  await resetSequence('Workflow', Math.max(...workflows.map((workflow) => workflow.id)));
  await resetSequence('WorkflowRequest', Math.max(...workflowRequests.map((request) => request.id)));
  await resetSequence('WorkflowTask', Math.max(...workflowTasks.map((task) => task.id)));
  await resetSequence('Assignment', Math.max(...assignments.map((assignment) => assignment.id)));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
