/*
  Warnings:

  - You are about to drop the `Counter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Counter` DROP FOREIGN KEY `Counter_loginId_fkey`;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `status` ENUM('SUCCESS', 'CANCELLED') NOT NULL DEFAULT 'SUCCESS',
    ADD COLUMN `userOrderId` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `Counter`;

-- CreateTable
CREATE TABLE `UserOrderCounter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `counter` INTEGER NOT NULL,
    `KOTCounter` INTEGER NOT NULL,
    `lastUpdated` DATETIME(3) NULL,
    `loginId` INTEGER NOT NULL,

    UNIQUE INDEX `UserOrderCounter_loginId_key`(`loginId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserOrderCounter` ADD CONSTRAINT `UserOrderCounter_loginId_fkey` FOREIGN KEY (`loginId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
