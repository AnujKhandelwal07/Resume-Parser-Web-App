/*
  Warnings:

  - You are about to drop the column `facilityName` on the `WorkExperience` table. All the data in the column will be lost.
  - You are about to drop the column `typeOfPosition` on the `WorkExperience` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `WorkExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `WorkExperience` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkExperience" DROP COLUMN "facilityName",
DROP COLUMN "typeOfPosition",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL;
