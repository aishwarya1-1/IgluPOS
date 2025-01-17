/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Addon` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Category` table. All the data in the column will be lost.
  - Added the required column `category` to the `Addon` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Addon` DROP FOREIGN KEY `Addon_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Addon` DROP COLUMN `categoryId`,
    ADD COLUMN `category` ENUM('Topping', 'Cone') NOT NULL;

-- AlterTable
ALTER TABLE `Category` DROP COLUMN `type`;
