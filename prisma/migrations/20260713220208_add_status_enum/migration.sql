/*
  Warnings:

  - You are about to drop the column `matchScore` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `recruiterProfile` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `skillsToStudy` on the `Job` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APLICADA',
    "summary" TEXT,
    "requirements" TEXT,
    "technologies" TEXT,
    "questions" TEXT,
    "checklist" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Job" ("checklist", "company", "createdAt", "description", "id", "questions", "requirements", "status", "summary", "technologies", "title") SELECT "checklist", "company", "createdAt", "description", "id", "questions", "requirements", "status", "summary", "technologies", "title" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
