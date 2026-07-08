import { describe, expect, it, vi } from 'vitest';
import {
  createRoutingDecision,
  parseRoutingDecision,
  routingOutputSchema,
  routingSystemPrompt,
  type RoutingDecision,
  type RoutingDecisionClient,
} from './routing';

const doctorAssignmentDecision: RoutingDecision = {
  route: 'doctor_assignment',
  confidence: 0.94,
  reason: 'The request describes a clinical case requiring specialist review.',
  caseSummary: 'Possible lupus nephritis with renal biopsy review needed.',
  caseType: 'renal biopsy',
  priority: 'normal',
  requiredSpecialties: ['renal pathology', 'nephropathology'],
  requiredSkills: ['lupus nephritis', 'renal biopsy'],
  patientContext: {
    condition: 'worsening creatinine',
    suspectedDiagnosis: 'lupus nephritis',
  },
};

describe('createRoutingDecision', () => {
  it('instructs inference to use the schema route for unclassifiable requests', () => {
    expect(routingSystemPrompt).toContain('unknown_human_review');
  });

  it('sends the raw request and routing schema to the inference client', async () => {
    const decideRoute = vi.fn<RoutingDecisionClient['decideRoute']>().mockResolvedValue(doctorAssignmentDecision);

    const decision = await createRoutingDecision(
      '  Patient has worsening creatinine and possible lupus nephritis. Need review of renal biopsy.  ',
      { decideRoute },
    );

    expect(decideRoute).toHaveBeenCalledWith({
      rawRequest: 'Patient has worsening creatinine and possible lupus nephritis. Need review of renal biopsy.',
      systemPrompt: routingSystemPrompt,
      outputSchema: routingOutputSchema,
    });
    expect(decision).toEqual(doctorAssignmentDecision);
  });

  it('supports non-doctor workflow routing decisions', async () => {
    const recordsDecision: RoutingDecision = {
      route: 'records_request',
      confidence: 0.88,
      reason: 'The request is administrative and does not require doctor assignment.',
      caseSummary: 'Request is about missing paperwork.',
      caseType: null,
      priority: 'normal',
      requiredSpecialties: [],
      requiredSkills: [],
      patientContext: {},
    };
    const client: RoutingDecisionClient = {
      decideRoute: vi.fn().mockResolvedValue(recordsDecision),
    };

    await expect(createRoutingDecision('Need a copy of prior records.', client)).resolves.toEqual(recordsDecision);
  });

  it('rejects blank raw requests before calling inference', async () => {
    const decideRoute = vi.fn<RoutingDecisionClient['decideRoute']>();

    await expect(createRoutingDecision('   ', { decideRoute })).rejects.toThrow('raw request is required');
    expect(decideRoute).not.toHaveBeenCalled();
  });
});

describe('parseRoutingDecision', () => {
  it('rejects malformed inference output', () => {
    expect(() =>
      parseRoutingDecision({
        ...doctorAssignmentDecision,
        confidence: 2,
      }),
    ).toThrow('confidence');
  });
});
