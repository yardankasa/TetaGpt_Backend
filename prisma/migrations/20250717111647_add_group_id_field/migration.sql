/*
  Warnings:

  - A unique constraint covering the columns `[groupId,authTokenId]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "groupId" TEXT NOT NULL DEFAULT 'none';

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupId_authTokenId_key" ON "Group"("groupId", "authTokenId");
