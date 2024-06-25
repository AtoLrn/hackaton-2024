-- CreateTable
CREATE TABLE "Theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question" TEXT NOT NULL,
    "reponse" TEXT,
    "exploitable" BOOLEAN NOT NULL DEFAULT false,
    "themeQuestionId" INTEGER,
    "themeReponseId" INTEGER,
    "note" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "data_themeQuestionId_fkey" FOREIGN KEY ("themeQuestionId") REFERENCES "Theme" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "data_themeReponseId_fkey" FOREIGN KEY ("themeReponseId") REFERENCES "Theme" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
