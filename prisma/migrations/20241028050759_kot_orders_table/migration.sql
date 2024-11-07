-- CreateTable
CREATE TABLE `Counter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `counter` INTEGER NOT NULL,
    `lastUpdated` DATETIME(3) NOT NULL,
    `loginId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KOTOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `KOTnumber` INTEGER NOT NULL,
    `cartItems` JSON NOT NULL,
    `lastUpdatedDate` DATETIME(3) NOT NULL,
    `loginId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Counter` ADD CONSTRAINT `Counter_loginId_fkey` FOREIGN KEY (`loginId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KOTOrder` ADD CONSTRAINT `KOTOrder_loginId_fkey` FOREIGN KEY (`loginId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
