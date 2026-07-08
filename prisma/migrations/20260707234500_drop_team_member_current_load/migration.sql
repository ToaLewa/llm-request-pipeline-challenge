-- current load is derived from Assignment rows instead of persisted on TeamMember.
ALTER TABLE "TeamMember" DROP COLUMN "currentLoad";
