/*
  Warnings:

  - A unique constraint covering the columns `[emotionType]` on the table `Emotion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Emotion_emotionType_key` ON `Emotion`(`emotionType`);
