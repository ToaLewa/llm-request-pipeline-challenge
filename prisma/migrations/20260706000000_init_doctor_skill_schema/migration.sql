-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('specialty', 'clinical_skill', 'case_type');

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ptoStatus" BOOLEAN NOT NULL DEFAULT false,
    "currentLoad" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "skillCode" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL DEFAULT 'clinical_skill',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorSkill" (
    "doctorId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "DoctorSkill_pkey" PRIMARY KEY ("doctorId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_skillCode_key" ON "Skill"("skillCode");

-- CreateIndex
CREATE INDEX "DoctorSkill_skillId_idx" ON "DoctorSkill"("skillId");

-- AddForeignKey
ALTER TABLE "DoctorSkill" ADD CONSTRAINT "DoctorSkill_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorSkill" ADD CONSTRAINT "DoctorSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
