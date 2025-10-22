import { api } from "@/lib/axios";
import type { ExerciseType } from "@/types/exercise";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export function useGetExercises(page: number = 1, pageSize: number = 100) {
  return useQuery({
    queryKey: ["getExercises", page, pageSize],
    queryFn: async () => {
      const request = await api.get<
        ApiResponse<PaginatedResponse<ExerciseType>>
      >(`/exercise?page=${page}&pageSize=${pageSize}`);
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
