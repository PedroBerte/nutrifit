import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ExerciseTemplateRequest {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
}

export interface CreateWorkoutTemplateRequest {
  title: string;
  description?: string;
  estimatedDurationMinutes?: number;
  order: number;
  exerciseTemplates?: ExerciseTemplateRequest[];
}

export interface UpdateWorkoutTemplateRequest {
  title?: string;
  description?: string;
  estimatedDurationMinutes?: number;
  order?: number;
}

export interface UpdateExerciseTemplateRequest {
  order?: number;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
}

export interface ExerciseTemplateResponse {
  id: string;
  workoutTemplateId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseImageUrl?: string;
  exerciseVideoUrl?: string;
  order: number;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutTemplateResponse {
  id: string;
  routineId: string;
  title: string;
  description?: string;
  estimatedDurationMinutes?: number;
  order: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  exerciseTemplates: ExerciseTemplateResponse[];
}

// Hooks
export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createWorkoutTemplate"],
    retry: 0,
    mutationFn: async ({
      routineId,
      data,
    }: {
      routineId: string;
      data: CreateWorkoutTemplateRequest;
    }) => {
      const request = await api.post<ApiResponse<{ id: string }>>(
        `/workoutTemplate/routine/${routineId}`,
        data
      );
      return request.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplatesByRoutine", variables.routineId],
      });
    },
    onError: (e) => {
      console.error("Erro ao criar template de treino", e);
      throw e;
    },
  });
}

export function useUpdateWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateWorkoutTemplate"],
    retry: 0,
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data: UpdateWorkoutTemplateRequest;
    }) => {
      const request = await api.put<ApiResponse>(
        `/workoutTemplate/${templateId}`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplatesByRoutine"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplateById"],
      });
    },
    onError: (e) => {
      console.error("Erro ao atualizar template", e);
      throw e;
    },
  });
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteWorkoutTemplate"],
    retry: 0,
    mutationFn: async (templateId: string) => {
      const request = await api.delete<ApiResponse>(
        `/workoutTemplate/${templateId}`
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplatesByRoutine"],
      });
    },
    onError: (e) => {
      console.error("Erro ao deletar template", e);
      throw e;
    },
  });
}

export function useGetWorkoutTemplateById(
  templateId: string | null | undefined
) {
  return useQuery({
    queryKey: ["getWorkoutTemplateById", templateId],
    queryFn: async () => {
      if (!templateId) throw new Error("ID do template é obrigatório");
      const request = await api.get<ApiResponse<WorkoutTemplateResponse>>(
        `/workoutTemplate/${templateId}`
      );
      return request.data;
    },
    enabled: !!templateId,
    retry: 1,
  });
}

export function useGetWorkoutTemplatesByRoutine(
  routineId: string | null | undefined
) {
  return useQuery({
    queryKey: ["getWorkoutTemplatesByRoutine", routineId],
    queryFn: async () => {
      if (!routineId) throw new Error("ID da rotina é obrigatório");
      const request = await api.get<ApiResponse<WorkoutTemplateResponse[]>>(
        `/workoutTemplate/routine/${routineId}`
      );
      return request.data;
    },
    enabled: !!routineId,
    retry: 1,
  });
}

export function useAddExerciseToTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addExerciseToTemplate"],
    retry: 0,
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data: ExerciseTemplateRequest;
    }) => {
      const request = await api.post<ApiResponse<{ id: string }>>(
        `/workoutTemplate/${templateId}/exercises`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplatesByRoutine"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplateById"],
      });
    },
    onError: (e) => {
      console.error("Erro ao adicionar exercício", e);
      throw e;
    },
  });
}

export function useUpdateExerciseTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateExerciseTemplate"],
    retry: 0,
    mutationFn: async ({
      exerciseTemplateId,
      data,
    }: {
      exerciseTemplateId: string;
      data: UpdateExerciseTemplateRequest;
    }) => {
      const request = await api.put<ApiResponse>(
        `/workoutTemplate/exercise/${exerciseTemplateId}`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplatesByRoutine"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplateById"],
      });
    },
    onError: (e) => {
      console.error("Erro ao atualizar exercício", e);
      throw e;
    },
  });
}

export function useRemoveExerciseFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["removeExerciseFromTemplate"],
    retry: 0,
    mutationFn: async (exerciseTemplateId: string) => {
      const request = await api.delete<ApiResponse>(
        `/workoutTemplate/exercise/${exerciseTemplateId}`
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplatesByRoutine"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplateById"],
      });
    },
    onError: (e) => {
      console.error("Erro ao remover exercício", e);
      throw e;
    },
  });
}

export function useReorderExercises() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["reorderExercises"],
    retry: 0,
    mutationFn: async ({
      templateId,
      exerciseTemplateIds,
    }: {
      templateId: string;
      exerciseTemplateIds: string[];
    }) => {
      const request = await api.put<ApiResponse>(
        `/workoutTemplate/${templateId}/reorder`,
        exerciseTemplateIds
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplatesByRoutine"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getWorkoutTemplateById"],
      });
    },
    onError: (e) => {
      console.error("Erro ao reordenar exercícios", e);
      throw e;
    },
  });
}
