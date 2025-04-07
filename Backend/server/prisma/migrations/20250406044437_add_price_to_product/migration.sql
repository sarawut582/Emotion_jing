/*
  Warnings:

  - You are about to drop the column `email` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `product` table. All the data in the column will be lost.
  - Added the required column `price` to the `product` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `product_email_key` ON `product`;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `email`,
    DROP COLUMN `password`,
    ADD COLUMN `price` INTEGER NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;
