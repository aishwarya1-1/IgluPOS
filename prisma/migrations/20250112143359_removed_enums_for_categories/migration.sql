/*
  Warnings:

  - You are about to drop the column `category` on the `Addon` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `IceCream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Addon` DROP COLUMN `category`,
    ADD COLUMN `categoryId` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `IceCream` DROP COLUMN `category`,
    ADD COLUMN `categoryId` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddonCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AddonCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IceCream` ADD CONSTRAINT `IceCream_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Addon` ADD CONSTRAINT `Addon_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `AddonCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
