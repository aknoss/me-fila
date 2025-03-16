/*
  Warnings:

  - You are about to drop the column `hostId` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_hostId_fkey";

-- DropIndex
DROP INDEX "Room_hostId_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "hostId";
