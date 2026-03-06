import { api } from "@/lib/axios";
import type {
  ExerciseType,
  ExerciseCategory,
  MuscleGroup,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "@/types/exercise";
import type { ApiResponse } from "@/types/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

function toArrayPayload<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

export function useGetExercises(page: number = 1, pageSize: number = 100) {
  return useQuery({
    queryKey: ["getExercises", page, pageSize],
    queryFn: async () => {
      const request = await api.get<{
        total: number;
        page: number;
        pageSize: number;
        data: ExerciseType[];
      }>(
        `/exercise?page=${page}&pageSize=${pageSize}`
      );
      console.log("Fetched exercises:", request.data);
      return ok(request.data.data || []);
    },
    retry: 1,
  });
}

export function useGetExerciseById(exerciseId: string | null | undefined) {
  return useQuery({
    queryKey: ["getExerciseById", exerciseId],
    queryFn: async () => {
      if (!exerciseId) throw new Error("ID do exercício é obrigatório");
      const request = await api.get<ExerciseType>(
        `/exercise/${exerciseId}`
      );
      return ok(request.data);
    },
    enabled: !!exerciseId,
    retry: 1,
  });
}

export function useGetExerciseCategories() {
  return useQuery({
    queryKey: ["getExerciseCategories"],
    queryFn: async () => {
      const request = await api.get("/exercise/categories");
      return ok(toArrayPayload<ExerciseCategory>(request.data));
    },
    retry: 1,
  });
}

export function useGetMuscleGroups() {
  return useQuery({
    queryKey: ["getMuscleGroups"],
    queryFn: async () => {
      const request = await api.get("/exercise/muscle-groups");
      return ok(toArrayPayload<MuscleGroup>(request.data));
    },
    retry: 1,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExerciseRequest) => {
      const response = await api.post<ExerciseType>("/exercise", data);
      return ok(response.data, "Exercise created");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getExercises"] });
    },
  });
}

export function useUpdateExercise(exerciseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateExerciseRequest) => {
      const response = await api.put<ExerciseType>(
        `/exercise/${exerciseId}`,
        data
      );
      return ok(response.data, "Exercise updated");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getExercises"] });
      queryClient.invalidateQueries({
        queryKey: ["getExerciseById", exerciseId],
      });
    },
  });
}

export interface UpdateExerciseMediaRequest {
  imageUrl?: string;
  videoUrl?: string;
}

export function useUpdateExerciseMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      data,
    }: {
      exerciseId: string;
      data: UpdateExerciseMediaRequest;
    }) => {
      const response = await api.patch<ExerciseType>(
        `/exercise/${exerciseId}/media`,
        data
      );
      return ok(response.data, "Exercise media updated");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getExercises"] });
      queryClient.invalidateQueries({ queryKey: ["getWorkoutTemplateById"] });
      queryClient.invalidateQueries({ queryKey: ["getWorkoutTemplatesByRoutine"] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      await api.delete(`/exercise/${exerciseId}`);
      return ok(true, "Exercise deleted");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getExercises"] });
    },
  });
}
