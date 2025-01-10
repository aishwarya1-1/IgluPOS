/*
  Warnings:

  - The values [Topping,Cone] on the enum `IceCream_category` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `addons` on the `OrderItems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `IceCream` MODIFY `category` ENUM('IceCream', 'Falooda', 'MilkShakes') NOT NULL DEFAULT 'IceCream';

-- AlterTable
ALTER TABLE `OrderItems` DROP COLUMN `addons`;

-- CreateTable
CREATE TABLE `Addon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `category` ENUM('Topping', 'Cone') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItemAddon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `priceAtTime` DOUBLE NOT NULL,
    `orderId` INTEGER NOT NULL,
    `addonId` INTEGER NOT NULL,

    UNIQUE INDEX `OrderItemAddon_orderId_addonId_key`(`orderId`, `addonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItemAddon` ADD CONSTRAINT `OrderItemAddon_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `OrderItems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemAddon` ADD CONSTRAINT `OrderItemAddon_addonId_fkey` FOREIGN KEY (`addonId`) REFERENCES `Addon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
