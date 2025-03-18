/*
  Warnings:

  - A unique constraint covering the columns `[code,loginId]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,phoneNumber,loginId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Coupon_code_key` ON `Coupon`;

-- DropIndex
DROP INDEX `Employee_name_phoneNumber_key` ON `Employee`;

-- CreateIndex
CREATE UNIQUE INDEX `Coupon_code_loginId_key` ON `Coupon`(`code`, `loginId`);

-- CreateIndex
CREATE UNIQUE INDEX `Employee_name_phoneNumber_loginId_key` ON `Employee`(`name`, `phoneNumber`, `loginId`);
