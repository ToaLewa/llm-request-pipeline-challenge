-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "jobTitle" TEXT;

UPDATE "TeamMember"
SET "jobTitle" = 'Pathologist'
WHERE "jobTitle" IS NULL;

ALTER TABLE "TeamMember" ALTER COLUMN "jobTitle" SET NOT NULL;
