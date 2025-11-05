import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ===== Request Types =====
export interface CompleteWorkoutSessionRequest {
  workoutTemplateId: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  difficultyRating?: number; // 1-5
  energyRating?: number; // 1-5
  notes?: string;
  exerciseSessions: ExerciseSessionData[];
}

export interface ExerciseSessionData {
  exerciseTemplateId: string;
  exerciseId: string;
  order: number;
  startedAt?: string;
  completedAt?: string;
  status: string; // C = Completed, SK = Skipped
  notes?: string;
  sets: SetSessionData[];
}

export interface SetSessionData {
  setNumber: number;
  load?: number;
  reps?: number;
  restSeconds?: number;
  completed: boolean;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

// ===== Response Types =====
export interface SetSessionResponse {
  id: string;
  exerciseSessionId: string;
  setNumber: number;
  load?: number;
  reps?: number;
  restSeconds?: number;
  completed: boolean;
  notes?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ExerciseSessionResponse {
  id: string;
  workoutSessionId: string;
  exerciseTemplateId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseUrl?: string;
  order: number;
  startedAt: string;
  completedAt?: string;
  status: string; // IP=Em progresso, C=Completo, SK=Pulado
  notes?: string;
  setSessions?: SetSessionResponse[];
  // Dados do template para referência
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
}

export interface WorkoutSessionResponse {
  id: string;
  workoutTemplateId: string;
  workoutTemplateTitle: string;
  customerId: string;
  customerName?: string;
  routineId: string;
  routineTitle?: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  totalVolume?: number;
  status: string; // IP=Em progresso, C=Completo, CA=Cancelado
  difficultyRating?: number;
  energyRating?: number;
  notes?: string;
  createdAt: string;
  exerciseSessions?: ExerciseSessionResponse[];
}

export interface WorkoutSessionSummaryResponse {
  id: string;
  workoutTemplateTitle: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  totalVolume?: number;
  status: string;
  difficultyRating?: number;
  exercisesCompleted: number;
  totalExercises: number;
}

export interface PreviousSetData {
  load?: number;
  reps?: number;
  date: string;
}

// ===== Hooks =====

// Completar sessão de treino (salvar tudo de uma vez)
export function useCompleteWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["completeWorkoutSession"],
    retry: 0,
    mutationFn: async (data: CompleteWorkoutSessionRequest) => {
      const request = await api.post<ApiResponse<string>>(
        `/workoutSession/complete`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkoutHistory"] });
    },
    onError: (e) => {
      console.error("Erro ao completar treino", e);
      throw e;
    },
  });
}

// Buscar sessão por ID
export function useGetWorkoutSessionById(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ["getWorkoutSessionById", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("ID da sessão é obrigatório");
      const request = await api.get<ApiResponse<WorkoutSessionResponse>>(
        `/workoutSession/${sessionId}`
      );
      return request.data;
    },
    enabled: !!sessionId,
    retry: 1,
  });
}

// Buscar histórico de treinos
export function useGetWorkoutHistory(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ["getWorkoutHistory", page, pageSize],
    queryFn: async () => {
      const request = await api.get<
        ApiResponse<{
          items: WorkoutSessionSummaryResponse[];
          totalItems: number;
          currentPage: number;
          pageSize: number;
          totalPages: number;
        }>
      >(`/workoutSession/history?page=${page}&pageSize=${pageSize}`);
      return request.data;
    },
    retry: 1,
  });
}

// Buscar dados da última execução do exercício (para coluna ANTERIOR)
export function useGetPreviousExerciseData(
  exerciseId: string | null | undefined
) {
  return useQuery({
    queryKey: ["getPreviousExerciseData", exerciseId],
    queryFn: async () => {
      if (!exerciseId) throw new Error("ID do exercício é obrigatório");
      const request = await api.get<ApiResponse<PreviousSetData[]>>(
        `/workoutSession/exercise/${exerciseId}/previous`
      );
      return request.data;
    },
    enabled: !!exerciseId,
    retry: 1,
  });
}
