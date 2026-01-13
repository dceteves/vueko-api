/*
  Warnings:

  - The `timezone` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "osuId" DROP NOT NULL,
ALTER COLUMN "osuUsername" DROP NOT NULL,
DROP COLUMN "timezone",
ADD COLUMN     "timezone" INTEGER;
