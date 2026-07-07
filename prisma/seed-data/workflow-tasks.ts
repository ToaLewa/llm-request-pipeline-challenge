import { date } from './utils.ts';

const availableSkills = [
  {
    "id": 8,
    "name": "Breast Pathology",
    "category": "specialty",
    "skillCode": "breast-pathology"
  },
  {
    "id": 7,
    "name": "Cytopathology",
    "category": "specialty",
    "skillCode": "cytopathology"
  },
  {
    "id": 5,
    "name": "Dermatopathology",
    "category": "specialty",
    "skillCode": "dermatopathology"
  },
  {
    "id": 4,
    "name": "Gastrointestinal Pathology",
    "category": "specialty",
    "skillCode": "gastrointestinal-pathology"
  },
  {
    "id": 3,
    "name": "General Surgical Pathology",
    "category": "specialty",
    "skillCode": "general-surgical-pathology"
  },
  {
    "id": 13,
    "name": "Genitourinary Pathology",
    "category": "specialty",
    "skillCode": "genitourinary-pathology"
  },
  {
    "id": 12,
    "name": "Gynecologic Pathology",
    "category": "specialty",
    "skillCode": "gynecologic-pathology"
  },
  {
    "id": 6,
    "name": "Hematopathology",
    "category": "specialty",
    "skillCode": "hematopathology"
  },
  {
    "id": 11,
    "name": "Molecular Pathology",
    "category": "specialty",
    "skillCode": "molecular-pathology"
  },
  {
    "id": 2,
    "name": "Nephropathology",
    "category": "specialty",
    "skillCode": "nephropathology"
  },
  {
    "id": 10,
    "name": "Neuropathology",
    "category": "specialty",
    "skillCode": "neuropathology"
  },
  {
    "id": 14,
    "name": "Pediatric Pathology",
    "category": "specialty",
    "skillCode": "pediatric-pathology"
  },
  {
    "id": 1,
    "name": "Renal Pathology",
    "category": "specialty",
    "skillCode": "renal-pathology"
  },
  {
    "id": 9,
    "name": "Thoracic Pathology",
    "category": "specialty",
    "skillCode": "thoracic-pathology"
  },
  {
    "id": 39,
    "name": "Brain Tumor Classification",
    "category": "clinical_skill",
    "skillCode": "brain-tumor-classification"
  },
  {
    "id": 37,
    "name": "Breast Biomarkers",
    "category": "clinical_skill",
    "skillCode": "breast-biomarkers"
  },
  {
    "id": 29,
    "name": "Colon Dysplasia",
    "category": "clinical_skill",
    "skillCode": "colon-dysplasia"
  },
  {
    "id": 31,
    "name": "Cutaneous Lymphoma",
    "category": "clinical_skill",
    "skillCode": "cutaneous-lymphoma"
  },
  {
    "id": 41,
    "name": "Endometrial Cancer",
    "category": "clinical_skill",
    "skillCode": "endometrial-cancer"
  },
  {
    "id": 34,
    "name": "Flow Cytometry Correlation",
    "category": "clinical_skill",
    "skillCode": "flow-cytometry-correlation"
  },
  {
    "id": 27,
    "name": "GI Pathology",
    "category": "clinical_skill",
    "skillCode": "gi-pathology"
  },
  {
    "id": 26,
    "name": "Glomerulonephritis",
    "category": "clinical_skill",
    "skillCode": "glomerulonephritis"
  },
  {
    "id": 46,
    "name": "Immunohistochemistry",
    "category": "clinical_skill",
    "skillCode": "immunohistochemistry"
  },
  {
    "id": 45,
    "name": "Infectious Disease Pathology",
    "category": "clinical_skill",
    "skillCode": "infectious-disease-pathology"
  },
  {
    "id": 28,
    "name": "Inflammatory Bowel Disease",
    "category": "clinical_skill",
    "skillCode": "inflammatory-bowel-disease"
  },
  {
    "id": 32,
    "name": "Leukemia Workup",
    "category": "clinical_skill",
    "skillCode": "leukemia-workup"
  },
  {
    "id": 38,
    "name": "Lung Tumor Typing",
    "category": "clinical_skill",
    "skillCode": "lung-tumor-typing"
  },
  {
    "id": 25,
    "name": "Lupus Nephritis",
    "category": "clinical_skill",
    "skillCode": "lupus-nephritis"
  },
  {
    "id": 33,
    "name": "Lymphoma Classification",
    "category": "clinical_skill",
    "skillCode": "lymphoma-classification"
  },
  {
    "id": 30,
    "name": "Melanocytic Lesions",
    "category": "clinical_skill",
    "skillCode": "melanocytic-lesions"
  },
  {
    "id": 40,
    "name": "NGS Interpretation",
    "category": "clinical_skill",
    "skillCode": "ngs-interpretation"
  },
  {
    "id": 35,
    "name": "Pap Cytology",
    "category": "clinical_skill",
    "skillCode": "pap-cytology"
  },
  {
    "id": 43,
    "name": "Pediatric Solid Tumors",
    "category": "clinical_skill",
    "skillCode": "pediatric-solid-tumors"
  },
  {
    "id": 42,
    "name": "Prostate Grading",
    "category": "clinical_skill",
    "skillCode": "prostate-grading"
  },
  {
    "id": 36,
    "name": "Thyroid FNA",
    "category": "clinical_skill",
    "skillCode": "thyroid-fna"
  },
  {
    "id": 44,
    "name": "Transplant Pathology",
    "category": "clinical_skill",
    "skillCode": "transplant-pathology"
  },
  {
    "id": 24,
    "name": "Autopsy Review",
    "category": "case_type",
    "skillCode": "autopsy-review"
  },
  {
    "id": 16,
    "name": "Biopsy Review",
    "category": "case_type",
    "skillCode": "biopsy-review"
  },
  {
    "id": 20,
    "name": "Bone Marrow Biopsy",
    "category": "case_type",
    "skillCode": "bone-marrow-biopsy"
  },
  {
    "id": 19,
    "name": "Fine Needle Aspiration",
    "category": "case_type",
    "skillCode": "fine-needle-aspiration"
  },
  {
    "id": 18,
    "name": "Frozen Section",
    "category": "case_type",
    "skillCode": "frozen-section"
  },
  {
    "id": 22,
    "name": "Lymph Node Biopsy",
    "category": "case_type",
    "skillCode": "lymph-node-biopsy"
  },
  {
    "id": 23,
    "name": "Needle Core Biopsy",
    "category": "case_type",
    "skillCode": "needle-core-biopsy"
  },
  {
    "id": 15,
    "name": "Renal Biopsy",
    "category": "case_type",
    "skillCode": "renal-biopsy"
  },
  {
    "id": 17,
    "name": "Resection Review",
    "category": "case_type",
    "skillCode": "resection-review"
  },
  {
    "id": 21,
    "name": "Skin Biopsy",
    "category": "case_type",
    "skillCode": "skin-biopsy"
  }
];

