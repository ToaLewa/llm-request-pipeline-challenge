ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_doctorId_fkey";

ALTER TABLE "Assignment" RENAME COLUMN "doctorId" TO "teamMemberId";
ALTER INDEX "Assignment_doctorId_idx" RENAME TO "Assignment_teamMemberId_idx";

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
