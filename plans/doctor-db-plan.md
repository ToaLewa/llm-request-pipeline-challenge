# Doctor Database Plan

## Goal

Create the database foundation for doctor assignment using a normalized doctor-to-skill model.

Do not store doctor skills, specialties, or case types as string arrays on the doctor row. These concepts need to evolve independently and support many-to-many matching.

## Core Decision

Skills should be their own table.

Doctors and skills have a many-to-many relationship:

- One doctor can have many skills.
- One skill can belong to many doctors.
- The relationship is represented by a `DoctorSkill` join table.

## Proposed Tables

### Doctor

Stores doctor-level assignment metadata.

Fields:

```ts
{
  id: string;
  name: string;
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

Notes:

- `ptoStatus` controls whether the doctor can be automatically assigned.
- `currentLoad` is used as a tie-breaker after expertise match.
- `active` allows doctors to be excluded without deleting historical data.

### Skill

Stores normalized searchable capabilities.

Fields:

```ts
{
  id: string;
  name: string;
  skillCode: string;
  category: "specialty" | "clinical_skill" | "case_type";
  createdAt: Date;
  updatedAt: Date;
}
```

Notes:

- `name` is the display value, such as `Renal Pathology`.
- `skillCode` is the stable matching value, such as `renal-pathology`.
- `category` lets the app preserve the distinction between specialties, skills, and case types without modeling each as a separate string array.
- `skillCode` should be unique.

### DoctorSkill

Join table between doctors and skills.

Fields:

```ts
{
  doctorId: string;
  skillId: string;
}
```

Constraints:

- Composite primary key on `(doctorId, skillId)`.
- Foreign key from `doctorId` to `Doctor.id`.
- Foreign key from `skillId` to `Skill.id`.
- Index on `skillId` for candidate search.

Notes:

- This table prevents duplicate doctor-skill assignments.
- Deleting a doctor should delete related `DoctorSkill` rows.
- Deleting a skill should delete related `DoctorSkill` rows only if the product allows skill deletion. Otherwise, prefer soft-deactivation later.

## Prisma Shape

```prisma
model Doctor {
  id          String        @id @default(cuid())
  name        String
  description String
  ptoStatus   Boolean       @default(false)
  currentLoad Int           @default(0)
  active      Boolean       @default(true)

  skills      DoctorSkill[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Skill {
  id        String        @id @default(cuid())
  name      String
  skillCode String        @unique
  category  SkillCategory @default(clinical_skill)

  doctors   DoctorSkill[]

  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model DoctorSkill {
  doctorId String
  skillId  String

  doctor   Doctor @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  skill    Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@id([doctorId, skillId])
  @@index([skillId])
}

enum SkillCategory {
  specialty
  clinical_skill
  case_type
}
```

## Candidate Search

The routing stage returns `requiredSpecialties`, `requiredSkills`, and `caseType` as strings from the LLM.

Before querying doctors:

1. Normalize those strings into skill codes.
2. Search `Skill.skillCode` values for matches.
3. Query active, available doctors connected to matching skills through `DoctorSkill`.
4. Sort by workload after filtering by skill overlap.

Example query shape:

```ts
const candidates = await prisma.doctor.findMany({
  where: {
    active: true,
    ptoStatus: false,
    skills: {
      some: {
        skill: {
          skillCode: {
            in: requiredSkillCodes,
          },
        },
      },
    },
  },
  include: {
    skills: {
      include: {
        skill: true,
      },
    },
  },
  orderBy: [{ currentLoad: 'asc' }],
  take: 8,
});
```

## Ranking Payload Shape

The LLM ranking payload can still receive grouped values for readability, but those values should be derived from normalized skill rows.

Example candidate doctor payload:

```json
{
  "id": "doc_chen",
  "name": "Dr. Emily Chen",
  "specialties": ["renal pathology", "nephropathology"],
  "skills": ["renal biopsy", "lupus nephritis", "glomerulonephritis"],
  "caseTypes": ["renal biopsy"],
  "description": "Renal pathologist focused on autoimmune kidney disease and complex biopsy interpretation.",
  "ptoStatus": false,
  "currentLoad": 4
}
```

Implementation detail:

- `specialties` comes from skills where `category = specialty`.
- `skills` comes from skills where `category = clinical_skill`.
- `caseTypes` comes from skills where `category = case_type`.

## Seed Data

Initial seed data should include a small but meaningful clinical team.

Example skills:

- `renal-pathology`, category `specialty`
- `nephropathology`, category `specialty`
- `general-surgical-pathology`, category `specialty`
- `renal-biopsy`, category `case_type`
- `biopsy-review`, category `case_type`
- `lupus-nephritis`, category `clinical_skill`
- `glomerulonephritis`, category `clinical_skill`
- `gi-pathology`, category `clinical_skill`

Example doctors:

- Dr. Emily Chen: renal pathology, nephropathology, renal biopsy, lupus nephritis, glomerulonephritis
- Dr. Ravi Patel: general surgical pathology, biopsy review, GI pathology
- Dr. Maria Gomez: renal pathology, renal biopsy, glomerulonephritis, on PTO for exclusion testing

## Implementation Order

1. Add Prisma and Postgres dependencies/configuration.
2. Add Postgres to Docker Compose.
3. Create the Prisma schema with `Doctor`, `Skill`, and `DoctorSkill`.
4. Generate and apply the initial migration.
5. Add seed data for doctors and skills.
6. Add a database client module.
7. Add candidate doctor retrieval that queries through `DoctorSkill`.
8. Add tests for candidate retrieval and PTO/active filtering.

## Future Evolution

The normalized model leaves room for later additions without changing doctor rows:

- Skill aliases for LLM wording variations.
- Skill confidence or proficiency level per doctor.
- Skill deactivation instead of deletion.
- Department or organization-level grouping.
- Audit history for doctor skill changes.
