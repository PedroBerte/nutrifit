import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ===== Request Types =====
export interface StartWorkoutSessionRequest {
  workoutTemplateId: string;
  startedAt?: string;
}

export interface CompleteWorkoutSessionRequest {
  completedAt?: string;
  difficultyRating?: number; // 1-5
  energyRating?: number; // 1-5
  notes?: string;
}

export interface StartExerciseSessionRequest {
  exerciseTemplateId: string;
  startedAt?: string;
}

export interface RegisterSetSessionRequest {
  setNumber: number;
  load?: number;
  reps?: number;
  restSeconds?: number;
  completed?: boolean;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface UpdateSetSessionRequest {
  load?: number;
  reps?: number;
  restSeconds?: number;
  completed?: boolean;
  notes?: string;
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

// Iniciar sessão de treino
export function useStartWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["startWorkoutSession"],
    retry: 0,
    mutationFn: async (data: StartWorkoutSessionRequest) => {
      const request = await api.post<ApiResponse<{ id: string }>>(
        `/workoutSession/start`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getActiveWorkoutSession"] });
    },
    onError: (e) => {
      console.error("Erro ao iniciar sessão de treino", e);
      throw e;
    },
  });
}

// Completar sessão de treino
export function useCompleteWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["completeWorkoutSession"],
    retry: 0,
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: CompleteWorkoutSessionRequest;
    }) => {
      const request = await api.post<ApiResponse>(
        `/workoutSession/${sessionId}/complete`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getActiveWorkoutSession"] });
      queryClient.invalidateQueries({ queryKey: ["getWorkoutHistory"] });
    },
    onError: (e) => {
      console.error("Erro ao completar treino", e);
      throw e;
    },
  });
}

// Cancelar sessão de treino
export function useCancelWorkoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cancelWorkoutSession"],
    retry: 0,
    mutationFn: async (sessionId: string) => {
      const request = await api.delete<ApiResponse>(
        `/workoutSession/${sessionId}`
      );
      return request.data;
    },
    onSuccess: async () => {
      console.log("[CANCEL API] Sucesso no cancelamento - backend confirmou");
      // Limpa cache do React Query
      queryClient.clear();
      
      // Seta dados como null explicitamente
      queryClient.setQueryData(["getActiveWorkoutSession"], {
        success: true,
        message: "Nenhuma sessão ativa",
        data: null
      });
      
      // Notifica o contexto sobre o cancelamento
      localStorage.setItem("workoutCancelled", "true");
      window.dispatchEvent(new CustomEvent("workoutCancelled"));
      
      // Invalida queries após um delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["getActiveWorkoutSession"] });
      }, 100);
    },
    onError: (e) => {
      console.error("[CANCEL API] Erro ao cancelar treino:", e);
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
    refetchInterval: 5000, // Atualiza a cada 5 segundos durante treino
  });
}

// Buscar sessão ativa
export function useGetActiveWorkoutSession() {
  return useQuery({
    queryKey: ["getActiveWorkoutSession"],
    queryFn: async () => {
      const request = await api.get<ApiResponse<WorkoutSessionResponse | null>>(
        `/workoutSession/active`
      );
      return request.data;
    },
    retry: 1,
    staleTime: 0, // Sempre considera os dados como "stale" para refetch
    gcTime: 0, // Remove do cache imediatamente quando não está em uso
    refetchOnMount: true, // Sempre refetch ao montar
    refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
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

// Iniciar exercício na sessão
export function useStartExerciseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["startExerciseSession"],
    retry: 0,
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: StartExerciseSessionRequest;
    }) => {
      const request = await api.post<ApiResponse<{ id: string }>>(
        `/workoutSession/${sessionId}/exercise/start`,
        data
      );
      return request.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutSessionById", variables.sessionId],
      });
    },
    onError: (e) => {
      console.error("Erro ao iniciar exercício", e);
      throw e;
    },
  });
}

// Completar exercício
export function useCompleteExerciseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["completeExerciseSession"],
    retry: 0,
    mutationFn: async ({
      sessionId,
      exerciseId,
    }: {
      sessionId: string;
      exerciseId: string;
    }) => {
      const request = await api.post<ApiResponse>(
        `/workoutSession/${sessionId}/exercise/${exerciseId}/complete`
      );
      return request.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutSessionById", variables.sessionId],
      });
    },
    onError: (e) => {
      console.error("Erro ao completar exercício", e);
      throw e;
    },
  });
}

// Pular exercício
export function useSkipExerciseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["skipExerciseSession"],
    retry: 0,
    mutationFn: async ({
      sessionId,
      exerciseId,
    }: {
      sessionId: string;
      exerciseId: string;
    }) => {
      const request = await api.post<ApiResponse>(
        `/workoutSession/${sessionId}/exercise/${exerciseId}/skip`
      );
      return request.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutSessionById", variables.sessionId],
      });
    },
    onError: (e) => {
      console.error("Erro ao pular exercício", e);
      throw e;
    },
  });
}

// Registrar série
export function useRegisterSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["registerSet"],
    retry: 0,
    mutationFn: async ({
      exerciseId,
      data,
    }: {
      exerciseId: string;
      data: RegisterSetSessionRequest;
    }) => {
      const request = await api.post<ApiResponse<{ id: string }>>(
        `/workoutSession/exercise/${exerciseId}/set`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkoutSessionById"] });
    },
    onError: (e) => {
      console.error("Erro ao registrar série", e);
      throw e;
    },
  });
}

// Atualizar série
export function useUpdateSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateSet"],
    retry: 0,
    mutationFn: async ({
      setId,
      data,
    }: {
      setId: string;
      data: UpdateSetSessionRequest;
    }) => {
      const request = await api.put<ApiResponse>(
        `/workoutSession/set/${setId}`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkoutSessionById"] });
    },
    onError: (e) => {
      console.error("Erro ao atualizar série", e);
      throw e;
    },
  });
}

// Deletar série
export function useDeleteSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteSet"],
    retry: 0,
    mutationFn: async (setId: string) => {
      const request = await api.delete<ApiResponse>(
        `/workoutSession/set/${setId}`
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkoutSessionById"] });
    },
    onError: (e) => {
      console.error("Erro ao deletar série", e);
      throw e;
    },
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
