import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    customerFeedback: { findMany: vi.fn() },
    favoriteProfessional: { findUnique: vi.fn() },
  },
}));

import { prisma } from "../../src/prisma";
import { getUserById, updateUser, deleteUser, calculateDistance } from "../../src/modules/users/users.service";

describe("users.service", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("getUserById throws 404 when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    await expect(getUserById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("getUserById returns user without password fields", async () => {
    const mockUser = {
      id: "u-1", name: "Alice", email: "a@a.com",
      password: "secret", passwordHash: "hash",
      status: "A", profile: null, address: null,
      professionalCredential: null, professionalDetails: null,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    const result = await getUserById("u-1");
    expect(result.password).toBeUndefined();
    expect(result.passwordHash).toBeUndefined();
    expect(result.name).toBe("Alice");
  });

  it("updateUser calls prisma.update and strips passwords", async () => {
    const mockUser = { id: "u-1", name: "Bob", password: "x", passwordHash: "y" };
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);
    const result = await updateUser("u-1", { name: "Bob" });
    expect(result.password).toBeUndefined();
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: "u-1" }, data: { name: "Bob" } });
  });

  it("deleteUser soft-deletes by setting status to I", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);
    await deleteUser("u-1");
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: "u-1" }, data: { status: "I" } });
  });

  it("calculateDistance returns 0 for same point", () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it("calculateDistance returns approximate value for known points", () => {
    // São Paulo to Rio de Janeiro ≈ 357 km
    const dist = calculateDistance(-23.5505, -46.6333, -22.9068, -43.1729);
    expect(dist).toBeGreaterThan(340);
    expect(dist).toBeLessThan(380);
  });
});
