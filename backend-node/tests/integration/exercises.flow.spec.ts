import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";
import { prisma } from "../../src/prisma";

describe("Exercises flow", () => {
  const app = createApp();
  let token: string;

  beforeEach(async () => {
    await resetSelfManagedStore();
    await prisma.exercise.deleteMany({ where: { createdByUser: { email: "user@exercises.test" } } });
    await prisma.user.deleteMany({ where: { email: "user@exercises.test" } });

    const reg = await request(app).post("/auth/self-managed/register").send({
      name: "Exercise User", email: "user@exercises.test", password: "12345678",
    });
    token = reg.body.token;

    // Seed category
    await prisma.exerciseCategory.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: { id: "00000000-0000-0000-0000-000000000001", name: "TestCategory" },
    });
  });

  it("creates, searches, updates and deletes a custom exercise", async () => {
    const createRes = await request(app)
      .post("/exercises")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: "00000000-0000-0000-0000-000000000001", name: "Test Push Up" });

    expect(createRes.status).toBe(201);
    const exerciseId = createRes.body.id;

    const searchRes = await request(app)
      .get("/exercises/search?searchTerm=Test Push Up")
      .set("Authorization", `Bearer ${token}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBeGreaterThan(0);

    const deleteRes = await request(app)
      .delete(`/exercises/${exerciseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(204);
  });
});
