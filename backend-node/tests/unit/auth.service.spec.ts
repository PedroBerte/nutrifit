import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/self-managed/self-managed.store", () => ({
  findUserByEmail: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("mock.jwt.token"),
    verify: vi.fn(),
  },
}));

import { findUserByEmail } from "../../src/modules/self-managed/self-managed.store";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  hashPassword, validatePassword, createAccessToken, verifyAccessToken,
  authenticateSelfManagedUser,
} from "../../src/modules/auth/auth.service";

describe("auth.service", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("hashPassword returns a bcrypt hash", async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed" as never);
    const result = await hashPassword("secret");
    expect(result).toBe("hashed");
    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
  });

  it("validatePassword returns true when passwords match", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    expect(await validatePassword("secret", "hashed")).toBe(true);
  });

  it("validatePassword returns false when passwords do not match", async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    expect(await validatePassword("wrong", "hashed")).toBe(false);
  });

  it("createAccessToken calls jwt.sign and returns token", () => {
    vi.mocked(jwt.sign).mockReturnValue("mock.jwt.token" as never);
    const token = createAccessToken({ id: "u-1", name: "Alice", email: "a@a.com", isAdmin: false, profile: "SelfManaged" });
    expect(token).toBe("mock.jwt.token");
    expect(jwt.sign).toHaveBeenCalled();
  });

  it("verifyAccessToken throws 401 on invalid token", () => {
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error("invalid"); });
    expect(() => verifyAccessToken("bad.token")).toThrow(expect.objectContaining({ statusCode: 401 }));
  });

  it("verifyAccessToken returns claims on valid token", () => {
    const claims = { id: "u-1", name: "Alice", email: "a@a.com", isAdmin: false, profile: "SelfManaged" };
    vi.mocked(jwt.verify).mockReturnValue(claims as never);
    expect(verifyAccessToken("good.token")).toMatchObject(claims);
  });

  it("authenticateSelfManagedUser throws 401 when user not found", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(undefined);
    await expect(authenticateSelfManagedUser({ email: "x@x.com", password: "pass" }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it("authenticateSelfManagedUser throws 401 on wrong password", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "u-1", name: "Alice", email: "a@a.com", passwordHash: "hash", profileId: "p-1",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    await expect(authenticateSelfManagedUser({ email: "a@a.com", password: "wrong" }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it("authenticateSelfManagedUser returns token on success", async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: "u-1", name: "Alice", email: "a@a.com", passwordHash: "hash", profileId: "p-1",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue("signed.token" as never);
    const result = await authenticateSelfManagedUser({ email: "a@a.com", password: "pass" });
    expect(result.token).toBe("signed.token");
    expect(result.user.email).toBe("a@a.com");
  });
});
