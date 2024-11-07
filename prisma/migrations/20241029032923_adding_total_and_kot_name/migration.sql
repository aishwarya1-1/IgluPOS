/*
  Warnings:

  - Added the required column `KOTName` to the `KOTOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `KOTOrder` ADD COLUMN `KOTName` VARCHAR(255) NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL DEFAULT 0.0;
