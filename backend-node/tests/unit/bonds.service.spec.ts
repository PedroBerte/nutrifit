import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    customerProfessionalBond: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/prisma";
import { getBondById, getBondsByUser, createBond } from "../../src/modules/bonds/bonds.service";

describe("bonds.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getBondById throws 404 when bond not found", async () => {
    vi.mocked(prisma.customerProfessionalBond.findUnique).mockResolvedValue(null);
    await expect(getBondById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("getBondsByUser returns empty array for new user", async () => {
    vi.mocked(prisma.customerProfessionalBond.findMany).mockResolvedValue([]);
    const result = await getBondsByUser("user-1");
    expect(result).toEqual([]);
  });

  it("createBond creates and returns bond", async () => {
    const mock = {
      id: "b-1",
      customerId: "c-1",
      professionalId: "p-1",
      senderId: "p-1",
      status: "P",
      customer: null,
      professional: null,
      sender: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.customerProfessionalBond.create).mockResolvedValue(mock as any);
    const result = await createBond({ customerId: "c-1", professionalId: "p-1", senderId: "p-1" });
    expect(result.status).toBe("P");
  });
});
