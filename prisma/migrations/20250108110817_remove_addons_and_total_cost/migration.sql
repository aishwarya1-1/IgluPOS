/*
  Warnings:

  - You are about to drop the column `addonsTotal` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `OrderItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `OrderItems` DROP COLUMN `addonsTotal`,
    DROP COLUMN `totalCost`;
