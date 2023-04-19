/*
  Warnings:

  - Made the column `verified` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('ADMIN', 'MEMBER', 'USER') NOT NULL DEFAULT 'USER',
    MODIFY `verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `GeneratedImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prompt` TEXT NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `model` ENUM('DALLE2') NOT NULL DEFAULT 'DALLE2',
    `resolution` ENUM('RES_256x256', 'RES_512x512', 'RES_1024x1024') NOT NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    INDEX `GeneratedImage_generatedAt_likes_idx`(`generatedAt`, `likes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favourite` (
    `userId` INTEGER NOT NULL,
    `imageId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `imageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GeneratedImage` ADD CONSTRAINT `GeneratedImage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favourite` ADD CONSTRAINT `Favourite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favourite` ADD CONSTRAINT `Favourite_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `GeneratedImage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
