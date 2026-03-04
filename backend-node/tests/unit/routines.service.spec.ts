import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    routine: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    customerRoutine: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/prisma";
import {
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../../src/modules/routines/routines.service";

describe("routines.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getRoutineById throws 404 when routine not found", async () => {
    vi.mocked(prisma.routine.findUnique).mockResolvedValue(null);
    await expect(getRoutineById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("updateRoutine throws 403 for non-owner", async () => {
    vi.mocked(prisma.routine.findFirst).mockResolvedValue(null);
    await expect(updateRoutine("r-1", "other-user", { title: "X" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("deleteRoutine throws 403 for non-owner", async () => {
    vi.mocked(prisma.routine.findFirst).mockResolvedValue(null);
    await expect(deleteRoutine("r-1", "other-user")).rejects.toMatchObject({ statusCode: 403 });
  });

  it("createRoutine returns routine", async () => {
    const mock = {
      id: "r-1",
      personalId: "p-1",
      title: "Hipertrofia",
      goal: null,
      difficulty: null,
      weeks: null,
      status: "A",
      workoutTemplates: [],
      customerRoutines: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.routine.create).mockResolvedValue(mock as any);
    const result = await createRoutine("p-1", { title: "Hipertrofia" });
    expect(result.title).toBe("Hipertrofia");
  });
});
