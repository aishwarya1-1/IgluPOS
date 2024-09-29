-- CreateTable
CREATE TABLE `IceCream` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('IceCream', 'Waffles', 'MilkShakes') NOT NULL DEFAULT 'IceCream',
    `cost` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
