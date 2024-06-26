-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "reponse" TEXT,
    "exploitable" BOOLEAN NOT NULL DEFAULT false,
    "themeQuestionId" INTEGER,
    "themeReponseId" INTEGER,
    "note" INTEGER NOT NULL DEFAULT 0,
    "isReponseConsistent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "data_themeQuestionId_fkey" FOREIGN KEY ("themeQuestionId") REFERENCES "Theme" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "data_themeReponseId_fkey" FOREIGN KEY ("themeReponseId") REFERENCES "Theme" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_data" ("exploitable", "id", "note", "question", "reponse", "themeQuestionId", "themeReponseId") SELECT "exploitable", "id", "note", "question", "reponse", "themeQuestionId", "themeReponseId" FROM "data";
DROP TABLE "data";
ALTER TABLE "new_data" RENAME TO "data";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
