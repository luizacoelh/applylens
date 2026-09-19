-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "dailyAiLimit" INTEGER NOT NULL DEFAULT 20,
    "ipHourlyLimit" INTEGER NOT NULL DEFAULT 30,
    "maxDescriptionLength" INTEGER NOT NULL DEFAULT 8000,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "geminiCallCount" INTEGER NOT NULL DEFAULT 0,
    "geminiCallResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyAiLimitOverride" INTEGER,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "geminiCallCount", "geminiCallResetAt", "id", "image", "name") SELECT "createdAt", "email", "emailVerified", "geminiCallCount", "geminiCallResetAt", "id", "image", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
