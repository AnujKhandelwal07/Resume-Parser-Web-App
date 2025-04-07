/*
  Warnings:

  - Added the required column `howSoonCanYouStart` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "whatShiftsCanYouWork" "Shift"[],
DROP COLUMN "howSoonCanYouStart",
ADD COLUMN     "howSoonCanYouStart" TIMESTAMP(3) NOT NULL;
