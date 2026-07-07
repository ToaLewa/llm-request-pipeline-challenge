-- Rename doctor tables to clinical team member terminology without dropping data.
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_doctorId_fkey";
ALTER TABLE "DoctorSkill" DROP CONSTRAINT "DoctorSkill_doctorId_fkey";
ALTER TABLE "DoctorSkill" DROP CONSTRAINT "DoctorSkill_skillId_fkey";

ALTER TABLE "Doctor" RENAME TO "TeamMember";
ALTER TABLE "DoctorSkill" RENAME TO "TeamMemberSkill";
ALTER TABLE "TeamMemberSkill" RENAME COLUMN "doctorId" TO "teamMemberId";

ALTER TABLE "TeamMemberSkill" RENAME CONSTRAINT "DoctorSkill_pkey" TO "TeamMemberSkill_pkey";
ALTER INDEX "DoctorSkill_skillId_idx" RENAME TO "TeamMemberSkill_skillId_idx";

ALTER TABLE "TeamMemberSkill" ADD CONSTRAINT "TeamMemberSkill_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMemberSkill" ADD CONSTRAINT "TeamMemberSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
