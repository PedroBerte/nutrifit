-- AlterTable
ALTER TABLE "ExerciseTemplate" ADD COLUMN     "isBisetWithPrevious" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "setType" TEXT NOT NULL DEFAULT 'Reps',
ADD COLUMN     "targetCalories" DECIMAL(65,30),
ADD COLUMN     "targetDurationSeconds" INTEGER,
ADD COLUMN     "weightUnit" TEXT NOT NULL DEFAULT 'kg';

-- AlterTable
ALTER TABLE "SetSession" ADD COLUMN     "calories" DECIMAL(65,30),
ADD COLUMN     "durationSeconds" INTEGER;
