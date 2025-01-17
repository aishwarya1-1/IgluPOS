/*
  Warnings:

  - You are about to drop the `AddonCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Addon` DROP FOREIGN KEY `Addon_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `type` ENUM('IceCream', 'Addon') NOT NULL;

-- DropTable
DROP TABLE `AddonCategory`;

-- AddForeignKey
ALTER TABLE `Addon` ADD CONSTRAINT `Addon_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
