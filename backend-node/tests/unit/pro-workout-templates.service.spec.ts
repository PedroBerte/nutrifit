import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    routine: { findFirst: vi.fn() },
    workoutTemplate: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    exerciseTemplate: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/prisma";
import {
  createTemplate, getTemplateById, getTemplatesByRoutine,
  updateTemplate, deleteTemplate, addExerciseToTemplate,
  removeExerciseFromTemplate,
} from "../../src/modules/pro-workout-templates/pro-workout-templates.service";

describe("pro-workout-templates.service", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockTemplate = {
    id: "t-1", routineId: "r-1", title: "Day 1", status: "A",
    description: null, estimatedDurationMinutes: null, order: 0,
    exerciseTemplates: [],
    createdAt: new Date(), updatedAt: new Date(),
  };

  it("createTemplate throws 403 when personal does not own routine", async () => {
    vi.mocked(prisma.routine.findFirst).mockResolvedValue(null);
    await expect(createTemplate("r-1", "p-1", { title: "Day 1" }))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it("createTemplate creates and returns template", async () => {
    vi.mocked(prisma.routine.findFirst).mockResolvedValue({ id: "r-1" } as any);
    vi.mocked(prisma.workoutTemplate.create).mockResolvedValue(mockTemplate as any);
    const result = await createTemplate("r-1", "p-1", { title: "Day 1" });
    expect(result.id).toBe("t-1");
  });

  it("getTemplateById throws 404 when not found", async () => {
    vi.mocked(prisma.workoutTemplate.findUnique).mockResolvedValue(null);
    await expect(getTemplateById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("getTemplateById returns template when found", async () => {
    vi.mocked(prisma.workoutTemplate.findUnique).mockResolvedValue(mockTemplate as any);
    const result = await getTemplateById("t-1");
    expect(result.id).toBe("t-1");
  });

  it("getTemplatesByRoutine returns list", async () => {
    vi.mocked(prisma.workoutTemplate.findMany).mockResolvedValue([mockTemplate as any]);
    const result = await getTemplatesByRoutine("r-1");
    expect(result).toHaveLength(1);
  });

  it("updateTemplate throws 403 when personal does not own template", async () => {
    vi.mocked(prisma.workoutTemplate.findFirst).mockResolvedValue(null);
    await expect(updateTemplate("t-1", "p-1", { title: "Updated" }))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it("deleteTemplate soft-deletes by setting status to I", async () => {
    vi.mocked(prisma.workoutTemplate.findFirst).mockResolvedValue(mockTemplate as any);
    vi.mocked(prisma.workoutTemplate.update).mockResolvedValue({} as any);
    await deleteTemplate("t-1", "p-1");
    expect(prisma.workoutTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "I" } })
    );
  });

  it("addExerciseToTemplate throws 403 when personal does not own template", async () => {
    vi.mocked(prisma.workoutTemplate.findFirst).mockResolvedValue(null);
    await expect(addExerciseToTemplate("t-1", "p-1", { exerciseId: "ex-1", targetSets: 3 }))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  it("removeExerciseFromTemplate throws 403 when personal does not own exerciseTemplate", async () => {
    vi.mocked(prisma.exerciseTemplate.findFirst).mockResolvedValue(null);
    await expect(removeExerciseFromTemplate("et-1", "p-1"))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});
