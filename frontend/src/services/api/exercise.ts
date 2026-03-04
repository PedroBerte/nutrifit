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
        `/exercises?page=${page}&pageSize=${pageSize}`
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
        `/exercises/${exerciseId}`
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
      const request = await api.get<ExerciseCategory[]>(
        "/exercises/categories"
      );
      return ok(request.data);
    },
    retry: 1,
  });
}

export function useGetMuscleGroups() {
  return useQuery({
    queryKey: ["getMuscleGroups"],
    queryFn: async () => {
      const request = await api.get<MuscleGroup[]>(
        "/exercises/muscle-groups"
      );
      return ok(request.data);
    },
    retry: 1,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExerciseRequest) => {
      const response = await api.post<ExerciseType>("/exercises", data);
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
        `/exercises/${exerciseId}`,
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
        `/exercises/${exerciseId}/media`,
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
      await api.delete(`/exercises/${exerciseId}`);
      return ok(true, "Exercise deleted");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getExercises"] });
    },
  });
}
