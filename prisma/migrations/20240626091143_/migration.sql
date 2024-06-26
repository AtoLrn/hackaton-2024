/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Theme` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");
