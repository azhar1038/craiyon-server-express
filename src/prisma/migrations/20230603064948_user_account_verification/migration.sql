-- AlterTable
ALTER TABLE `User` ADD COLUMN `tokenGeneratedAt` DATETIME(3) NULL,
    ADD COLUMN `verificationToken` VARCHAR(32) NULL;
