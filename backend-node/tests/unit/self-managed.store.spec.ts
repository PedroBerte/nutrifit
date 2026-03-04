import { beforeEach, describe, expect, it } from "vitest";

import {
  createSelfManagedUser,
  createWorkoutTemplate,
  finishWorkoutSession,
  getWeeklyGoalProgress,
  listWorkoutTemplatesByUser,
  resetSelfManagedStore,
  startWorkoutSession,
  upsertWeeklyGoal,
  updateWorkoutTemplate,
} from "../../src/modules/self-managed/self-managed.store";

describe("self-managed store", () => {
  beforeEach(async () => {
    await resetSelfManagedStore();
  });

  it("creates a self-managed user with normalized email", async () => {
    const user = await createSelfManagedUser({
      name: "Maria",
      email: "Maria@Mail.com",
      passwordHash: "hash",
    });

    expect(user.email).toBe("maria@mail.com");
    expect(user.profile).toBe("SelfManaged");
  });

  it("creates and updates workout templates for the same user", async () => {
    const user = await createSelfManagedUser({
      name: "João",
      email: "joao@mail.com",
      passwordHash: "hash",
    });

    const workout = await createWorkoutTemplate({
      userId: user.id,
      title: "Treino A",
      exercises: [{ name: "Supino", sets: 4, reps: 10 }],
    });

    const updated = await updateWorkoutTemplate(user.id, workout.id, {
      title: "Treino A - Peito",
    });

    const list = await listWorkoutTemplatesByUser(user.id);

    expect(updated.title).toBe("Treino A - Peito");
    expect(list).toHaveLength(1);
  });

  it("starts and finishes a workout session", async () => {
    const user = await createSelfManagedUser({
      name: "Nina",
      email: "nina@mail.com",
      passwordHash: "hash",
    });

    const workout = await createWorkoutTemplate({
      userId: user.id,
      title: "Treino B",
      exercises: [{ name: "Agachamento", sets: 5, reps: 5 }],
    });

    const started = await startWorkoutSession({
      userId: user.id,
      workoutTemplateId: workout.id,
      notes: "Dia pesado",
    });

    const finished = await finishWorkoutSession(user.id, started.id, {
      exercises: [{ name: "Agachamento", completedSets: 5, completedReps: 5 }],
    });

    expect(started.status).toBe("in_progress");
    expect(finished.status).toBe("finished");
    expect(finished.finishedAt).toBeDefined();
    expect(finished.exercises[0].completedSets).toBe(5);
  });

  it("stores weekly goal and calculates progress", async () => {
    const user = await createSelfManagedUser({
      name: "Lia",
      email: "lia@mail.com",
      passwordHash: "hash",
    });

    const workout = await createWorkoutTemplate({
      userId: user.id,
      title: "Treino C",
      exercises: [{ name: "Levantamento terra", sets: 3, reps: 5 }],
    });

    const session = await startWorkoutSession({
      userId: user.id,
      workoutTemplateId: workout.id,
    });

    await finishWorkoutSession(user.id, session.id, {
      exercises: [{ name: "Levantamento terra", completedSets: 3, completedReps: 5 }],
    });

    const goal = await upsertWeeklyGoal({
      userId: user.id,
      targetSessions: 2,
    });

    const progress = await getWeeklyGoalProgress(user.id, goal.weekStartDate);

    expect(progress.targetSessions).toBe(2);
    expect(progress.completedSessions).toBe(1);
    expect(progress.goalReached).toBe(false);
  });
});
