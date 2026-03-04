import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/app";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";

describe("Self-managed user flow", () => {
  beforeEach(async () => {
    await resetSelfManagedStore();
  });

  it("registers, reads profile and manages workout templates", async () => {
    const app = createApp();

    const registerResponse = await request(app).post("/auth/self-managed/register").send({
      name: "Mauri",
      email: "mauri@mail.com",
      password: "12345678",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.profile).toBe("SelfManaged");

    const token = registerResponse.body.token as string;

    const profileResponse = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.email).toBe("mauri@mail.com");

    const createWorkoutResponse = await request(app)
      .post("/workouts/templates")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Treino Hipertrofia",
        notes: "Foco superior",
        exercises: [
          { name: "Supino reto", sets: 4, reps: 8 },
          { name: "Remada curvada", sets: 4, reps: 10 },
        ],
      });

    expect(createWorkoutResponse.status).toBe(201);
    expect(createWorkoutResponse.body.title).toBe("Treino Hipertrofia");

    const workoutId = createWorkoutResponse.body.id as string;

    const listResponse = await request(app)
      .get("/workouts/templates")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const startSessionResponse = await request(app)
      .post("/workouts/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        workoutTemplateId: workoutId,
        notes: "Sessão da manhã",
      });

    expect(startSessionResponse.status).toBe(201);
    expect(startSessionResponse.body.status).toBe("in_progress");

    const sessionId = startSessionResponse.body.id as string;

    const finishSessionResponse = await request(app)
      .post(`/workouts/sessions/${sessionId}/finish`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        notes: "Concluído com boa execução",
        exercises: [
          { name: "Supino reto", completedSets: 4, completedReps: 8 },
          { name: "Remada curvada", completedSets: 4, completedReps: 10 },
        ],
      });

    expect(finishSessionResponse.status).toBe(200);
    expect(finishSessionResponse.body.status).toBe("finished");

    const upsertGoalResponse = await request(app)
      .put("/goals/weekly")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetSessions: 2 });

    expect(upsertGoalResponse.status).toBe(200);
    expect(upsertGoalResponse.body.targetSessions).toBe(2);

    const weeklyProgressResponse = await request(app)
      .get("/goals/weekly/progress")
      .set("Authorization", `Bearer ${token}`);

    expect(weeklyProgressResponse.status).toBe(200);
    expect(weeklyProgressResponse.body.targetSessions).toBe(2);
    expect(weeklyProgressResponse.body.completedSessions).toBe(1);

    const listSessionsResponse = await request(app)
      .get("/workouts/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(listSessionsResponse.status).toBe(200);
    expect(listSessionsResponse.body).toHaveLength(1);

    const updateWorkoutResponse = await request(app)
      .put(`/workouts/templates/${workoutId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Treino Hipertrofia V2",
      });

    expect(updateWorkoutResponse.status).toBe(200);
    expect(updateWorkoutResponse.body.title).toBe("Treino Hipertrofia V2");

    const deleteWorkoutResponse = await request(app)
      .delete(`/workouts/templates/${workoutId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteWorkoutResponse.status).toBe(204);
  });

  it("logs in after registering", async () => {
    const app = createApp();

    await request(app).post("/auth/self-managed/register").send({
      name: "Teste",
      email: "teste@mail.com",
      password: "12345678",
    });

    const loginResponse = await request(app).post("/auth/self-managed/login").send({
      email: "teste@mail.com",
      password: "12345678",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.email).toBe("teste@mail.com");
    expect(loginResponse.body.token).toBeTypeOf("string");
  });
});
