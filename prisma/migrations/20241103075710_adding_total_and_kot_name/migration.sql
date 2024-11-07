/*
  Warnings:

  - You are about to drop the column `KOTName` on the `KOTOrder` table. All the data in the column will be lost.
  - You are about to drop the column `KOTnumber` on the `KOTOrder` table. All the data in the column will be lost.
  - Added the required column `kotName` to the `KOTOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kotNumber` to the `KOTOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `KOTOrder` DROP COLUMN `KOTName`,
    DROP COLUMN `KOTnumber`,
    ADD COLUMN `kotName` VARCHAR(255) NOT NULL,
    ADD COLUMN `kotNumber` INTEGER NOT NULL;
