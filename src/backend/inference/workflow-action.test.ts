import { describe, expect, it } from 'vitest';
import {
  parseWorkflowAction,
  validateDoctorReassignmentSelection,
  type DoctorReassignmentSelection,
} from './workflow-action';

describe('parseWorkflowAction', () => {
  it('parses a supported workflow action', () => {
    expect(parseWorkflowAction({
      action: 'reassign_doctor',
      requestedAssigneeName: 'Dr. Emily Chen',
      reason: 'The user requested this doctor.',
      confidence: 0.92,
    })).toEqual({
      action: 'reassign_doctor',
      requestedAssigneeName: 'Dr. Emily Chen',
      reason: 'The user requested this doctor.',
      confidence: 0.92,
    });
  });
});

describe('validateDoctorReassignmentSelection', () => {
  const candidates = [{
    id: 7,
    name: 'Dr. Emily Chen',
    specialties: ['Renal Pathology'],
    skills: ['Lupus Nephritis'],
    caseTypes: ['Renal Biopsy'],
    description: 'Renal pathologist.',
    ptoStatus: false,
    currentLoad: 3,
  }];

  it('rejects non-candidate selected doctors', () => {
    const selection: DoctorReassignmentSelection = {
      selectedDoctorId: 99,
      confidence: 0.94,
      reason: 'Selected by name.',
      needsReview: false,
      needsReviewReason: null,
    };

    expect(() => validateDoctorReassignmentSelection(selection, candidates)).toThrow('non-candidate doctorId 99');
  });
});
