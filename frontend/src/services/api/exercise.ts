import { api } from "@/lib/axios";
import type {
  ExerciseType,
  ExerciseCategory,
  MuscleGroup,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "@/types/exercise";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGetExercises(page: number = 1, pageSize: number = 100) {
  return useQuery({
    queryKey: ["getExercises", page, pageSize],
    queryFn: async () => {
      const request = await api.get<ApiResponse<ExerciseType[]>>(
        `/exercise?page=${page}&pageSize=${pageSize}`
      );
      console.log("Fetched exercises:", request.data);
      return request.data;
    },
    retry: 1,
  });
}

export function useGetExerciseById(exerciseId: string | null | undefined) {
  return useQuery({
    queryKey: ["getExerciseById", exerciseId],
    queryFn: async () => {
      if (!exerciseId) throw new Error("ID do exercício é obrigatório");
      const request = await api.get<ApiResponse<ExerciseType>>(
        `/exercise/${exerciseId}`
      );
      return request.data;
    },
    enabled: !!exerciseId,
    retry: 1,
  });
}

export function useGetExerciseCategories() {
  return useQuery({
    queryKey: ["getExerciseCategories"],
    queryFn: async () => {
      const request = await api.get<ApiResponse<ExerciseCategory[]>>(
        "/exercise/categories"
      );
      return request.data;
    },
    retry: 1,
  });
}

export function useGetMuscleGroups() {
  return useQuery({
    queryKey: ["getMuscleGroups"],
    queryFn: async () => {
      const request = await api.get<ApiResponse<MuscleGroup[]>>(
        "/exercise/muscle-groups"
      );
      return request.data;
    },
    retry: 1,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExerciseRequest) => {
      const response = await api.post<ApiResponse>("/exercise", data);
      return response.data;
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
      const response = await api.put<ApiResponse>(
        `/exercise/${exerciseId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getExercises"] });
      queryClient.invalidateQueries({
        queryKey: ["getExerciseById", exerciseId],
      });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      const response = await api.delete<ApiResponse>(`/exercise/${exerciseId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getExercises"] });
    },
  });
}
