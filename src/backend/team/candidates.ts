import {
  findCandidateDoctorRecordsByName,
  findCandidateDoctorRecordsBySkillCodes,
  type CandidateDoctorByNameQueryClient,
  type CandidateDoctorQueryClient,
  type CandidateDoctorRecord,
  type SkillCategory,
} from '../database/candidate-doctors.queries';
import type { RoutingDecision } from '../inference/routing';

export type { CandidateDoctorByNameQueryClient, CandidateDoctorQueryClient } from '../database/candidate-doctors.queries';

export type CandidateDoctorPayload = {
  id: number;
  name: string;
  specialties: string[];
  skills: string[];
  caseTypes: string[];
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
};

export type FindCandidateDoctorsOptions = {
  client?: CandidateDoctorQueryClient;
  limit?: number;
};

export function normalizeSkillCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function skillCodesFromRoutingDecision(routing: RoutingDecision): string[] {
  const values = [
    ...routing.requiredSpecialties,
    ...routing.requiredSkills,
    ...(routing.caseType ? [routing.caseType] : []),
  ];

  return [...new Set(values.map(normalizeSkillCode).filter(Boolean))];
}

export async function findCandidateDoctors(
  routing: RoutingDecision,
  options: FindCandidateDoctorsOptions = {},
): Promise<CandidateDoctorPayload[]> {
  const requiredSkillCodes = skillCodesFromRoutingDecision(routing);

  return findCandidateDoctorsBySkillCodes(requiredSkillCodes, options);
}

export async function findCandidateDoctorsBySkillCodes(
  skillCodes: string[],
  options: FindCandidateDoctorsOptions = {},
): Promise<CandidateDoctorPayload[]> {
  const requiredSkillCodes = [...new Set(skillCodes.map((skillCode) => skillCode.trim()).filter(Boolean))];

  if (requiredSkillCodes.length === 0) {
    return [];
  }

  const limit = options.limit ?? 8;
  const requiredSkillCodeSet = new Set(requiredSkillCodes);
  const candidates = await findCandidateDoctorRecordsBySkillCodes(requiredSkillCodes, options.client);

  return candidates
    .map((candidate) => ({
      candidate,
      matchCount: candidate.skills.filter(({ skill }) => requiredSkillCodeSet.has(skill.skillCode)).length,
    }))
    .sort((a, b) => b.matchCount - a.matchCount || a.candidate.currentLoad - b.candidate.currentLoad)
    .slice(0, limit)
    .map(({ candidate }) => toCandidateDoctorPayload(candidate));
}

export async function findCandidateDoctorsByName(
  name: string,
  options: { client?: CandidateDoctorByNameQueryClient; limit?: number } = {},
): Promise<CandidateDoctorPayload[]> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return [];
  }

  const candidates = await findCandidateDoctorRecordsByName({
    name: normalizedName,
    limit: options.limit ?? 8,
    client: options.client,
  });

  return candidates.map(toCandidateDoctorPayload);
}

function toCandidateDoctorPayload(candidate: CandidateDoctorRecord): CandidateDoctorPayload {
  return {
    id: candidate.id,
    name: candidate.name,
    specialties: skillNamesForCategory(candidate, 'specialty'),
    skills: skillNamesForCategory(candidate, 'clinical_skill'),
    caseTypes: skillNamesForCategory(candidate, 'case_type'),
    description: candidate.description,
    ptoStatus: candidate.ptoStatus,
    currentLoad: candidate.currentLoad,
  };
}

function skillNamesForCategory(candidate: CandidateDoctorRecord, category: SkillCategory): string[] {
  return candidate.skills
    .filter(({ skill }) => skill.category === category)
    .map(({ skill }) => skill.name);
}
