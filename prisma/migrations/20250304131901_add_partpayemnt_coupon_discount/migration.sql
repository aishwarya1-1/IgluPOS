/*
  Warnings:

  - A unique constraint covering the columns `[name,price,category,loginId]` on the table `Addon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,phoneNumber]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,categoryId,cost,loginId]` on the table `IceCream` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `billerName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `billerName` VARCHAR(191) NOT NULL,
    ADD COLUMN `couponId` INTEGER NULL,
    ADD COLUMN `discountId` INTEGER NULL,
    ADD COLUMN `paymentDetails` JSON NULL,
    MODIFY `modeOfPayment` ENUM('Cash', 'Card', 'UPI', 'PartPay') NOT NULL;

-- CreateTable
CREATE TABLE `Discount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('FLAT', 'PERCENTAGE') NOT NULL,
    `value` DOUBLE NOT NULL,
    `expiryDate` DATETIME(3) NULL,

    UNIQUE INDEX `Discount_type_value_key`(`type`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `type` ENUM('FLAT', 'PERCENTAGE') NOT NULL,
    `value` DOUBLE NOT NULL,
    `maxUsage` INTEGER NULL,
    `expiryDate` DATETIME(3) NULL,
    `loginId` INTEGER NOT NULL,

    UNIQUE INDEX `Coupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Addon_name_price_category_loginId_key` ON `Addon`(`name`, `price`, `category`, `loginId`);

-- CreateIndex
CREATE UNIQUE INDEX `Employee_name_phoneNumber_key` ON `Employee`(`name`, `phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `IceCream_name_categoryId_cost_loginId_key` ON `IceCream`(`name`, `categoryId`, `cost`, `loginId`);

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_loginId_fkey` FOREIGN KEY (`loginId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
