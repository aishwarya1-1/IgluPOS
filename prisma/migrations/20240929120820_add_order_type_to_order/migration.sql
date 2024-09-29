/*
  Warnings:

  - The values [Waffles] on the enum `IceCream_category` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `email` to the `Login` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `IceCream` MODIFY `category` ENUM('IceCream', 'Falooda', 'MilkShakes') NOT NULL DEFAULT 'IceCream';

-- AlterTable
ALTER TABLE `Login` ADD COLUMN `email` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `orderType` ENUM('DineIn', 'TakeAway', 'Delivery') NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
