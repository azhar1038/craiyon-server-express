-- CreateTable
CREATE TABLE `RefreshTokens` (
    `familyId` VARCHAR(191) NOT NULL,
    `tokenId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `validTill` DATETIME(3) NOT NULL,

    PRIMARY KEY (`familyId`, `tokenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
