import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface SelfManagedWorkoutExercise {
  name: string;
  sets: number;
  reps: number;
}

export interface SelfManagedWorkoutTemplate {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  exercises: SelfManagedWorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSelfManagedWorkoutRequest {
  title: string;
  notes?: string;
  exercises: SelfManagedWorkoutExercise[];
}

export interface SelfManagedWorkoutSessionExercise {
  name: string;
  plannedSets: number;
  plannedReps: number;
  completedSets: number;
  completedReps: number;
}

export interface SelfManagedWorkoutSession {
  id: string;
  userId: string;
  workoutTemplateId: string;
  titleSnapshot: string;
  status: "in_progress" | "finished";
  startedAt: string;
  finishedAt?: string;
  notes?: string;
  exercises: SelfManagedWorkoutSessionExercise[];
}

export interface StartSelfManagedWorkoutSessionRequest {
  workoutTemplateId: string;
  notes?: string;
}

export interface FinishSelfManagedWorkoutSessionRequest {
  notes?: string;
  exercises: Array<{
    name: string;
    completedSets: number;
    completedReps: number;
  }>;
}

export function useGetMySelfManagedWorkouts(enabled: boolean = true) {
  return useQuery({
    queryKey: ["getMySelfManagedWorkouts"],
    queryFn: async () => {
      const request = await api.get<SelfManagedWorkoutTemplate[]>("/workouts/templates");
      return request.data;
    },
    enabled,
    retry: 1,
  });
}

export function useCreateSelfManagedWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createSelfManagedWorkout"],
    retry: 0,
    mutationFn: async (payload: CreateSelfManagedWorkoutRequest) => {
      const request = await api.post<SelfManagedWorkoutTemplate>("/workouts/templates", payload);
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMySelfManagedWorkouts"] });
    },
  });
}

export function useStartSelfManagedWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["startSelfManagedWorkoutSession"],
    retry: 0,
    mutationFn: async (payload: StartSelfManagedWorkoutSessionRequest) => {
      const request = await api.post<SelfManagedWorkoutSession>("/workouts/sessions", payload);
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMySelfManagedWorkoutSessions"] });
    },
  });
}

export function useGetSelfManagedWorkoutSession(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ["getSelfManagedWorkoutSession", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("ID da sessão é obrigatório");
      const request = await api.get<SelfManagedWorkoutSession>(`/workouts/sessions/${sessionId}`);
      return request.data;
    },
    enabled: !!sessionId,
    retry: 1,
  });
}

export function useFinishSelfManagedWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["finishSelfManagedWorkoutSession"],
    retry: 0,
    mutationFn: async ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: FinishSelfManagedWorkoutSessionRequest;
    }) => {
      const request = await api.post<SelfManagedWorkoutSession>(
        `/workouts/sessions/${sessionId}/finish`,
        payload
      );
      return request.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getSelfManagedWorkoutSession", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["getMySelfManagedWorkoutSessions"] });
    },
  });
}
