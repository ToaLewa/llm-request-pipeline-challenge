-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "workflowTaskId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_workflowTaskId_key" ON "Assignment"("workflowTaskId");

-- CreateIndex
CREATE INDEX "Assignment_doctorId_idx" ON "Assignment"("doctorId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_workflowTaskId_fkey" FOREIGN KEY ("workflowTaskId") REFERENCES "WorkflowTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
