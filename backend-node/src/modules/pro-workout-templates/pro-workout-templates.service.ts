import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";

const templateInclude = {
  exerciseTemplates: {
    where: { status: "A" },
    orderBy: { order: "asc" as const },
    include: { exercise: true },
  },
} as const;

async function assertPersonalOwnsRoutine(routineId: string, personalId: string) {
  const r = await prisma.routine.findFirst({ where: { id: routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  return r;
}

async function assertPersonalOwnsTemplate(templateId: string, personalId: string) {
  const t = await prisma.workoutTemplate.findFirst({
    where: { id: templateId, routine: { personalId } },
  });
  if (!t) throw new AppError("Template not found or unauthorized", 403);
  return t;
}

export async function createTemplate(
  routineId: string,
  personalId: string,
  data: { title: string; description?: string; estimatedDurationMinutes?: number; order?: number }
) {
  await assertPersonalOwnsRoutine(routineId, personalId);
  return prisma.workoutTemplate.create({ data: { ...data, routineId }, include: templateInclude });
}

export async function getTemplateById(templateId: string) {
  const t = await prisma.workoutTemplate.findUnique({ where: { id: templateId }, include: templateInclude });
  if (!t) throw new AppError("Template not found", 404);
  return t;
}

export async function getTemplatesByRoutine(routineId: string) {
  return prisma.workoutTemplate.findMany({
    where: { routineId, status: "A" },
    include: templateInclude,
    orderBy: { order: "asc" },
  });
}

export async function updateTemplate(
  templateId: string,
  personalId: string,
  data: Partial<{ title: string; description: string; estimatedDurationMinutes: number; order: number }>
) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  return prisma.workoutTemplate.update({ where: { id: templateId }, data, include: templateInclude });
}

export async function deleteTemplate(templateId: string, personalId: string) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  await prisma.workoutTemplate.update({ where: { id: templateId }, data: { status: "I" } });
}

export async function addExerciseToTemplate(
  templateId: string,
  personalId: string,
  data: { exerciseId: string; order?: number; targetSets: number; targetRepsMin?: number; targetRepsMax?: number; suggestedLoad?: number; restSeconds?: number; notes?: string; setType?: string; weightUnit?: string; isBisetWithPrevious?: boolean; targetDurationSeconds?: number; targetCalories?: number }
) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  return prisma.exerciseTemplate.create({
    data: { workoutTemplateId: templateId, ...data },
    include: { exercise: true },
  });
}

export async function updateExerciseTemplate(exerciseTemplateId: string, personalId: string, data: Partial<Parameters<typeof addExerciseToTemplate>[2]>) {
  const et = await prisma.exerciseTemplate.findFirst({
    where: { id: exerciseTemplateId, workoutTemplate: { routine: { personalId } } },
  });
  if (!et) throw new AppError("ExerciseTemplate not found or unauthorized", 403);
  return prisma.exerciseTemplate.update({ where: { id: exerciseTemplateId }, data, include: { exercise: true } });
}

export async function removeExerciseFromTemplate(exerciseTemplateId: string, personalId: string) {
  const et = await prisma.exerciseTemplate.findFirst({
    where: { id: exerciseTemplateId, workoutTemplate: { routine: { personalId } } },
  });
  if (!et) throw new AppError("ExerciseTemplate not found or unauthorized", 403);
  await prisma.exerciseTemplate.update({ where: { id: exerciseTemplateId }, data: { status: "I" } });
}

export async function reorderExercises(templateId: string, personalId: string, orderedIds: string[]) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  await Promise.all(
    orderedIds.map((id, idx) => prisma.exerciseTemplate.update({ where: { id }, data: { order: idx } }))
  );
  return getTemplateById(templateId);
}
