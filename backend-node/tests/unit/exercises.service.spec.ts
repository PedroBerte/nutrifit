import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    exercise: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    exerciseCategory: { findMany: vi.fn() },
    muscleGroup: { findMany: vi.fn() },
  },
}));

import { prisma } from "../../src/prisma";
import {
  getExerciseById,
  createExercise,
  getCategories,
} from "../../src/modules/exercises/exercises.service";

describe("exercises.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getExerciseById throws 404 when exercise not found", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(null);
    await expect(getExerciseById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("createExercise creates and returns exercise", async () => {
    const mockEx = {
      id: "ex-1",
      name: "Supino",
      status: "A",
      createdByUserId: "u-1",
      categoryId: "c-1",
      instruction: null,
      imageUrl: null,
      videoUrl: null,
      isPublished: false,
      primaryMuscles: [],
      secondaryMuscles: [],
      category: { id: "c-1", name: "Força", status: "A" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.exercise.create).mockResolvedValue(mockEx as any);
    const result = await createExercise("u-1", { name: "Supino", categoryId: "c-1" });
    expect(result.name).toBe("Supino");
  });

  it("getCategories returns array from prisma", async () => {
    vi.mocked(prisma.exerciseCategory.findMany).mockResolvedValue([
      { id: "c-1", name: "Cardio", status: "A" },
    ] as any);
    const result = await getCategories();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe("Cardio");
  });
});