export const workflowTasks = [
  {
    "id": 1,
    "workflowId": 1,
    "requestId": 1,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "tohunotahut"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "The request 'tohunotahut' is not understandable and does not provide any clinical or operational details to classify.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.1,
      "caseSummary": "",
      "patientContext": {},
      "requiredSkills": [],
      "requiredSpecialties": []
    },
    "reason": "The request 'tohunotahut' is not understandable and does not provide any clinical or operational details to classify.",
    "createdAt": date("2026-07-07T00:45:11.548Z"),
    "updatedAt": date("2026-07-07T00:45:11.548Z")
  },
  {
    "id": 2,
    "workflowId": 2,
    "requestId": 2,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "I have lupus"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a patient condition (lupus), which requires clinical assessment and possible specialist review.",
      "caseType": "patient condition",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient reports having lupus.",
      "patientContext": {},
      "requiredSkills": [
        "clinical assessment"
      ],
      "requiredSpecialties": [
        "rheumatology"
      ]
    },
    "reason": "The request describes a patient condition (lupus), which requires clinical assessment and possible specialist review.",
    "createdAt": date("2026-07-07T00:45:52.697Z"),
    "updatedAt": date("2026-07-07T00:45:52.697Z")
  },
  {
    "id": 34,
    "workflowId": 34,
    "requestId": 34,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Blah blah blah"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "The request is nonsensical and does not contain any identifiable clinical or administrative information.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.4,
      "caseSummary": "",
      "patientContext": {},
      "requiredSkills": [],
      "requiredSpecialties": []
    },
    "reason": "The request is nonsensical and does not contain any identifiable clinical or administrative information.",
    "createdAt": date("2026-07-07T00:49:11.209Z"),
    "updatedAt": date("2026-07-07T00:49:11.209Z")
  },
  {
    "id": 35,
    "workflowId": 35,
    "requestId": 35,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Need to see doctor chan about Brasil failing to score in the world cup"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "Request involves seeing a specific doctor for a patient-related concern, indicating a clinical interaction.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.8,
      "caseSummary": "Patient wants to see Dr. Chan regarding Brazil's performance in the World Cup.",
      "patientContext": {},
      "requiredSkills": [
        "consultation"
      ],
      "requiredSpecialties": [
        "general practice"
      ]
    },
    "reason": "Request involves seeing a specific doctor for a patient-related concern, indicating a clinical interaction.",
    "createdAt": date("2026-07-07T00:49:45.307Z"),
    "updatedAt": date("2026-07-07T00:49:45.307Z")
  },
  {
    "id": 36,
    "workflowId": 36,
    "requestId": 36,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Brasil failing to score in the world cup"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "The request is about a sports performance issue (Brasil failing to score in the world cup), which is unrelated to medical, clinical, billing, records, or scheduling concerns requiring healthcare professional intervention.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Inquiry about Brasil's performance in scoring during the world cup.",
      "patientContext": {},
      "requiredSkills": [],
      "requiredSpecialties": []
    },
    "reason": "The request is about a sports performance issue (Brasil failing to score in the world cup), which is unrelated to medical, clinical, billing, records, or scheduling concerns requiring healthcare professional intervention.",
    "createdAt": date("2026-07-07T00:50:01.497Z"),
    "updatedAt": date("2026-07-07T00:50:01.497Z")
  },
  {
    "id": 67,
    "workflowId": 67,
    "requestId": 67,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Patient requests cambells chicken noodle"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "The request 'Patient requests cambells chicken noodle' does not clearly relate to clinical cases, billing, records, or scheduling, and may need human review for clarification.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.6,
      "caseSummary": "Patient requested Campbell's chicken noodle product; unclear if this is a dietary, prescription, or other type of request.",
      "patientContext": {},
      "requiredSkills": [],
      "requiredSpecialties": []
    },
    "reason": "The request 'Patient requests cambells chicken noodle' does not clearly relate to clinical cases, billing, records, or scheduling, and may need human review for clarification.",
    "createdAt": date("2026-07-07T01:29:38.333Z"),
    "updatedAt": date("2026-07-07T01:29:38.333Z")
  },
  {
    "id": 68,
    "workflowId": 68,
    "requestId": 68,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Patient is complaining about an ingrown toenail"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case involving a patient's complaint about an ingrown toenail, which requires evaluation by a healthcare professional.",
      "caseType": "clinical case",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient is complaining about an ingrown toenail.",
      "patientContext": {},
      "requiredSkills": [
        "clinical evaluation",
        "diagnosis"
      ],
      "requiredSpecialties": [
        "podiatry",
        "general practice"
      ]
    },
    "reason": "The request describes a clinical case involving a patient's complaint about an ingrown toenail, which requires evaluation by a healthcare professional.",
    "createdAt": date("2026-07-07T01:30:10.992Z"),
    "updatedAt": date("2026-07-07T01:30:10.992Z")
  },
  {
    "id": 69,
    "workflowId": 69,
    "requestId": 69,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Fracture of the skull"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case (fracture of the skull) requiring medical evaluation and specialist review.",
      "caseType": "clinical_case",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient with a skull fracture requiring specialist medical evaluation.",
      "patientContext": {},
      "requiredSkills": [
        "Diagnosis",
        "Clinical evaluation",
        "Imaging interpretation"
      ],
      "requiredSpecialties": [
        "Neurosurgery",
        "Orthopedics",
        "Trauma Medicine"
      ]
    },
    "reason": "The request describes a clinical case (fracture of the skull) requiring medical evaluation and specialist review.",
    "createdAt": date("2026-07-07T02:01:44.708Z"),
    "updatedAt": date("2026-07-07T02:01:44.708Z")
  },
  {
    "id": 70,
    "workflowId": 69,
    "requestId": 69,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Fracture of the skull",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case (fracture of the skull) requiring medical evaluation and specialist review.",
        "caseType": "clinical_case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient with a skull fracture requiring specialist medical evaluation.",
        "patientContext": {},
        "requiredSkills": [
          "Diagnosis",
          "Clinical evaluation",
          "Imaging interpretation"
        ],
        "requiredSpecialties": [
          "Neurosurgery",
          "Orthopedics",
          "Trauma Medicine"
        ]
      }
    },
    "output": {
      "reason": "Skills related to neurological pathology and rapid intraoperative assessment match best with skull fracture requiring neurosurgical intervention.",
      "confidence": 0.9,
      "rankedSkills": [
        {
          "score": 0.9,
          "reason": "Skull fracture involves neurological structures, making neuropathology the top specialty skill.",
          "skillId": 10,
          "skillCode": "neuropathology"
        },
        {
          "score": 0.7,
          "reason": "Frozen section technique may be useful in urgent intraoperative assessment in trauma/neurosurgery.",
          "skillId": 18,
          "skillCode": "frozen-section"
        },
        {
          "score": 0.6,
          "reason": "Biopsy review relates to clinical evaluation and diagnosis skills needed in managing fractures and assessment of injured tissue.",
          "skillId": 16,
          "skillCode": "biopsy-review"
        }
      ]
    },
    "reason": "Skills related to neurological pathology and rapid intraoperative assessment match best with skull fracture requiring neurosurgical intervention.",
    "createdAt": date("2026-07-07T02:01:48.354Z"),
    "updatedAt": date("2026-07-07T02:01:48.354Z")
  },
  {
    "id": 71,
    "workflowId": 69,
    "requestId": 69,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "completed",
    "input": {
      "rawRequest": "Fracture of the skull",
      "rankedSkills": [
        {
          "score": 0.9,
          "reason": "Skull fracture involves neurological structures, making neuropathology the top specialty skill.",
          "skillId": 10,
          "skillCode": "neuropathology"
        },
        {
          "score": 0.7,
          "reason": "Frozen section technique may be useful in urgent intraoperative assessment in trauma/neurosurgery.",
          "skillId": 18,
          "skillCode": "frozen-section"
        },
        {
          "score": 0.6,
          "reason": "Biopsy review relates to clinical evaluation and diagnosis skills needed in managing fractures and assessment of injured tissue.",
          "skillId": 16,
          "skillCode": "biopsy-review"
        }
      ],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case (fracture of the skull) requiring medical evaluation and specialist review.",
        "caseType": "clinical_case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient with a skull fracture requiring specialist medical evaluation.",
        "patientContext": {},
        "requiredSkills": [
          "Diagnosis",
          "Clinical evaluation",
          "Imaging interpretation"
        ],
        "requiredSpecialties": [
          "Neurosurgery",
          "Orthopedics",
          "Trauma Medicine"
        ]
      },
      "candidateDoctors": [
        {
          "id": 23,
          "name": "Dr. Isabel Walker",
          "skills": [
            "Brain Tumor Classification"
          ],
          "caseTypes": [
            "Autopsy Review",
            "Frozen Section"
          ],
          "ptoStatus": false,
          "currentLoad": 3,
          "description": "Neuropathologist covering brain tumors, autopsy neuropathology, and frozen sections.",
          "specialties": [
            "Neuropathology"
          ]
        },
        {
          "id": 10,
          "name": "Dr. Hannah Miller",
          "skills": [
            "Brain Tumor Classification"
          ],
          "caseTypes": [
            "Frozen Section"
          ],
          "ptoStatus": false,
          "currentLoad": 3,
          "description": "Neuropathologist with experience in brain tumor classification and intraoperative consultation.",
          "specialties": [
            "Neuropathology",
            "Molecular Pathology"
          ]
        },
        {
          "id": 30,
          "name": "Dr. Naomi Adams",
          "skills": [
            "Breast Biomarkers"
          ],
          "caseTypes": [
            "Needle Core Biopsy",
            "Frozen Section"
          ],
          "ptoStatus": false,
          "currentLoad": 1,
          "description": "Breast pathologist covering urgent core biopsies and frozen section consultation.",
          "specialties": [
            "Breast Pathology"
          ]
        },
        {
          "id": 16,
          "name": "Dr. Jamal Moore",
          "skills": [
            "Infectious Disease Pathology"
          ],
          "caseTypes": [
            "Frozen Section",
            "Resection Review"
          ],
          "ptoStatus": false,
          "currentLoad": 1,
          "description": "General surgical pathologist handling frozen sections, resections, and infectious disease cases.",
          "specialties": [
            "General Surgical Pathology"
          ]
        },
        {
          "id": 25,
          "name": "Dr. Fatima Allen",
          "skills": [
            "Pediatric Solid Tumors",
            "Infectious Disease Pathology"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 2,
          "description": "Pediatric and infectious disease pathologist handling unusual biopsy consults.",
          "specialties": [
            "Pediatric Pathology"
          ]
        },
        {
          "id": 14,
          "name": "Dr. Maya Taylor",
          "skills": [
            "Pediatric Solid Tumors"
          ],
          "caseTypes": [
            "Autopsy Review",
            "Frozen Section"
          ],
          "ptoStatus": false,
          "currentLoad": 2,
          "description": "Pediatric pathologist covering solid tumors, autopsy review, and complex consults.",
          "specialties": [
            "Pediatric Pathology"
          ]
        },
        {
          "id": 2,
          "name": "Dr. Ravi Patel",
          "skills": [
            "GI Pathology"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 2,
          "description": "General surgical pathologist with broad biopsy review experience and GI pathology coverage.",
          "specialties": [
            "General Surgical Pathology"
          ]
        },
        {
          "id": 12,
          "name": "Dr. Elena Martinez",
          "skills": [
            "Endometrial Cancer"
          ],
          "caseTypes": [
            "Resection Review",
            "Frozen Section"
          ],
          "ptoStatus": false,
          "currentLoad": 4,
          "description": "Gynecologic pathologist specializing in endometrial carcinoma and frozen section support.",
          "specialties": [
            "Gynecologic Pathology"
          ]
        }
      ]
    },
    "output": {
      "confidence": 0.9,
      "unassignable": false,
      "assignmentReason": "Dr. Hannah Miller is a neuropathologist with relevant expertise and experience in frozen sections, closely matching the clinical specialty need for neurosurgery and trauma medicine assessment for a skull fracture.",
      "rankedCandidates": [
        {
          "score": 0.9,
          "reason": "Dual specialty in Neuropathology and Molecular Pathology, relevant frozen section experience, workload 3.",
          "doctorId": 10
        },
        {
          "score": 0.8,
          "reason": "Neuropathology specialty and frozen section experienced but fewer related skills and same current workload as Dr. Miller.",
          "doctorId": 23
        }
      ],
      "selectedDoctorId": 10,
      "unassignableReason": null
    },
    "reason": "Dr. Hannah Miller is a neuropathologist with relevant expertise and experience in frozen sections, closely matching the clinical specialty need for neurosurgery and trauma medicine assessment for a skull fracture.",
    "createdAt": date("2026-07-07T02:01:51.631Z"),
    "updatedAt": date("2026-07-07T02:01:51.631Z")
  },
  {
    "id": 72,
    "workflowId": 69,
    "requestId": 69,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "completed",
    "input": {
      "selectedDoctorId": 10,
      "doctorRankingTaskId": 71
    },
    "output": {
      "assignedDoctorId": 10,
      "assignmentReason": "Dr. Hannah Miller is a neuropathologist with relevant expertise and experience in frozen sections, closely matching the clinical specialty need for neurosurgery and trauma medicine assessment for a skull fracture.",
      "rankingConfidence": 0.9,
      "assignedDoctorName": "Dr. Hannah Miller",
      "unassignableReason": null
    },
    "reason": "Dr. Hannah Miller is a neuropathologist with relevant expertise and experience in frozen sections, closely matching the clinical specialty need for neurosurgery and trauma medicine assessment for a skull fracture.",
    "createdAt": date("2026-07-07T02:01:51.643Z"),
    "updatedAt": date("2026-07-07T02:01:51.643Z")
  },
  {
    "id": 73,
    "workflowId": 70,
    "requestId": 70,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Dog has a fracture of the hipbone"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case involving a fracture, requiring specialist review.",
      "caseType": "clinical case",
      "priority": "normal",
      "confidence": 0.95,
      "caseSummary": "Fracture of the hipbone in a dog",
      "patientContext": {
        "species": "dog",
        "condition": "hipbone fracture"
      },
      "requiredSkills": [
        "diagnosis",
        "treatment planning",
        "fracture management"
      ],
      "requiredSpecialties": [
        "veterinary orthopedics"
      ]
    },
    "reason": "The request describes a clinical case involving a fracture, requiring specialist review.",
    "createdAt": date("2026-07-07T02:10:42.104Z"),
    "updatedAt": date("2026-07-07T02:10:42.104Z")
  },
  {
    "id": 74,
    "workflowId": 70,
    "requestId": 70,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Dog has a fracture of the hipbone",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving a fracture, requiring specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.95,
        "caseSummary": "Fracture of the hipbone in a dog",
        "patientContext": {
          "species": "dog",
          "condition": "hipbone fracture"
        },
        "requiredSkills": [
          "diagnosis",
          "treatment planning",
          "fracture management"
        ],
        "requiredSpecialties": [
          "veterinary orthopedics"
        ]
      }
    },
    "output": {
      "reason": "No relevant skills found in the provided availableSkills list for veterinary orthopedics or fracture management in a dog.",
      "confidence": 0.95,
      "rankedSkills": []
    },
    "reason": "No relevant skills found in the provided availableSkills list for veterinary orthopedics or fracture management in a dog.",
    "createdAt": date("2026-07-07T02:10:43.707Z"),
    "updatedAt": date("2026-07-07T02:10:43.707Z")
  },
  {
    "id": 75,
    "workflowId": 70,
    "requestId": 70,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "unassignable",
    "input": {
      "rawRequest": "Dog has a fracture of the hipbone",
      "rankedSkills": [],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving a fracture, requiring specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.95,
        "caseSummary": "Fracture of the hipbone in a dog",
        "patientContext": {
          "species": "dog",
          "condition": "hipbone fracture"
        },
        "requiredSkills": [
          "diagnosis",
          "treatment planning",
          "fracture management"
        ],
        "requiredSpecialties": [
          "veterinary orthopedics"
        ]
      },
      "candidateDoctors": []
    },
    "output": {
      "confidence": 1,
      "unassignable": true,
      "assignmentReason": "",
      "rankedCandidates": [],
      "selectedDoctorId": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:10:43.720Z"),
    "updatedAt": date("2026-07-07T02:10:43.720Z")
  },
  {
    "id": 76,
    "workflowId": 70,
    "requestId": 70,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "unassignable",
    "input": {
      "selectedDoctorId": null,
      "doctorRankingTaskId": 75
    },
    "output": {
      "assignedDoctorId": null,
      "assignmentReason": null,
      "rankingConfidence": 1,
      "assignedDoctorName": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:10:43.721Z"),
    "updatedAt": date("2026-07-07T02:10:43.721Z")
  },
  {
    "id": 106,
    "workflowId": 103,
    "requestId": 103,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Parrot is having diabetes and won't drink any water."
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case about a pet (Parrot) with diabetes and dehydration symptoms, requiring medical assessment and possible intervention.",
      "caseType": "clinical case",
      "priority": "urgent",
      "confidence": 0.9,
      "caseSummary": "Parrot is a diabetic patient who is refusing to drink water, indicating a potential health risk requiring clinical evaluation.",
      "patientContext": {
        "species": "parrot",
        "symptom": "not drinking water",
        "condition": "diabetes"
      },
      "requiredSkills": [
        "veterinary diagnosis",
        "diabetes management"
      ],
      "requiredSpecialties": [
        "veterinary endocrinology"
      ]
    },
    "reason": "The request describes a clinical case about a pet (Parrot) with diabetes and dehydration symptoms, requiring medical assessment and possible intervention.",
    "createdAt": date("2026-07-07T02:14:05.468Z"),
    "updatedAt": date("2026-07-07T02:14:05.468Z")
  },
  {
    "id": 107,
    "workflowId": 103,
    "requestId": 103,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Parrot is having diabetes and won't drink any water.",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case about a pet (Parrot) with diabetes and dehydration symptoms, requiring medical assessment and possible intervention.",
        "caseType": "clinical case",
        "priority": "urgent",
        "confidence": 0.9,
        "caseSummary": "Parrot is a diabetic patient who is refusing to drink water, indicating a potential health risk requiring clinical evaluation.",
        "patientContext": {
          "species": "parrot",
          "symptom": "not drinking water",
          "condition": "diabetes"
        },
        "requiredSkills": [
          "veterinary diagnosis",
          "diabetes management"
        ],
        "requiredSpecialties": [
          "veterinary endocrinology"
        ]
      }
    },
    "output": {
      "reason": "No suitable canonical skills from the provided list match the veterinary endocrinology specialty or diabetes management clinical skills required for a parrot with diabetes and dehydration.",
      "confidence": 0.9,
      "rankedSkills": []
    },
    "reason": "No suitable canonical skills from the provided list match the veterinary endocrinology specialty or diabetes management clinical skills required for a parrot with diabetes and dehydration.",
    "createdAt": date("2026-07-07T02:14:16.501Z"),
    "updatedAt": date("2026-07-07T02:14:16.501Z")
  },
  {
    "id": 108,
    "workflowId": 103,
    "requestId": 103,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "unassignable",
    "input": {
      "rawRequest": "Parrot is having diabetes and won't drink any water.",
      "rankedSkills": [],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case about a pet (Parrot) with diabetes and dehydration symptoms, requiring medical assessment and possible intervention.",
        "caseType": "clinical case",
        "priority": "urgent",
        "confidence": 0.9,
        "caseSummary": "Parrot is a diabetic patient who is refusing to drink water, indicating a potential health risk requiring clinical evaluation.",
        "patientContext": {
          "species": "parrot",
          "symptom": "not drinking water",
          "condition": "diabetes"
        },
        "requiredSkills": [
          "veterinary diagnosis",
          "diabetes management"
        ],
        "requiredSpecialties": [
          "veterinary endocrinology"
        ]
      },
      "candidateDoctors": []
    },
    "output": {
      "confidence": 1,
      "unassignable": true,
      "assignmentReason": "",
      "rankedCandidates": [],
      "selectedDoctorId": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:14:16.519Z"),
    "updatedAt": date("2026-07-07T02:14:16.519Z")
  },
  {
    "id": 109,
    "workflowId": 103,
    "requestId": 103,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "unassignable",
    "input": {
      "selectedDoctorId": null,
      "doctorRankingTaskId": 108
    },
    "output": {
      "assignedDoctorId": null,
      "assignmentReason": null,
      "rankingConfidence": 1,
      "assignedDoctorName": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:14:16.520Z"),
    "updatedAt": date("2026-07-07T02:14:16.520Z")
  },
  {
    "id": 139,
    "workflowId": 136,
    "requestId": 136,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Tiger broke its leg and femur and is suffering convulsions."
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case involving a tiger with a broken leg and femur and suffering convulsions, which requires specialist medical review.",
      "caseType": "clinical case",
      "priority": "urgent",
      "confidence": 0.95,
      "caseSummary": "A tiger with a broken leg and femur and experiencing convulsions.",
      "patientContext": {
        "injury": "broken leg and femur",
        "species": "tiger",
        "symptoms": "convulsions"
      },
      "requiredSkills": [
        "fracture management",
        "neurological assessment"
      ],
      "requiredSpecialties": [
        "veterinary orthopedics",
        "veterinary neurology"
      ]
    },
    "reason": "The request describes a clinical case involving a tiger with a broken leg and femur and suffering convulsions, which requires specialist medical review.",
    "createdAt": date("2026-07-07T02:15:34.676Z"),
    "updatedAt": date("2026-07-07T02:15:34.676Z")
  },
  {
    "id": 140,
    "workflowId": 136,
    "requestId": 136,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Tiger broke its leg and femur and is suffering convulsions.",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving a tiger with a broken leg and femur and suffering convulsions, which requires specialist medical review.",
        "caseType": "clinical case",
        "priority": "urgent",
        "confidence": 0.95,
        "caseSummary": "A tiger with a broken leg and femur and experiencing convulsions.",
        "patientContext": {
          "injury": "broken leg and femur",
          "species": "tiger",
          "symptoms": "convulsions"
        },
        "requiredSkills": [
          "fracture management",
          "neurological assessment"
        ],
        "requiredSpecialties": [
          "veterinary orthopedics",
          "veterinary neurology"
        ]
      }
    },
    "output": {
      "reason": "None of the available skills match the veterinary orthopedic or veterinary neurology specialties or the required clinical skills such as fracture management or neurological assessment for this tiger clinical case.",
      "confidence": 0.95,
      "rankedSkills": []
    },
    "reason": "None of the available skills match the veterinary orthopedic or veterinary neurology specialties or the required clinical skills such as fracture management or neurological assessment for this tiger clinical case.",
    "createdAt": date("2026-07-07T02:15:36.162Z"),
    "updatedAt": date("2026-07-07T02:15:36.162Z")
  },
  {
    "id": 141,
    "workflowId": 136,
    "requestId": 136,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "unassignable",
    "input": {
      "rawRequest": "Tiger broke its leg and femur and is suffering convulsions.",
      "rankedSkills": [],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving a tiger with a broken leg and femur and suffering convulsions, which requires specialist medical review.",
        "caseType": "clinical case",
        "priority": "urgent",
        "confidence": 0.95,
        "caseSummary": "A tiger with a broken leg and femur and experiencing convulsions.",
        "patientContext": {
          "injury": "broken leg and femur",
          "species": "tiger",
          "symptoms": "convulsions"
        },
        "requiredSkills": [
          "fracture management",
          "neurological assessment"
        ],
        "requiredSpecialties": [
          "veterinary orthopedics",
          "veterinary neurology"
        ]
      },
      "candidateDoctors": []
    },
    "output": {
      "confidence": 1,
      "unassignable": true,
      "assignmentReason": "",
      "rankedCandidates": [],
      "selectedDoctorId": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:15:36.176Z"),
    "updatedAt": date("2026-07-07T02:15:36.176Z")
  },
  {
    "id": 142,
    "workflowId": 136,
    "requestId": 136,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "unassignable",
    "input": {
      "selectedDoctorId": null,
      "doctorRankingTaskId": 141
    },
    "output": {
      "assignedDoctorId": null,
      "assignmentReason": null,
      "rankingConfidence": 1,
      "assignedDoctorName": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:15:36.177Z"),
    "updatedAt": date("2026-07-07T02:15:36.177Z")
  },
  {
    "id": 172,
    "workflowId": 169,
    "requestId": 169,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Lizard's tongue fell off and needs to be sewn back on."
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case involving injury to a lizard requiring medical specialists for treatment.",
      "caseType": "animal injury",
      "priority": "urgent",
      "confidence": 0.95,
      "caseSummary": "Lizard's tongue fell off and needs to be sewn back on.",
      "patientContext": {
        "injury": "tongue detached",
        "species": "lizard"
      },
      "requiredSkills": [
        "surgery",
        "wound repair"
      ],
      "requiredSpecialties": [
        "veterinary medicine"
      ]
    },
    "reason": "The request describes a clinical case involving injury to a lizard requiring medical specialists for treatment.",
    "createdAt": date("2026-07-07T02:21:05.932Z"),
    "updatedAt": date("2026-07-07T02:21:05.932Z")
  },
  {
    "id": 173,
    "workflowId": 169,
    "requestId": 169,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Lizard's tongue fell off and needs to be sewn back on.",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving injury to a lizard requiring medical specialists for treatment.",
        "caseType": "animal injury",
        "priority": "urgent",
        "confidence": 0.95,
        "caseSummary": "Lizard's tongue fell off and needs to be sewn back on.",
        "patientContext": {
          "injury": "tongue detached",
          "species": "lizard"
        },
        "requiredSkills": [
          "surgery",
          "wound repair"
        ],
        "requiredSpecialties": [
          "veterinary medicine"
        ]
      }
    },
    "output": {
      "reason": "No relevant canonical skills from the available list match veterinary medicine, surgery, or wound repair for treating a lizard's injury.",
      "confidence": 0.95,
      "rankedSkills": []
    },
    "reason": "No relevant canonical skills from the available list match veterinary medicine, surgery, or wound repair for treating a lizard's injury.",
    "createdAt": date("2026-07-07T02:21:07.736Z"),
    "updatedAt": date("2026-07-07T02:21:07.736Z")
  },
  {
    "id": 174,
    "workflowId": 169,
    "requestId": 169,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "unassignable",
    "input": {
      "rawRequest": "Lizard's tongue fell off and needs to be sewn back on.",
      "rankedSkills": [],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving injury to a lizard requiring medical specialists for treatment.",
        "caseType": "animal injury",
        "priority": "urgent",
        "confidence": 0.95,
        "caseSummary": "Lizard's tongue fell off and needs to be sewn back on.",
        "patientContext": {
          "injury": "tongue detached",
          "species": "lizard"
        },
        "requiredSkills": [
          "surgery",
          "wound repair"
        ],
        "requiredSpecialties": [
          "veterinary medicine"
        ]
      },
      "candidateDoctors": []
    },
    "output": {
      "confidence": 1,
      "unassignable": true,
      "assignmentReason": "",
      "rankedCandidates": [],
      "selectedDoctorId": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:21:07.749Z"),
    "updatedAt": date("2026-07-07T02:21:07.749Z")
  },
  {
    "id": 175,
    "workflowId": 169,
    "requestId": 169,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "unassignable",
    "input": {
      "selectedDoctorId": null,
      "doctorRankingTaskId": 174
    },
    "output": {
      "assignedDoctorId": null,
      "assignmentReason": null,
      "rankingConfidence": 1,
      "assignedDoctorName": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:21:07.751Z"),
    "updatedAt": date("2026-07-07T02:21:07.751Z")
  },
  {
    "id": 176,
    "workflowId": 169,
    "requestId": 169,
    "taskType": "unknown_human_review",
    "sequence": 5,
    "status": "required",
    "input": {
      "failedTaskId": 175,
      "failedTaskType": "doctor_assignment",
      "doctorAssignmentStatus": "unassignable"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:21:07.752Z"),
    "updatedAt": date("2026-07-07T02:21:07.752Z")
  },
  {
    "id": 177,
    "workflowId": 170,
    "requestId": 170,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "boom"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "The request 'boom' is ambiguous and does not provide enough information to classify it into any specific medical or operational category.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.2,
      "caseSummary": "",
      "patientContext": {},
      "requiredSkills": [],
      "requiredSpecialties": []
    },
    "reason": "The request 'boom' is ambiguous and does not provide enough information to classify it into any specific medical or operational category.",
    "createdAt": date("2026-07-07T02:22:10.208Z"),
    "updatedAt": date("2026-07-07T02:22:10.208Z")
  },
  {
    "id": 178,
    "workflowId": 171,
    "requestId": 171,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "boom"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "The request 'boom' is unclear and does not describe any clinical or operational request that can be classified confidently.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.3,
      "caseSummary": "",
      "patientContext": {},
      "requiredSkills": [],
      "requiredSpecialties": []
    },
    "reason": "The request 'boom' is unclear and does not describe any clinical or operational request that can be classified confidently.",
    "createdAt": date("2026-07-07T02:23:41.346Z"),
    "updatedAt": date("2026-07-07T02:23:41.346Z")
  },
  {
    "id": 179,
    "workflowId": 172,
    "requestId": 172,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Lizard died and needs heart transplant for another lizard."
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "Request describes a clinical case involving a heart transplant for a lizard, requiring specialist medical review.",
      "caseType": "clinical case",
      "priority": "urgent",
      "confidence": 0.8,
      "caseSummary": "Lizard died and there is a need for a heart transplant for another lizard.",
      "patientContext": {
        "species": "lizard",
        "condition": "death of one lizard, heart transplant needed for another"
      },
      "requiredSkills": [
        "heart transplant surgery",
        "post-operative care",
        "veterinary critical care"
      ],
      "requiredSpecialties": [
        "veterinary cardiology",
        "exotic animal veterinary medicine"
      ]
    },
    "reason": "Request describes a clinical case involving a heart transplant for a lizard, requiring specialist medical review.",
    "createdAt": date("2026-07-07T02:32:15.021Z"),
    "updatedAt": date("2026-07-07T02:32:15.021Z")
  },
  {
    "id": 180,
    "workflowId": 172,
    "requestId": 172,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Lizard died and needs heart transplant for another lizard.",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "Request describes a clinical case involving a heart transplant for a lizard, requiring specialist medical review.",
        "caseType": "clinical case",
        "priority": "urgent",
        "confidence": 0.8,
        "caseSummary": "Lizard died and there is a need for a heart transplant for another lizard.",
        "patientContext": {
          "species": "lizard",
          "condition": "death of one lizard, heart transplant needed for another"
        },
        "requiredSkills": [
          "heart transplant surgery",
          "post-operative care",
          "veterinary critical care"
        ],
        "requiredSpecialties": [
          "veterinary cardiology",
          "exotic animal veterinary medicine"
        ]
      }
    },
    "output": {
      "reason": "No canonical skills in availableSkills directly match veterinary cardiology, exotic animal veterinary medicine, heart transplant surgery, post-operative care, or veterinary critical care required for the lizard clinical case.",
      "confidence": 0.8,
      "rankedSkills": []
    },
    "reason": "No canonical skills in availableSkills directly match veterinary cardiology, exotic animal veterinary medicine, heart transplant surgery, post-operative care, or veterinary critical care required for the lizard clinical case.",
    "createdAt": date("2026-07-07T02:32:17.436Z"),
    "updatedAt": date("2026-07-07T02:32:17.436Z")
  },
  {
    "id": 181,
    "workflowId": 172,
    "requestId": 172,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "unassignable",
    "input": {
      "rawRequest": "Lizard died and needs heart transplant for another lizard.",
      "rankedSkills": [],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "Request describes a clinical case involving a heart transplant for a lizard, requiring specialist medical review.",
        "caseType": "clinical case",
        "priority": "urgent",
        "confidence": 0.8,
        "caseSummary": "Lizard died and there is a need for a heart transplant for another lizard.",
        "patientContext": {
          "species": "lizard",
          "condition": "death of one lizard, heart transplant needed for another"
        },
        "requiredSkills": [
          "heart transplant surgery",
          "post-operative care",
          "veterinary critical care"
        ],
        "requiredSpecialties": [
          "veterinary cardiology",
          "exotic animal veterinary medicine"
        ]
      },
      "candidateDoctors": []
    },
    "output": {
      "confidence": 1,
      "unassignable": true,
      "assignmentReason": "",
      "rankedCandidates": [],
      "selectedDoctorId": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:32:17.456Z"),
    "updatedAt": date("2026-07-07T02:32:17.456Z")
  },
  {
    "id": 182,
    "workflowId": 172,
    "requestId": 172,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "unassignable",
    "input": {
      "selectedDoctorId": null,
      "doctorRankingTaskId": 181
    },
    "output": {
      "assignedDoctorId": null,
      "assignmentReason": null,
      "rankingConfidence": 1,
      "assignedDoctorName": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:32:17.458Z"),
    "updatedAt": date("2026-07-07T02:32:17.458Z")
  },
  {
    "id": 183,
    "workflowId": 172,
    "requestId": 172,
    "taskType": "unknown_human_review",
    "sequence": 5,
    "status": "required",
    "input": {
      "failedTaskId": 182,
      "failedTaskType": "doctor_assignment",
      "doctorAssignmentStatus": "unassignable"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:32:17.459Z"),
    "updatedAt": date("2026-07-07T02:32:17.459Z")
  },
  {
    "id": 184,
    "workflowId": 173,
    "requestId": 173,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Concentrix has an invoice for $3,000"
    },
    "output": {
      "route": "billing",
      "reason": "The request refers to an invoice and financial information related to Concentrix, which fits the billing category.",
      "caseType": null,
      "priority": "normal",
      "confidence": 0.95,
      "caseSummary": "Invoice for $3,000 related to Concentrix.",
      "patientContext": {},
      "requiredSkills": [],
      "requiredSpecialties": []
    },
    "reason": "The request refers to an invoice and financial information related to Concentrix, which fits the billing category.",
    "createdAt": date("2026-07-07T02:33:30.560Z"),
    "updatedAt": date("2026-07-07T02:33:30.560Z")
  },
  {
    "id": 185,
    "workflowId": 174,
    "requestId": 174,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "I have Lupus"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request indicates a clinical condition (Lupus), which requires medical evaluation or specialist review.",
      "caseType": "clinical case",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient reports having Lupus, a chronic autoimmune disease.",
      "patientContext": {},
      "requiredSkills": [
        "autoimmune disease management"
      ],
      "requiredSpecialties": [
        "rheumatology"
      ]
    },
    "reason": "The request indicates a clinical condition (Lupus), which requires medical evaluation or specialist review.",
    "createdAt": date("2026-07-07T02:34:11.314Z"),
    "updatedAt": date("2026-07-07T02:34:11.314Z")
  },
  {
    "id": 186,
    "workflowId": 174,
    "requestId": 174,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "I have Lupus",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request indicates a clinical condition (Lupus), which requires medical evaluation or specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient reports having Lupus, a chronic autoimmune disease.",
        "patientContext": {},
        "requiredSkills": [
          "autoimmune disease management"
        ],
        "requiredSpecialties": [
          "rheumatology"
        ]
      }
    },
    "output": {
      "reason": "The provided condition, Lupus, requires specialist skills primarily related to lupus nephritis and kidney pathology.",
      "confidence": 0.9,
      "rankedSkills": [
        {
          "score": 0.95,
          "reason": "Directly relevant clinical skill for lupus, focusing on lupus nephritis, a common and serious manifestation.",
          "skillId": 25,
          "skillCode": "lupus-nephritis"
        },
        {
          "score": 0.85,
          "reason": "Relevant specialty in pathology dealing with kidney disease, important for lupus nephritis evaluation.",
          "skillId": 2,
          "skillCode": "nephropathology"
        },
        {
          "score": 0.75,
          "reason": "Case type commonly required for lupus nephritis diagnosis and monitoring.",
          "skillId": 15,
          "skillCode": "renal-biopsy"
        }
      ]
    },
    "reason": "The provided condition, Lupus, requires specialist skills primarily related to lupus nephritis and kidney pathology.",
    "createdAt": date("2026-07-07T02:34:18.883Z"),
    "updatedAt": date("2026-07-07T02:34:18.883Z")
  },
  {
    "id": 187,
    "workflowId": 174,
    "requestId": 174,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "unassignable",
    "input": {
      "rawRequest": "I have Lupus",
      "rankedSkills": [
        {
          "score": 0.95,
          "reason": "Directly relevant clinical skill for lupus, focusing on lupus nephritis, a common and serious manifestation.",
          "skillId": 25,
          "skillCode": "lupus-nephritis"
        },
        {
          "score": 0.85,
          "reason": "Relevant specialty in pathology dealing with kidney disease, important for lupus nephritis evaluation.",
          "skillId": 2,
          "skillCode": "nephropathology"
        },
        {
          "score": 0.75,
          "reason": "Case type commonly required for lupus nephritis diagnosis and monitoring.",
          "skillId": 15,
          "skillCode": "renal-biopsy"
        }
      ],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request indicates a clinical condition (Lupus), which requires medical evaluation or specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient reports having Lupus, a chronic autoimmune disease.",
        "patientContext": {},
        "requiredSkills": [
          "autoimmune disease management"
        ],
        "requiredSpecialties": [
          "rheumatology"
        ]
      },
      "candidateDoctors": [
        {
          "id": 1,
          "name": "Dr. Emily Chen",
          "skills": [
            "Lupus Nephritis",
            "Glomerulonephritis"
          ],
          "caseTypes": [
            "Renal Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 4,
          "description": "Renal pathologist focused on autoimmune kidney disease and complex biopsy interpretation.",
          "specialties": [
            "Renal Pathology",
            "Nephropathology"
          ]
        },
        {
          "id": 15,
          "name": "Dr. Claire Thompson",
          "skills": [
            "Transplant Pathology"
          ],
          "caseTypes": [
            "Renal Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 5,
          "description": "Renal and transplant pathologist with strong biopsy interpretation experience.",
          "specialties": [
            "Renal Pathology",
            "Nephropathology"
          ]
        }
      ]
    },
    "output": {
      "confidence": 0,
      "unassignable": true,
      "assignmentReason": "No candidate with the required specialty of rheumatology and skills in autoimmune disease management is available.",
      "rankedCandidates": [
        {
          "score": 0.3,
          "reason": "Good relevant skills in Lupus Nephritis and nephropathology but lacks the required specialty of rheumatology.",
          "doctorId": 1
        },
        {
          "score": 0.1,
          "reason": "Has relevant specialties in renal pathology and nephropathology but lacks lupus-related skills and rheumatology specialty.",
          "doctorId": 15
        }
      ],
      "selectedDoctorId": null,
      "unassignableReason": "No candidate matches the required specialty and skills for lupus (rheumatology and autoimmune disease management)."
    },
    "reason": "No candidate with the required specialty of rheumatology and skills in autoimmune disease management is available.",
    "createdAt": date("2026-07-07T02:34:22.160Z"),
    "updatedAt": date("2026-07-07T02:34:22.160Z")
  },
  {
    "id": 188,
    "workflowId": 174,
    "requestId": 174,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "unassignable",
    "input": {
      "selectedDoctorId": null,
      "doctorRankingTaskId": 187
    },
    "output": {
      "assignedDoctorId": null,
      "assignmentReason": null,
      "rankingConfidence": 0,
      "assignedDoctorName": null,
      "unassignableReason": "No candidate matches the required specialty and skills for lupus (rheumatology and autoimmune disease management)."
    },
    "reason": "No candidate matches the required specialty and skills for lupus (rheumatology and autoimmune disease management).",
    "createdAt": date("2026-07-07T02:34:22.177Z"),
    "updatedAt": date("2026-07-07T02:34:22.177Z")
  },
  {
    "id": 189,
    "workflowId": 174,
    "requestId": 174,
    "taskType": "unknown_human_review",
    "sequence": 5,
    "status": "required",
    "input": {
      "failedTaskId": 188,
      "failedTaskType": "doctor_assignment",
      "doctorAssignmentStatus": "unassignable"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "No candidate matches the required specialty and skills for lupus (rheumatology and autoimmune disease management)."
    },
    "reason": "No candidate matches the required specialty and skills for lupus (rheumatology and autoimmune disease management).",
    "createdAt": date("2026-07-07T02:34:22.178Z"),
    "updatedAt": date("2026-07-07T02:34:22.178Z")
  },
  {
    "id": 190,
    "workflowId": 175,
    "requestId": 175,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "I have a broken bone"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical condition (broken bone), which requires medical evaluation and treatment by a doctor.",
      "caseType": "clinical case",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient reports having a broken bone.",
      "patientContext": {},
      "requiredSkills": [
        "fracture diagnosis",
        "fracture treatment"
      ],
      "requiredSpecialties": [
        "orthopedics"
      ]
    },
    "reason": "The request describes a clinical condition (broken bone), which requires medical evaluation and treatment by a doctor.",
    "createdAt": date("2026-07-07T02:34:41.599Z"),
    "updatedAt": date("2026-07-07T02:34:41.599Z")
  },
  {
    "id": 191,
    "workflowId": 175,
    "requestId": 175,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "I have a broken bone",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical condition (broken bone), which requires medical evaluation and treatment by a doctor.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient reports having a broken bone.",
        "patientContext": {},
        "requiredSkills": [
          "fracture diagnosis",
          "fracture treatment"
        ],
        "requiredSpecialties": [
          "orthopedics"
        ]
      }
    },
    "output": {
      "reason": "No canonical skills related to orthopedics, fracture diagnosis, or fracture treatment are present in availableSkills list.",
      "confidence": 0.9,
      "rankedSkills": []
    },
    "reason": "No canonical skills related to orthopedics, fracture diagnosis, or fracture treatment are present in availableSkills list.",
    "createdAt": date("2026-07-07T02:34:42.897Z"),
    "updatedAt": date("2026-07-07T02:34:42.897Z")
  },
  {
    "id": 192,
    "workflowId": 175,
    "requestId": 175,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "unassignable",
    "input": {
      "rawRequest": "I have a broken bone",
      "rankedSkills": [],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical condition (broken bone), which requires medical evaluation and treatment by a doctor.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient reports having a broken bone.",
        "patientContext": {},
        "requiredSkills": [
          "fracture diagnosis",
          "fracture treatment"
        ],
        "requiredSpecialties": [
          "orthopedics"
        ]
      },
      "candidateDoctors": []
    },
    "output": {
      "confidence": 1,
      "unassignable": true,
      "assignmentReason": "",
      "rankedCandidates": [],
      "selectedDoctorId": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:34:42.910Z"),
    "updatedAt": date("2026-07-07T02:34:42.910Z")
  },
  {
    "id": 193,
    "workflowId": 175,
    "requestId": 175,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "unassignable",
    "input": {
      "selectedDoctorId": null,
      "doctorRankingTaskId": 192
    },
    "output": {
      "assignedDoctorId": null,
      "assignmentReason": null,
      "rankingConfidence": 1,
      "assignedDoctorName": null,
      "unassignableReason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:34:42.912Z"),
    "updatedAt": date("2026-07-07T02:34:42.912Z")
  },
  {
    "id": 194,
    "workflowId": 175,
    "requestId": 175,
    "taskType": "unknown_human_review",
    "sequence": 5,
    "status": "required",
    "input": {
      "failedTaskId": 193,
      "failedTaskType": "doctor_assignment",
      "doctorAssignmentStatus": "unassignable"
    },
    "output": {
      "route": "unknown_human_review",
      "reason": "No canonical skills were relevant to the request."
    },
    "reason": "No canonical skills were relevant to the request.",
    "createdAt": date("2026-07-07T02:34:42.913Z"),
    "updatedAt": date("2026-07-07T02:34:42.913Z")
  },
  {
    "id": 195,
    "workflowId": 176,
    "requestId": 176,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "I have excema"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The mention of eczema indicates a clinical condition requiring specialist review.",
      "caseType": "clinical case",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient reports having eczema, indicating a dermatological condition requiring medical assessment.",
      "patientContext": {},
      "requiredSkills": [
        "Clinical evaluation",
        "Dermatology expertise"
      ],
      "requiredSpecialties": [
        "Dermatology"
      ]
    },
    "reason": "The mention of eczema indicates a clinical condition requiring specialist review.",
    "createdAt": date("2026-07-07T02:35:16.853Z"),
    "updatedAt": date("2026-07-07T02:35:16.853Z")
  },
  {
    "id": 196,
    "workflowId": 176,
    "requestId": 176,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "I have excema",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The mention of eczema indicates a clinical condition requiring specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient reports having eczema, indicating a dermatological condition requiring medical assessment.",
        "patientContext": {},
        "requiredSkills": [
          "Clinical evaluation",
          "Dermatology expertise"
        ],
        "requiredSpecialties": [
          "Dermatology"
        ]
      }
    },
    "output": {
      "reason": "High confidence in dermatology-related skills for case involving eczema.",
      "confidence": 0.9,
      "rankedSkills": [
        {
          "score": 0.95,
          "reason": "Dermatopathology specialty directly relates to the diagnosis and evaluation of skin conditions such as eczema.",
          "skillId": 5,
          "skillCode": "dermatopathology"
        },
        {
          "score": 0.85,
          "reason": "Skin biopsy is a relevant case type for clinical evaluation and diagnosis of eczema.",
          "skillId": 21,
          "skillCode": "skin-biopsy"
        },
        {
          "score": 0.4,
          "reason": "Cutaneous lymphoma is a clinical skill related to skin conditions, included as a broader skin pathology skill.",
          "skillId": 31,
          "skillCode": "cutaneous-lymphoma"
        },
        {
          "score": 0.3,
          "reason": "Biopsy review is a general case type relevant to clinical evaluation in dermatology.",
          "skillId": 16,
          "skillCode": "biopsy-review"
        }
      ]
    },
    "reason": "High confidence in dermatology-related skills for case involving eczema.",
    "createdAt": date("2026-07-07T02:35:24.418Z"),
    "updatedAt": date("2026-07-07T02:35:24.418Z")
  },
  {
    "id": 197,
    "workflowId": 176,
    "requestId": 176,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "completed",
    "input": {
      "rawRequest": "I have excema",
      "rankedSkills": [
        {
          "score": 0.95,
          "reason": "Dermatopathology specialty directly relates to the diagnosis and evaluation of skin conditions such as eczema.",
          "skillId": 5,
          "skillCode": "dermatopathology"
        },
        {
          "score": 0.85,
          "reason": "Skin biopsy is a relevant case type for clinical evaluation and diagnosis of eczema.",
          "skillId": 21,
          "skillCode": "skin-biopsy"
        },
        {
          "score": 0.4,
          "reason": "Cutaneous lymphoma is a clinical skill related to skin conditions, included as a broader skin pathology skill.",
          "skillId": 31,
          "skillCode": "cutaneous-lymphoma"
        },
        {
          "score": 0.3,
          "reason": "Biopsy review is a general case type relevant to clinical evaluation in dermatology.",
          "skillId": 16,
          "skillCode": "biopsy-review"
        }
      ],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The mention of eczema indicates a clinical condition requiring specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient reports having eczema, indicating a dermatological condition requiring medical assessment.",
        "patientContext": {},
        "requiredSkills": [
          "Clinical evaluation",
          "Dermatology expertise"
        ],
        "requiredSpecialties": [
          "Dermatology"
        ]
      },
      "candidateDoctors": [
        {
          "id": 17,
          "name": "Dr. Priya Jackson",
          "skills": [
            "Cutaneous Lymphoma",
            "Melanocytic Lesions",
            "Lymphoma Classification"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 4,
          "description": "Dermatopathologist with cutaneous lymphoma and melanocytic lesion expertise.",
          "specialties": [
            "Dermatopathology"
          ]
        },
        {
          "id": 5,
          "name": "Dr. Daniel Kim",
          "skills": [
            "Melanocytic Lesions",
            "Immunohistochemistry"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 3,
          "description": "Dermatopathologist focused on melanocytic lesions and complex inflammatory skin disease.",
          "specialties": [
            "Dermatopathology"
          ]
        },
        {
          "id": 28,
          "name": "Dr. Adrian Scott",
          "skills": [
            "Melanocytic Lesions",
            "NGS Interpretation"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 5,
          "description": "Dermatopathologist and molecular pathology consultant for difficult skin tumors.",
          "specialties": [
            "Dermatopathology",
            "Molecular Pathology"
          ]
        },
        {
          "id": 2,
          "name": "Dr. Ravi Patel",
          "skills": [
            "GI Pathology"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 2,
          "description": "General surgical pathologist with broad biopsy review experience and GI pathology coverage.",
          "specialties": [
            "General Surgical Pathology"
          ]
        },
        {
          "id": 25,
          "name": "Dr. Fatima Allen",
          "skills": [
            "Pediatric Solid Tumors",
            "Infectious Disease Pathology"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 2,
          "description": "Pediatric and infectious disease pathologist handling unusual biopsy consults.",
          "specialties": [
            "Pediatric Pathology"
          ]
        },
        {
          "id": 4,
          "name": "Dr. Aisha Williams",
          "skills": [
            "GI Pathology",
            "Inflammatory Bowel Disease",
            "Colon Dysplasia"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 5,
          "description": "GI pathologist specializing in inflammatory bowel disease and dysplasia surveillance.",
          "specialties": [
            "Gastrointestinal Pathology"
          ]
        },
        {
          "id": 24,
          "name": "Dr. Benjamin Young",
          "skills": [
            "Prostate Grading"
          ],
          "caseTypes": [
            "Biopsy Review",
            "Needle Core Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 7,
          "description": "Genitourinary pathologist with prostate biopsy and resection review focus.",
          "specialties": [
            "Genitourinary Pathology"
          ]
        },
        {
          "id": 26,
          "name": "Dr. Thomas King",
          "skills": [
            "Immunohistochemistry"
          ],
          "caseTypes": [
            "Biopsy Review",
            "Resection Review"
          ],
          "ptoStatus": false,
          "currentLoad": 8,
          "description": "General surgical pathologist with broad resection, biopsy, and IHC experience.",
          "specialties": [
            "General Surgical Pathology"
          ]
        }
      ]
    },
    "output": {
      "confidence": 0.9,
      "unassignable": false,
      "assignmentReason": "Dr. Daniel Kim has the relevant Dermatopathology specialty and expertise in melanocytic lesions and inflammatory skin disease, which closely fits the eczema clinical evaluation requirement. He has a low workload compared to similarly skilled candidates.",
      "rankedCandidates": [
        {
          "score": 0.95,
          "reason": "Relevant Dermatopathology specialty and clinical fit for eczema with lowest workload among top dermatopathologists.",
          "doctorId": 5
        },
        {
          "score": 0.9,
          "reason": "Strong Dermatopathology specialty and relevant skill in cutaneous lymphoma but slightly higher workload.",
          "doctorId": 17
        },
        {
          "score": 0.85,
          "reason": "Has Dermatopathology and molecular pathology specialties, suitable for difficult skin tumors, higher workload.",
          "doctorId": 28
        },
        {
          "score": 0.3,
          "reason": "General surgical pathology specialty with biopsy review; less suitable than Dermatopathologists.",
          "doctorId": 2
        },
        {
          "score": 0.28,
          "reason": "Pediatric pathology specialty and biopsy review not the best fit for adult eczema case.",
          "doctorId": 25
        },
        {
          "score": 0.25,
          "reason": "Gastrointestinal pathology and biopsy review, lower relevance to eczema.",
          "doctorId": 4
        },
        {
          "score": 0.2,
          "reason": "Genitourinary pathology and biopsy review, irrelevant specialty for eczema.",
          "doctorId": 24
        },
        {
          "score": 0.15,
          "reason": "General surgical pathology with immunohistochemistry, but less relevant specialty for eczema.",
          "doctorId": 26
        }
      ],
      "selectedDoctorId": 5,
      "unassignableReason": null
    },
    "reason": "Dr. Daniel Kim has the relevant Dermatopathology specialty and expertise in melanocytic lesions and inflammatory skin disease, which closely fits the eczema clinical evaluation requirement. He has a low workload compared to similarly skilled candidates.",
    "createdAt": date("2026-07-07T02:35:29.949Z"),
    "updatedAt": date("2026-07-07T02:35:29.949Z")
  },
  {
    "id": 198,
    "workflowId": 176,
    "requestId": 176,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "completed",
    "input": {
      "selectedDoctorId": 5,
      "doctorRankingTaskId": 197
    },
    "output": {
      "assignedDoctorId": 5,
      "assignmentReason": "Dr. Daniel Kim has the relevant Dermatopathology specialty and expertise in melanocytic lesions and inflammatory skin disease, which closely fits the eczema clinical evaluation requirement. He has a low workload compared to similarly skilled candidates.",
      "rankingConfidence": 0.9,
      "assignedDoctorName": "Dr. Daniel Kim",
      "unassignableReason": null
    },
    "reason": "Dr. Daniel Kim has the relevant Dermatopathology specialty and expertise in melanocytic lesions and inflammatory skin disease, which closely fits the eczema clinical evaluation requirement. He has a low workload compared to similarly skilled candidates.",
    "createdAt": date("2026-07-07T02:35:29.965Z"),
    "updatedAt": date("2026-07-07T02:35:29.965Z")
  },
  {
    "id": 199,
    "workflowId": 177,
    "requestId": 177,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Exema all over the place"
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case involving widespread eczema, which requires medical evaluation and potentially specialist review.",
      "caseType": "clinical case",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient presents with eczema all over the body.",
      "patientContext": {},
      "requiredSkills": [
        "clinical assessment",
        "dermatological diagnosis"
      ],
      "requiredSpecialties": [
        "dermatology"
      ]
    },
    "reason": "The request describes a clinical case involving widespread eczema, which requires medical evaluation and potentially specialist review.",
    "createdAt": date("2026-07-07T02:55:31.249Z"),
    "updatedAt": date("2026-07-07T02:55:31.249Z")
  },
  {
    "id": 200,
    "workflowId": 177,
    "requestId": 177,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Exema all over the place",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving widespread eczema, which requires medical evaluation and potentially specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient presents with eczema all over the body.",
        "patientContext": {},
        "requiredSkills": [
          "clinical assessment",
          "dermatological diagnosis"
        ],
        "requiredSpecialties": [
          "dermatology"
        ]
      }
    },
    "output": {
      "reason": "The request clearly describes a clinical case involving widespread eczema with required specialty of dermatology. Dermatopathology and skin biopsy are the most relevant skills from the available list.",
      "confidence": 0.9,
      "rankedSkills": [
        {
          "score": 0.95,
          "reason": "Specialty directly related to dermatology required for eczema diagnosis.",
          "skillId": 5,
          "skillCode": "dermatopathology"
        },
        {
          "score": 0.9,
          "reason": "Case type relevant for clinical evaluation and diagnosis of skin lesions such as eczema.",
          "skillId": 21,
          "skillCode": "skin-biopsy"
        }
      ]
    },
    "reason": "The request clearly describes a clinical case involving widespread eczema with required specialty of dermatology. Dermatopathology and skin biopsy are the most relevant skills from the available list.",
    "createdAt": date("2026-07-07T02:55:34.594Z"),
    "updatedAt": date("2026-07-07T02:55:34.594Z")
  },
  {
    "id": 201,
    "workflowId": 177,
    "requestId": 177,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "completed",
    "input": {
      "rawRequest": "Exema all over the place",
      "rankedSkills": [
        {
          "score": 0.95,
          "reason": "Specialty directly related to dermatology required for eczema diagnosis.",
          "skillId": 5,
          "skillCode": "dermatopathology"
        },
        {
          "score": 0.9,
          "reason": "Case type relevant for clinical evaluation and diagnosis of skin lesions such as eczema.",
          "skillId": 21,
          "skillCode": "skin-biopsy"
        }
      ],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving widespread eczema, which requires medical evaluation and potentially specialist review.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient presents with eczema all over the body.",
        "patientContext": {},
        "requiredSkills": [
          "clinical assessment",
          "dermatological diagnosis"
        ],
        "requiredSpecialties": [
          "dermatology"
        ]
      },
      "candidateDoctors": [
        {
          "id": 5,
          "name": "Dr. Daniel Kim",
          "skills": [
            "Melanocytic Lesions",
            "Immunohistochemistry"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 3,
          "description": "Dermatopathologist focused on melanocytic lesions and complex inflammatory skin disease.",
          "specialties": [
            "Dermatopathology"
          ]
        },
        {
          "id": 17,
          "name": "Dr. Priya Jackson",
          "skills": [
            "Cutaneous Lymphoma",
            "Melanocytic Lesions",
            "Lymphoma Classification"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 4,
          "description": "Dermatopathologist with cutaneous lymphoma and melanocytic lesion expertise.",
          "specialties": [
            "Dermatopathology"
          ]
        },
        {
          "id": 28,
          "name": "Dr. Adrian Scott",
          "skills": [
            "Melanocytic Lesions",
            "NGS Interpretation"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 5,
          "description": "Dermatopathologist and molecular pathology consultant for difficult skin tumors.",
          "specialties": [
            "Dermatopathology",
            "Molecular Pathology"
          ]
        }
      ]
    },
    "output": {
      "confidence": 0.9,
      "unassignable": false,
      "assignmentReason": "Dr. Daniel Kim is a dermatopathologist with relevant specialties and skills for diagnosing widespread eczema, with the lowest workload among equally specialized candidates.",
      "rankedCandidates": [
        {
          "score": 0.95,
          "reason": "Specialty in dermatopathology and clinical fit for skin biopsy cases related to eczema, lowest current workload.",
          "doctorId": 5
        },
        {
          "score": 0.9,
          "reason": "Dermatopathologist with relevant specialty but higher current workload than Dr. Daniel Kim.",
          "doctorId": 17
        },
        {
          "score": 0.85,
          "reason": "Dermatopathologist and molecular pathologist suitable for skin biopsy but highest current workload.",
          "doctorId": 28
        }
      ],
      "selectedDoctorId": 5,
      "unassignableReason": null
    },
    "reason": "Dr. Daniel Kim is a dermatopathologist with relevant specialties and skills for diagnosing widespread eczema, with the lowest workload among equally specialized candidates.",
    "createdAt": date("2026-07-07T02:55:40.940Z"),
    "updatedAt": date("2026-07-07T02:55:40.940Z")
  },
  {
    "id": 202,
    "workflowId": 177,
    "requestId": 177,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "completed",
    "input": {
      "selectedDoctorId": 5,
      "doctorRankingTaskId": 201
    },
    "output": {
      "assignedDoctorId": 5,
      "assignmentReason": "Dr. Daniel Kim is a dermatopathologist with relevant specialties and skills for diagnosing widespread eczema, with the lowest workload among equally specialized candidates.",
      "rankingConfidence": 0.9,
      "assignedDoctorName": "Dr. Daniel Kim",
      "unassignableReason": null
    },
    "reason": "Dr. Daniel Kim is a dermatopathologist with relevant specialties and skills for diagnosing widespread eczema, with the lowest workload among equally specialized candidates.",
    "createdAt": date("2026-07-07T02:55:42.989Z"),
    "updatedAt": date("2026-07-07T02:55:42.989Z")
  },
  {
    "id": 203,
    "workflowId": 178,
    "requestId": 178,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Patient is complaining of exema localized to the left leg. It is itching and spreading away from the extremities."
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case involving eczema symptoms that require medical evaluation.",
      "caseType": "clinical_case",
      "priority": "normal",
      "confidence": 0.95,
      "caseSummary": "Patient presents with eczema localized to the left leg, experiencing itching and spreading symptoms.",
      "patientContext": {},
      "requiredSkills": [
        "clinical evaluation",
        "dermatology treatment"
      ],
      "requiredSpecialties": [
        "dermatology"
      ]
    },
    "reason": "The request describes a clinical case involving eczema symptoms that require medical evaluation.",
    "createdAt": date("2026-07-07T02:57:26.217Z"),
    "updatedAt": date("2026-07-07T02:57:26.217Z")
  },
  {
    "id": 204,
    "workflowId": 178,
    "requestId": 178,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Patient is complaining of exema localized to the left leg. It is itching and spreading away from the extremities.",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving eczema symptoms that require medical evaluation.",
        "caseType": "clinical_case",
        "priority": "normal",
        "confidence": 0.95,
        "caseSummary": "Patient presents with eczema localized to the left leg, experiencing itching and spreading symptoms.",
        "patientContext": {},
        "requiredSkills": [
          "clinical evaluation",
          "dermatology treatment"
        ],
        "requiredSpecialties": [
          "dermatology"
        ]
      }
    },
    "output": {
      "reason": "The patient presents with dermatological symptoms consistent with eczema; dermatopathology and skin biopsy are clinically relevant skills to evaluate and manage the case.",
      "confidence": 0.95,
      "rankedSkills": [
        {
          "score": 0.9,
          "reason": "The case involves eczema, a dermatological condition affecting the skin; dermatopathology is the relevant specialty.",
          "skillId": 5,
          "skillCode": "dermatopathology"
        },
        {
          "score": 0.8,
          "reason": "Skin biopsy is a relevant case type for evaluating eczema lesions.",
          "skillId": 21,
          "skillCode": "skin-biopsy"
        },
        {
          "score": 0.4,
          "reason": "Cutaneous lymphoma is a differential diagnosis for skin lesions; included as a relevant clinical skill.",
          "skillId": 31,
          "skillCode": "cutaneous-lymphoma"
        }
      ]
    },
    "reason": "The patient presents with dermatological symptoms consistent with eczema; dermatopathology and skin biopsy are clinically relevant skills to evaluate and manage the case.",
    "createdAt": date("2026-07-07T02:57:30.098Z"),
    "updatedAt": date("2026-07-07T02:57:30.098Z")
  },
  {
    "id": 205,
    "workflowId": 178,
    "requestId": 178,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "completed",
    "input": {
      "rawRequest": "Patient is complaining of exema localized to the left leg. It is itching and spreading away from the extremities.",
      "rankedSkills": [
        {
          "score": 0.9,
          "reason": "The case involves eczema, a dermatological condition affecting the skin; dermatopathology is the relevant specialty.",
          "skillId": 5,
          "skillCode": "dermatopathology"
        },
        {
          "score": 0.8,
          "reason": "Skin biopsy is a relevant case type for evaluating eczema lesions.",
          "skillId": 21,
          "skillCode": "skin-biopsy"
        },
        {
          "score": 0.4,
          "reason": "Cutaneous lymphoma is a differential diagnosis for skin lesions; included as a relevant clinical skill.",
          "skillId": 31,
          "skillCode": "cutaneous-lymphoma"
        }
      ],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case involving eczema symptoms that require medical evaluation.",
        "caseType": "clinical_case",
        "priority": "normal",
        "confidence": 0.95,
        "caseSummary": "Patient presents with eczema localized to the left leg, experiencing itching and spreading symptoms.",
        "patientContext": {},
        "requiredSkills": [
          "clinical evaluation",
          "dermatology treatment"
        ],
        "requiredSpecialties": [
          "dermatology"
        ]
      },
      "candidateDoctors": [
        {
          "id": 17,
          "name": "Dr. Priya Jackson",
          "skills": [
            "Cutaneous Lymphoma",
            "Melanocytic Lesions",
            "Lymphoma Classification"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 4,
          "description": "Dermatopathologist with cutaneous lymphoma and melanocytic lesion expertise.",
          "specialties": [
            "Dermatopathology"
          ]
        },
        {
          "id": 5,
          "name": "Dr. Daniel Kim",
          "skills": [
            "Melanocytic Lesions",
            "Immunohistochemistry"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 3,
          "description": "Dermatopathologist focused on melanocytic lesions and complex inflammatory skin disease.",
          "specialties": [
            "Dermatopathology"
          ]
        },
        {
          "id": 28,
          "name": "Dr. Adrian Scott",
          "skills": [
            "Melanocytic Lesions",
            "NGS Interpretation"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 5,
          "description": "Dermatopathologist and molecular pathology consultant for difficult skin tumors.",
          "specialties": [
            "Dermatopathology",
            "Molecular Pathology"
          ]
        }
      ]
    },
    "output": {
      "confidence": 0.95,
      "unassignable": false,
      "assignmentReason": "Dr. Daniel Kim has the relevant specialty of Dermatopathology, is skilled in inflammatory skin diseases which are related to eczema, and has the lowest current workload among suitable candidates.",
      "rankedCandidates": [
        {
          "score": 0.95,
          "reason": "Dermatopathologist with skills in melanocytic lesions and complex inflammatory skin disease, relevant for eczema, and has the lowest workload.",
          "doctorId": 5
        },
        {
          "score": 0.9,
          "reason": "Dermatopathologist specializing in cutaneous lymphoma and melanocytic lesions, relevant skills but higher workload than Dr. Kim.",
          "doctorId": 17
        },
        {
          "score": 0.85,
          "reason": "Dermatopathologist and molecular pathology expert with relevant specialties, but highest workload among candidates.",
          "doctorId": 28
        }
      ],
      "selectedDoctorId": 5,
      "unassignableReason": null
    },
    "reason": "Dr. Daniel Kim has the relevant specialty of Dermatopathology, is skilled in inflammatory skin diseases which are related to eczema, and has the lowest current workload among suitable candidates.",
    "createdAt": date("2026-07-07T02:57:34.604Z"),
    "updatedAt": date("2026-07-07T02:57:34.604Z")
  },
  {
    "id": 206,
    "workflowId": 178,
    "requestId": 178,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "completed",
    "input": {
      "selectedDoctorId": 5,
      "doctorRankingTaskId": 205
    },
    "output": {
      "assignedDoctorId": 5,
      "assignmentReason": "Dr. Daniel Kim has the relevant specialty of Dermatopathology, is skilled in inflammatory skin diseases which are related to eczema, and has the lowest current workload among suitable candidates.",
      "rankingConfidence": 0.95,
      "assignedDoctorName": "Dr. Daniel Kim",
      "unassignableReason": null
    },
    "reason": "Dr. Daniel Kim has the relevant specialty of Dermatopathology, is skilled in inflammatory skin diseases which are related to eczema, and has the lowest current workload among suitable candidates.",
    "createdAt": date("2026-07-07T02:57:35.833Z"),
    "updatedAt": date("2026-07-07T02:57:35.833Z")
  },
  {
    "id": 207,
    "workflowId": 178,
    "requestId": 178,
    "taskType": "workflow_action",
    "sequence": 5,
    "status": "completed",
    "input": {
      "message": "Reassign to doctor Adrian."
    },
    "output": {
      "action": "reassign_doctor",
      "reason": "User explicitly requested reassignment to doctor Adrian.",
      "confidence": 1,
      "requestedAssigneeName": "Adrian"
    },
    "reason": "User explicitly requested reassignment to doctor Adrian.",
    "createdAt": date("2026-07-07T21:36:48.411Z"),
    "updatedAt": date("2026-07-07T21:36:48.411Z")
  },
  {
    "id": 208,
    "workflowId": 178,
    "requestId": 178,
    "taskType": "doctor_reassignment",
    "sequence": 6,
    "status": "completed",
    "input": {
      "message": "Reassign to doctor Adrian.",
      "actionTaskId": 207,
      "candidateDoctors": [
        {
          "id": 28,
          "name": "Dr. Adrian Scott",
          "skills": [
            "Melanocytic Lesions",
            "NGS Interpretation"
          ],
          "caseTypes": [
            "Skin Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 5,
          "description": "Dermatopathologist and molecular pathology consultant for difficult skin tumors.",
          "specialties": [
            "Dermatopathology",
            "Molecular Pathology"
          ]
        }
      ],
      "previousDoctorId": 5,
      "previousDoctorName": "Dr. Daniel Kim",
      "requestedDoctorName": "Adrian",
      "previousAssignmentTaskId": 206
    },
    "output": {
      "confidence": 0.95,
      "assignedDoctorId": 28,
      "assignmentReason": "Requested doctor Adrian matches candidate Dr. Adrian Scott who has relevant specialties and is available for assignment.",
      "assignedDoctorName": "Dr. Adrian Scott"
    },
    "reason": "Requested doctor Adrian matches candidate Dr. Adrian Scott who has relevant specialties and is available for assignment.",
    "createdAt": date("2026-07-07T21:36:48.416Z"),
    "updatedAt": date("2026-07-07T21:36:48.416Z")
  },
  {
    "id": 209,
    "workflowId": 179,
    "requestId": 179,
    "taskType": "routing_decision",
    "sequence": 1,
    "status": "completed",
    "input": {
      "rawRequest": "Jane Doe has dysentery."
    },
    "output": {
      "route": "doctor_assignment",
      "reason": "The request describes a clinical case (diagnosis of dysentery) which requires a doctor's review or intervention.",
      "caseType": "clinical case",
      "priority": "normal",
      "confidence": 0.9,
      "caseSummary": "Patient Jane Doe diagnosed with dysentery.",
      "patientContext": {
        "condition": "dysentery",
        "patientName": "Jane Doe"
      },
      "requiredSkills": [
        "diagnosis",
        "treatment planning"
      ],
      "requiredSpecialties": [
        "Infectious Disease",
        "Gastroenterology"
      ]
    },
    "reason": "The request describes a clinical case (diagnosis of dysentery) which requires a doctor's review or intervention.",
    "createdAt": date("2026-07-07T21:37:29.783Z"),
    "updatedAt": date("2026-07-07T21:37:29.783Z")
  },
  {
    "id": 210,
    "workflowId": 179,
    "requestId": 179,
    "taskType": "skills_ranking",
    "sequence": 2,
    "status": "completed",
    "input": {
      "rawRequest": "Jane Doe has dysentery.",
      "availableSkills": availableSkills,
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case (diagnosis of dysentery) which requires a doctor's review or intervention.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient Jane Doe diagnosed with dysentery.",
        "patientContext": {
          "condition": "dysentery",
          "patientName": "Jane Doe"
        },
        "requiredSkills": [
          "diagnosis",
          "treatment planning"
        ],
        "requiredSpecialties": [
          "Infectious Disease",
          "Gastroenterology"
        ]
      }
    },
    "output": {
      "reason": "Skills selected are prioritized based on Infectious Disease and Gastroenterology specialties relevant to dysentery clinical case.",
      "confidence": 0.9,
      "rankedSkills": [
        {
          "score": 1,
          "reason": "Directly relevant to the required specialty Infectious Disease and clinical case dysentery.",
          "skillId": 45,
          "skillCode": "infectious-disease-pathology"
        },
        {
          "score": 0.9,
          "reason": "Matches the required Gastroenterology specialty pertinent to dysentery affecting the gastrointestinal tract.",
          "skillId": 4,
          "skillCode": "gastrointestinal-pathology"
        },
        {
          "score": 0.85,
          "reason": "Clinical skill focused on gastrointestinal pathology, relevant to dysentery diagnosis and treatment.",
          "skillId": 27,
          "skillCode": "gi-pathology"
        },
        {
          "score": 0.6,
          "reason": "Relevant case type for clinical diagnosis and treatment planning.",
          "skillId": 16,
          "skillCode": "biopsy-review"
        }
      ]
    },
    "reason": "Skills selected are prioritized based on Infectious Disease and Gastroenterology specialties relevant to dysentery clinical case.",
    "createdAt": date("2026-07-07T21:37:35.699Z"),
    "updatedAt": date("2026-07-07T21:37:35.699Z")
  },
  {
    "id": 211,
    "workflowId": 179,
    "requestId": 179,
    "taskType": "doctor_ranking",
    "sequence": 3,
    "status": "completed",
    "input": {
      "rawRequest": "Jane Doe has dysentery.",
      "rankedSkills": [
        {
          "score": 1,
          "reason": "Directly relevant to the required specialty Infectious Disease and clinical case dysentery.",
          "skillId": 45,
          "skillCode": "infectious-disease-pathology"
        },
        {
          "score": 0.9,
          "reason": "Matches the required Gastroenterology specialty pertinent to dysentery affecting the gastrointestinal tract.",
          "skillId": 4,
          "skillCode": "gastrointestinal-pathology"
        },
        {
          "score": 0.85,
          "reason": "Clinical skill focused on gastrointestinal pathology, relevant to dysentery diagnosis and treatment.",
          "skillId": 27,
          "skillCode": "gi-pathology"
        },
        {
          "score": 0.6,
          "reason": "Relevant case type for clinical diagnosis and treatment planning.",
          "skillId": 16,
          "skillCode": "biopsy-review"
        }
      ],
      "routingDecision": {
        "route": "doctor_assignment",
        "reason": "The request describes a clinical case (diagnosis of dysentery) which requires a doctor's review or intervention.",
        "caseType": "clinical case",
        "priority": "normal",
        "confidence": 0.9,
        "caseSummary": "Patient Jane Doe diagnosed with dysentery.",
        "patientContext": {
          "condition": "dysentery",
          "patientName": "Jane Doe"
        },
        "requiredSkills": [
          "diagnosis",
          "treatment planning"
        ],
        "requiredSpecialties": [
          "Infectious Disease",
          "Gastroenterology"
        ]
      },
      "candidateDoctors": [
        {
          "id": 4,
          "name": "Dr. Aisha Williams",
          "skills": [
            "GI Pathology",
            "Inflammatory Bowel Disease",
            "Colon Dysplasia"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 5,
          "description": "GI pathologist specializing in inflammatory bowel disease and dysplasia surveillance.",
          "specialties": [
            "Gastrointestinal Pathology"
          ]
        },
        {
          "id": 25,
          "name": "Dr. Fatima Allen",
          "skills": [
            "Pediatric Solid Tumors",
            "Infectious Disease Pathology"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 2,
          "description": "Pediatric and infectious disease pathologist handling unusual biopsy consults.",
          "specialties": [
            "Pediatric Pathology"
          ]
        },
        {
          "id": 2,
          "name": "Dr. Ravi Patel",
          "skills": [
            "GI Pathology"
          ],
          "caseTypes": [
            "Biopsy Review"
          ],
          "ptoStatus": false,
          "currentLoad": 2,
          "description": "General surgical pathologist with broad biopsy review experience and GI pathology coverage.",
          "specialties": [
            "General Surgical Pathology"
          ]
        },
        {
          "id": 16,
          "name": "Dr. Jamal Moore",
          "skills": [
            "Infectious Disease Pathology"
          ],
          "caseTypes": [
            "Frozen Section",
            "Resection Review"
          ],
          "ptoStatus": false,
          "currentLoad": 1,
          "description": "General surgical pathologist handling frozen sections, resections, and infectious disease cases.",
          "specialties": [
            "General Surgical Pathology"
          ]
        },
        {
          "id": 24,
          "name": "Dr. Benjamin Young",
          "skills": [
            "Prostate Grading"
          ],
          "caseTypes": [
            "Biopsy Review",
            "Needle Core Biopsy"
          ],
          "ptoStatus": false,
          "currentLoad": 7,
          "description": "Genitourinary pathologist with prostate biopsy and resection review focus.",
          "specialties": [
            "Genitourinary Pathology"
          ]
        },
        {
          "id": 26,
          "name": "Dr. Thomas King",
          "skills": [
            "Immunohistochemistry"
          ],
          "caseTypes": [
            "Biopsy Review",
            "Resection Review"
          ],
          "ptoStatus": false,
          "currentLoad": 8,
          "description": "General surgical pathologist with broad resection, biopsy, and IHC experience.",
          "specialties": [
            "General Surgical Pathology"
          ]
        }
      ]
    },
    "output": {
      "confidence": 0.9,
      "unassignable": false,
      "assignmentReason": "Dr. Jamal Moore has the most relevant specialty and skills (Infectious Disease Pathology) directly addressing the required specialty Infectious Disease for dysentery, with a manageable current workload.",
      "rankedCandidates": [
        {
          "score": 1,
          "reason": "Has Infectious Disease Pathology skills and handles infectious disease cases, directly relevant to dysentery management.",
          "doctorId": 16
        },
        {
          "score": 0.85,
          "reason": "Specialist in Gastrointestinal Pathology, relevant to treating dysentery affecting the GI tract.",
          "doctorId": 4
        },
        {
          "score": 0.7,
          "reason": "Pediatric Pathology with Infectious Disease Pathology skills, somewhat relevant but pediatric focus makes it less ideal.",
          "doctorId": 25
        },
        {
          "score": 0.6,
          "reason": "General Surgical Pathology with GI Pathology skill, a reasonably relevant specialty for biopsy review.",
          "doctorId": 2
        },
        {
          "score": 0.4,
          "reason": "General Surgical Pathology with Immunohistochemistry skill, less specific to infectious or GI pathology.",
          "doctorId": 26
        },
        {
          "score": 0.1,
          "reason": "Genitourinary Pathology and Prostate Grading skill, unrelated to dysentery or infectious disease.",
          "doctorId": 24
        }
      ],
      "selectedDoctorId": 16,
      "unassignableReason": null
    },
    "reason": "Dr. Jamal Moore has the most relevant specialty and skills (Infectious Disease Pathology) directly addressing the required specialty Infectious Disease for dysentery, with a manageable current workload.",
    "createdAt": date("2026-07-07T21:37:41.228Z"),
    "updatedAt": date("2026-07-07T21:37:41.228Z")
  },
  {
    "id": 212,
    "workflowId": 179,
    "requestId": 179,
    "taskType": "doctor_assignment",
    "sequence": 4,
    "status": "completed",
    "input": {
      "selectedDoctorId": 16,
      "doctorRankingTaskId": 211
    },
    "output": {
      "assignedDoctorId": 16,
      "assignmentReason": "Dr. Jamal Moore has the most relevant specialty and skills (Infectious Disease Pathology) directly addressing the required specialty Infectious Disease for dysentery, with a manageable current workload.",
      "rankingConfidence": 0.9,
      "assignedDoctorName": "Dr. Jamal Moore",
      "unassignableReason": null
    },
    "reason": "Dr. Jamal Moore has the most relevant specialty and skills (Infectious Disease Pathology) directly addressing the required specialty Infectious Disease for dysentery, with a manageable current workload.",
    "createdAt": date("2026-07-07T21:37:43.890Z"),
    "updatedAt": date("2026-07-07T21:37:43.890Z")
  },
  {
    "id": 213,
    "workflowId": 179,
    "requestId": 179,
    "taskType": "workflow_action",
    "sequence": 5,
    "status": "unsupported",
    "input": {
      "message": "Unassign."
    },
    "output": {
      "action": "close_assignment",
      "reason": "The instruction 'Unassign' indicates closing or ending the current assignment.",
      "confidence": 1,
      "requestedAssigneeName": null
    },
    "reason": "The instruction 'Unassign' indicates closing or ending the current assignment.",
    "createdAt": date("2026-07-07T21:38:07.032Z"),
    "updatedAt": date("2026-07-07T21:38:07.032Z")
  }
];
