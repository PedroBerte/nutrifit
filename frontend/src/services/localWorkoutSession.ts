const LOCAL_WORKOUT_KEY = "nutrifit_active_workout";

// Types para o workout armazenado localmente
export interface LocalSetSession {
  id: string;
  setNumber: number;
  load?: number;
  reps?: number;
  restSeconds?: number;
  completed: boolean;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  previousLoad?: number; // Peso da última execução (referência)
  previousReps?: number; // Reps da última execução (referência)
}

export interface LocalExerciseSession {
  id: string;
  exerciseTemplateId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseImageUrl?: string;
  exerciseVideoUrl?: string;
  order: number;
  startedAt?: string;
  completedAt?: string;
  status: "IP" | "C" | "SK"; // In Progress, Completed, Skipped
  notes?: string;
  sets: LocalSetSession[];
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
}

export interface LocalWorkoutSession {
  workoutTemplateId: string;
  workoutTemplateTitle: string;
  routineId: string;
  startedAt: string;
  exercises: LocalExerciseSession[];
  notes?: string;
}

// ===== CRUD do localStorage =====

export function getLocalWorkout(): LocalWorkoutSession | null {
  try {
    const data = localStorage.getItem(LOCAL_WORKOUT_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao buscar treino local:", error);
    return null;
  }
}

export function saveLocalWorkout(workout: LocalWorkoutSession): void {
  try {
    localStorage.setItem(LOCAL_WORKOUT_KEY, JSON.stringify(workout));
  } catch (error) {
    console.error("Erro ao salvar treino local:", error);
  }
}

export function clearLocalWorkout(): void {
  try {
    localStorage.removeItem(LOCAL_WORKOUT_KEY);
  } catch (error) {
    console.error("Erro ao limpar treino local:", error);
  }
}

// ===== Helpers para manipular o treino =====

export function addSetToExercise(
  workout: LocalWorkoutSession,
  exerciseId: string,
  setData: Omit<LocalSetSession, "id" | "setNumber">
): LocalWorkoutSession {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id === exerciseId) {
      const nextSetNumber = exercise.sets.length + 1;
      const newSet: LocalSetSession = {
        id: crypto.randomUUID(),
        setNumber: nextSetNumber,
        ...setData,
      };
      return {
        ...exercise,
        sets: [...exercise.sets, newSet],
      };
    }
    return exercise;
  });

  const updatedWorkout = {
    ...workout,
    exercises: updatedExercises,
  };

  saveLocalWorkout(updatedWorkout);
  return updatedWorkout;
}

export function updateSetInExercise(
  workout: LocalWorkoutSession,
  exerciseId: string,
  setId: string,
  updates: Partial<LocalSetSession>
): LocalWorkoutSession {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id === exerciseId) {
      const updatedSets = exercise.sets.map((set) =>
        set.id === setId ? { ...set, ...updates } : set
      );
      return { ...exercise, sets: updatedSets };
    }
    return exercise;
  });

  const updatedWorkout = {
    ...workout,
    exercises: updatedExercises,
  };

  saveLocalWorkout(updatedWorkout);
  return updatedWorkout;
}

export function deleteSetFromExercise(
  workout: LocalWorkoutSession,
  exerciseId: string,
  setId: string
): LocalWorkoutSession {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id === exerciseId) {
      const filteredSets = exercise.sets.filter((set) => set.id !== setId);
      // Reordena os setNumbers
      const reorderedSets = filteredSets.map((set, index) => ({
        ...set,
        setNumber: index + 1,
      }));
      return { ...exercise, sets: reorderedSets };
    }
    return exercise;
  });

  const updatedWorkout = {
    ...workout,
    exercises: updatedExercises,
  };

  saveLocalWorkout(updatedWorkout);
  return updatedWorkout;
}

export function updateExerciseNotes(
  workout: LocalWorkoutSession,
  exerciseId: string,
  notes: string
): LocalWorkoutSession {
  const updatedExercises = workout.exercises.map((exercise) =>
    exercise.id === exerciseId ? { ...exercise, notes } : exercise
  );

  const updatedWorkout = {
    ...workout,
    exercises: updatedExercises,
  };

  saveLocalWorkout(updatedWorkout);
  return updatedWorkout;
}

export function skipExercise(
  workout: LocalWorkoutSession,
  exerciseId: string
): LocalWorkoutSession {
  const updatedExercises = workout.exercises.map((exercise) =>
    exercise.id === exerciseId
      ? {
          ...exercise,
          status: "SK" as const,
          completedAt: new Date().toISOString(),
        }
      : exercise
  );

  const updatedWorkout = {
    ...workout,
    exercises: updatedExercises,
  };

  saveLocalWorkout(updatedWorkout);
  return updatedWorkout;
}

export function calculateTotalVolume(workout: LocalWorkoutSession): number {
  return workout.exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets.reduce((sum, set) => {
      if (set.load && set.reps) {
        return sum + set.load * set.reps;
      }
      return sum;
    }, 0);
    return total + exerciseVolume;
  }, 0);
}

export function getTotalSets(workout: LocalWorkoutSession): number {
  return workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter(set => set.completed).length,
    0
  );
}

export function hasActiveWorkout(): boolean {
  const workout = getLocalWorkout();
  return workout !== null;
}

export function getActiveWorkoutInfo() {
  const workout = getLocalWorkout();
  if (!workout) return null;

  return {
    workoutTemplateId: workout.workoutTemplateId,
    workoutTemplateTitle: workout.workoutTemplateTitle,
    startedAt: workout.startedAt,
    totalVolume: calculateTotalVolume(workout),
    totalSets: getTotalSets(workout),
  };
}

export function initializeExerciseSets(
  workout: LocalWorkoutSession,
  exerciseId: string,
  previousSets: Array<{ load?: number; reps?: number }>,
  targetSets?: number
): LocalWorkoutSession {
  const updatedExercises = workout.exercises.map((exercise) => {
    if (exercise.id === exerciseId && exercise.sets.length === 0) {
      // Determina quantas séries criar
      const numSetsToCreate = Math.max(
        previousSets.length,
        targetSets || 0,
        1 // Pelo menos 1 série
      );

      // Cria as séries vazias com dados anteriores como referência
      const initializedSets: LocalSetSession[] = Array.from(
        { length: numSetsToCreate },
        (_, index) => {
          const previousSet = previousSets[index];
          return {
            id: crypto.randomUUID(),
            setNumber: index + 1,
            completed: false,
            previousLoad: previousSet?.load,
            previousReps: previousSet?.reps,
          };
        }
      );

      return {
        ...exercise,
        sets: initializedSets,
      };
    }
    return exercise;
  });

  const updatedWorkout = {
    ...workout,
    exercises: updatedExercises,
  };

  saveLocalWorkout(updatedWorkout);
  return updatedWorkout;
}
