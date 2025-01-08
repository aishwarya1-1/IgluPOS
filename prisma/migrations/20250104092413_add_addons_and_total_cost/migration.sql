-- AlterTable
ALTER TABLE `IceCream` MODIFY `category` ENUM('IceCream', 'Falooda', 'MilkShakes', 'Topping', 'Cone') NOT NULL DEFAULT 'IceCream';

-- AlterTable
ALTER TABLE `OrderItems` ADD COLUMN `addons` JSON NOT NULL,
    ADD COLUMN `addonsTotal` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `totalCost` DOUBLE NOT NULL DEFAULT 0.0;
