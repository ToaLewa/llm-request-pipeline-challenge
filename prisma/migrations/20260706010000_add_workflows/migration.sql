-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRequest" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT,
    "rawRequest" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTask" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "requestId" TEXT,
    "taskType" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "input" JSONB,
    "output" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workflow_status_idx" ON "Workflow"("status");

-- CreateIndex
CREATE INDEX "WorkflowRequest_workflowId_idx" ON "WorkflowRequest"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTask_workflowId_sequence_key" ON "WorkflowTask"("workflowId", "sequence");

-- CreateIndex
CREATE INDEX "WorkflowTask_workflowId_idx" ON "WorkflowTask"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowTask_requestId_idx" ON "WorkflowTask"("requestId");

-- CreateIndex
CREATE INDEX "WorkflowTask_taskType_idx" ON "WorkflowTask"("taskType");

-- AddForeignKey
ALTER TABLE "WorkflowRequest" ADD CONSTRAINT "WorkflowRequest_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "WorkflowRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
