/*
  Warnings:

  - Added the required column `loginId` to the `Addon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loginId` to the `IceCream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Addon` ADD COLUMN `loginId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `IceCream` ADD COLUMN `loginId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Login` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `gstNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(20) NOT NULL,
    `loginId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IceCream` ADD CONSTRAINT `IceCream_loginId_fkey` FOREIGN KEY (`loginId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_loginId_fkey` FOREIGN KEY (`loginId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Addon` ADD CONSTRAINT `Addon_loginId_fkey` FOREIGN KEY (`loginId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
