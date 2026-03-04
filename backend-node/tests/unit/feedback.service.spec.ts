import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    customerFeedback: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/prisma";
import { createFeedback, listFeedbacksByProfessional, getFeedbackById } from "../../src/modules/feedback/feedback.service";

describe("feedback.service", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("createFeedback creates and returns feedback with includes", async () => {
    const mockFeedback = {
      id: "f-1", customerId: "c-1", professionalId: "p-1",
      rate: 5, testimony: "Great!", type: 1, status: "A",
      customer: { id: "c-1", name: "Alice" },
      professional: { id: "p-1", name: "Bob" },
      createdAt: new Date(), updatedAt: new Date(),
    };
    vi.mocked(prisma.customerFeedback.create).mockResolvedValue(mockFeedback as any);
    const result = await createFeedback("c-1", { professionalId: "p-1", rate: 5, testimony: "Great!" });
    expect(result.id).toBe("f-1");
    expect(prisma.customerFeedback.create).toHaveBeenCalled();
  });

  it("listFeedbacksByProfessional returns active feedbacks", async () => {
    vi.mocked(prisma.customerFeedback.findMany).mockResolvedValue([
      { id: "f-1", status: "A", rate: 4, customer: { id: "c-1", name: "Alice" } } as any,
    ]);
    const result = await listFeedbacksByProfessional("p-1");
    expect(result).toHaveLength(1);
    expect(prisma.customerFeedback.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { professionalId: "p-1", status: "A" } })
    );
  });

  it("getFeedbackById throws 404 when not found", async () => {
    vi.mocked(prisma.customerFeedback.findUnique).mockResolvedValue(null);
    await expect(getFeedbackById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("getFeedbackById returns feedback when found", async () => {
    const mock = { id: "f-1", rate: 5, customer: null, professional: null };
    vi.mocked(prisma.customerFeedback.findUnique).mockResolvedValue(mock as any);
    const result = await getFeedbackById("f-1");
    expect(result.id).toBe("f-1");
  });
});
