import { api } from "@/lib/axios";
import type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutType,
  CreateWorkoutSetRequest,
  WorkoutSetType,
} from "@/types/workout";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateWorkout() {
  return useMutation({
    mutationKey: ["createWorkout"],
    retry: 0,
    mutationFn: async ({
      routineId,
      data,
    }: {
      routineId: string;
      data: CreateWorkoutRequest;
    }) => {
      const request = await api.post<ApiResponse<WorkoutType>>(
        `/workout/routine/${routineId}`,
        data
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao criar treino", e);
      throw e;
    },
  });
}

export function useUpdateWorkout() {
  return useMutation({
    mutationKey: ["updateWorkout"],
    retry: 0,
    mutationFn: async ({
      workoutId,
      data,
    }: {
      workoutId: string;
      data: UpdateWorkoutRequest;
    }) => {
      const request = await api.put<ApiResponse<WorkoutType>>(
        `/workout/${workoutId}`,
        data
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao atualizar treino", e);
      throw e;
    },
  });
}

export function useDeleteWorkout() {
  return useMutation({
    mutationKey: ["deleteWorkout"],
    retry: 0,
    mutationFn: async (workoutId: string) => {
      const request = await api.delete<ApiResponse>(`/workout/${workoutId}`);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao deletar treino", e);
      throw e;
    },
  });
}

export function useGetWorkoutById(workoutId: string | null | undefined) {
  return useQuery({
    queryKey: ["getWorkoutById", workoutId],
    queryFn: async () => {
      if (!workoutId) throw new Error("ID do treino é obrigatório");
      const request = await api.get<ApiResponse<WorkoutType>>(
        `/workout/${workoutId}`
      );
      return request.data;
    },
    enabled: !!workoutId,
    retry: 1,
  });
}

export function useGetWorkoutsByRoutine(routineId: string | null | undefined) {
  return useQuery({
    queryKey: ["getWorkoutsByRoutine", routineId],
    queryFn: async () => {
      if (!routineId) throw new Error("ID da rotina é obrigatório");
      const request = await api.get<ApiResponse<WorkoutType[]>>(
        `/workout/routine/${routineId}`
      );
      return request.data;
    },
    enabled: !!routineId,
    retry: 1,
  });
}

export function useCreateWorkoutSet() {
  return useMutation({
    mutationKey: ["createWorkoutSet"],
    retry: 0,
    mutationFn: async ({
      workoutId,
      data,
    }: {
      workoutId: string;
      data: CreateWorkoutSetRequest;
    }) => {
      const request = await api.post<ApiResponse<WorkoutSetType>>(
        `/workout/${workoutId}/sets`,
        data
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao adicionar exercício", e);
      throw e;
    },
  });
}

export function useDeleteWorkoutSet() {
  return useMutation({
    mutationKey: ["deleteWorkoutSet"],
    retry: 0,
    mutationFn: async (setId: string) => {
      const request = await api.delete<ApiResponse>(`/workout/sets/${setId}`);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao remover exercício", e);
      throw e;
    },
  });
}
