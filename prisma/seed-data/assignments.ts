import { date } from './utils.ts';

export const assignments = [
  {
    "id": 1,
    "doctorId": 5,
    "workflowTaskId": 202,
    "summary": "Dr. Daniel Kim is assigned to evaluate and manage the clinical case of widespread eczema. He is required to perform clinical assessment and dermatological diagnosis, utilizing his expertise in dermatopathology and skin biopsy. This specialist evaluation is necessary to confirm the diagnosis and guide appropriate treatment.",
    "createdAt": date("2026-07-07T02:55:42.990Z"),
    "updatedAt": date("2026-07-07T02:55:42.990Z")
  },
  {
    "id": 2,
    "doctorId": 5,
    "workflowTaskId": 206,
    "summary": "Evaluate and manage the patient's eczema localized to the left leg, focusing on clinical evaluation and dermatopathology to address the itching and spreading symptoms.",
    "createdAt": date("2026-07-07T02:57:35.834Z"),
    "updatedAt": date("2026-07-07T02:57:35.834Z")
  },
  {
    "id": 3,
    "doctorId": 28,
    "workflowTaskId": 208,
    "summary": "Reassigned from Dr. Daniel Kim to Dr. Adrian Scott. Requested doctor Adrian matches candidate Dr. Adrian Scott who has relevant specialties and is available for assignment.",
    "createdAt": date("2026-07-07T21:36:48.418Z"),
    "updatedAt": date("2026-07-07T21:36:48.418Z")
  },
  {
    "id": 4,
    "doctorId": 16,
    "workflowTaskId": 212,
    "summary": "Review the clinical case of patient Jane Doe diagnosed with dysentery. Use your expertise in Infectious Disease Pathology to provide diagnosis confirmation and formulate an appropriate treatment plan. Your skills are critical for managing this infectious disease affecting the gastrointestinal system.",
    "createdAt": date("2026-07-07T21:37:43.891Z"),
    "updatedAt": date("2026-07-07T21:37:43.891Z")
  }
];
