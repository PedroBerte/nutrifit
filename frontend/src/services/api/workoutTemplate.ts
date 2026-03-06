import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

function unwrapApiData<T>(payload: unknown): T | null {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if ("data" in obj) return (obj.data as T) ?? null;
  }
  return (payload as T) ?? null;
}

function extractIdFromResponse(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  // Raw object shape: { id: "..." }
  if (typeof obj.id === "string" && obj.id) return obj.id;

  // ApiResponse shape: { data: "guid" } OR { data: { id: "..." } }
  const data = obj.data;
  if (typeof data === "string" && data) return data;
  if (data && typeof data === "object") {
    const dataObj = data as Record<string, unknown>;
    if (typeof dataObj.id === "string" && dataObj.id) return dataObj.id;
  }

  return null;
}

type RawExerciseTemplate = {
  id: string;
  workoutTemplateId: string;
  exerciseId: string;
  exerciseName?: string;
  exerciseImageUrl?: string;
  exerciseVideoUrl?: string;
  order: number;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
  setType?: string;
  weightUnit?: string;
  isBisetWithPrevious?: boolean;
  targetDurationSeconds?: number;
  targetCalories?: number;
  createdAt: string;
  exercise?: {
    name: string;
    imageUrl?: string;
    videoUrl?: string;
  };
};

type RawWorkoutTemplate = {
  id: string;
  routineId: string;
  title: string;
  description?: string;
  estimatedDurationMinutes?: number;
  order: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  exerciseTemplates?: RawExerciseTemplate[];
};

function adaptTemplate(template: RawWorkoutTemplate): WorkoutTemplateResponse {
  return {
    ...template,
    exerciseTemplates: (template.exerciseTemplates || []).map((item) => ({
      id: item.id,
      workoutTemplateId: item.workoutTemplateId,
      exerciseId: item.exerciseId,
      exerciseName: item.exerciseName || item.exercise?.name || "Exercício",
      exerciseImageUrl: item.exerciseImageUrl || item.exercise?.imageUrl,
      exerciseVideoUrl: item.exerciseVideoUrl || item.exercise?.videoUrl,
      order: item.order,
      targetSets: item.targetSets,
      targetRepsMin: item.targetRepsMin,
      targetRepsMax: item.targetRepsMax,
      suggestedLoad: item.suggestedLoad,
      restSeconds: item.restSeconds,
      notes: item.notes,
      setType: item.setType ?? "Reps",
      weightUnit: item.weightUnit ?? "kg",
      isBisetWithPrevious: item.isBisetWithPrevious ?? false,
      targetDurationSeconds: item.targetDurationSeconds,
      targetCalories: item.targetCalories,
      createdAt: item.createdAt,
    })),
  };
}

export interface ExerciseTemplateRequest {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
  setType: string;
  weightUnit: string;
  isBisetWithPrevious: boolean;
  targetDurationSeconds?: number;
  targetCalories?: number;
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
  setType?: string;
  weightUnit?: string;
  isBisetWithPrevious?: boolean;
  targetDurationSeconds?: number;
  targetCalories?: number;
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
  setType: string;
  weightUnit: string;
  isBisetWithPrevious: boolean;
  targetDurationSeconds?: number;
  targetCalories?: number;
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
      const request = await api.post<RawWorkoutTemplate>(
        `/workouttemplate/routine/${routineId}`,
        {
          title: data.title,
          description: data.description,
          estimatedDurationMinutes: data.estimatedDurationMinutes,
          order: data.order,
        }
      );
      const createdId = extractIdFromResponse(request.data);

      if (!createdId) {
        throw new Error("Falha ao criar template: ID não retornado pela API.");
      }

      if (data.exerciseTemplates?.length) {
        for (const exerciseTemplate of data.exerciseTemplates) {
          await api.post(
            `/workouttemplate/${createdId}/exercises`,
            exerciseTemplate
          );
        }
      }

      return ok({ id: createdId });
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
      const request = await api.put<RawWorkoutTemplate>(
        `/workouttemplate/${templateId}`,
        data
      );
      const raw = unwrapApiData<RawWorkoutTemplate>(request.data);
      if (!raw) throw new Error("Resposta inválida ao atualizar template.");
      return ok(adaptTemplate(raw), "Template updated");
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
      await api.delete(`/workouttemplate/${templateId}`);
      return ok(true, "Template deleted");
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
      const request = await api.get(
        `/workouttemplate/${templateId}`
      );
      const raw = unwrapApiData<RawWorkoutTemplate>(request.data);
      if (!raw) throw new Error("Template não encontrado");
      return ok(adaptTemplate(raw));
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
      const request = await api.get(
        `/workouttemplate/routine/${routineId}`
      );
      const rawList = unwrapApiData<RawWorkoutTemplate[]>(request.data);
      const list = Array.isArray(rawList) ? rawList : [];
      return ok(list.map(adaptTemplate));
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
      const request = await api.post<RawExerciseTemplate>(
        `/workouttemplate/${templateId}/exercises`,
        data
      );
      return ok({ id: request.data.id }, "Exercise added");
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
      const request = await api.put<RawExerciseTemplate>(
        `/workouttemplate/exercise/${exerciseTemplateId}`,
        data
      );
      return ok(request.data, "Exercise updated");
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
      await api.delete(`/workouttemplate/exercise/${exerciseTemplateId}`);
      return ok(true, "Exercise removed");
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
      const request = await api.put<RawWorkoutTemplate>(
        `/workouttemplate/${templateId}/reorder`,
        exerciseTemplateIds
      );
      return ok(adaptTemplate(request.data), "Template reordered");
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
