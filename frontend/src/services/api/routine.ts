import { api } from "@/lib/axios";
import type {
  CreateRoutineRequest,
  UpdateRoutineRequest,
  AssignRoutineRequest,
  RoutineType,
  RoutineCustomersResponse,
  RoutineExpiryType,
} from "@/types/routine";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateRoutine() {
  return useMutation({
    mutationKey: ["createRoutine"],
    retry: 0,
    mutationFn: async (routine: CreateRoutineRequest) => {
      const request = await api.post<ApiResponse<RoutineType>>(
        `/routine`,
        routine
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao criar rotina", e);
      throw e;
    },
  });
}

export function useUpdateRoutine() {
  return useMutation({
    mutationKey: ["updateRoutine"],
    retry: 0,
    mutationFn: async ({
      routineId,
      data,
    }: {
      routineId: string;
      data: UpdateRoutineRequest;
    }) => {
      const request = await api.put<ApiResponse<RoutineType>>(
        `/routine/${routineId}`,
        data
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao atualizar rotina", e);
      throw e;
    },
  });
}

export function useDeleteRoutine() {
  return useMutation({
    mutationKey: ["deleteRoutine"],
    retry: 0,
    mutationFn: async (routineId: string) => {
      const request = await api.delete<ApiResponse>(`/routine/${routineId}`);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao deletar rotina", e);
      throw e;
    },
  });
}

export function useGetRoutineById(routineId: string | null | undefined) {
  return useQuery({
    queryKey: ["getRoutineById", routineId],
    queryFn: async () => {
      if (!routineId) throw new Error("ID da rotina é obrigatório");
      const request = await api.get<ApiResponse<RoutineType>>(
        `/routine/${routineId}`
      );
      return request.data;
    },
    enabled: !!routineId,
    retry: 1,
  });
}

export function useGetMyRoutines(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["getMyRoutines", page, pageSize],
    queryFn: async () => {
      const request = await api.get<
        ApiResponse<PaginatedResponse<RoutineType>>
      >(`/routine/my-routines?page=${page}&pageSize=${pageSize}`);
      return request.data;
    },
    retry: 1,
  });
}

export function useAssignRoutine() {
  return useMutation({
    mutationKey: ["assignRoutine"],
    retry: 0,
    mutationFn: async (data: AssignRoutineRequest) => {
      const request = await api.post<ApiResponse>(`/routine/assign`, data);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao atribuir rotina", e);
      throw e;
    },
  });
}

export function useUnassignRoutine() {
  return useMutation({
    mutationKey: ["unassignRoutine"],
    retry: 0,
    mutationFn: async ({
      routineId,
      customerId,
    }: {
      routineId: string;
      customerId: string;
    }) => {
      const request = await api.delete<ApiResponse>(
        `/routine/${routineId}/customer/${customerId}`
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao remover atribuição", e);
      throw e;
    },
  });
}

export function useGetMyAssignedRoutines(
  page: number = 1,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ["getMyAssignedRoutines", page, pageSize],
    queryFn: async () => {
      const request = await api.get<
        ApiResponse<PaginatedResponse<RoutineType>>
      >(`/routine/my-assigned-routines?page=${page}&pageSize=${pageSize}`);
      return request.data;
    },
    retry: 1,
  });
}

export function useGetCustomerRoutines(
  customerId: string | null | undefined,
  page: number = 1,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ["getCustomerRoutines", customerId, page, pageSize],
    queryFn: async () => {
      if (!customerId) throw new Error("ID do cliente é obrigatório");
      const request = await api.get<
        ApiResponse<PaginatedResponse<RoutineType>>
      >(`/routine/customer/${customerId}?page=${page}&pageSize=${pageSize}`);
      return request.data;
    },
    enabled: !!customerId,
    retry: 1,
  });
}

export function useGetRoutineCustomers(routineId: string | null | undefined) {
  return useQuery({
    queryKey: ["getRoutineCustomers", routineId],
    queryFn: async () => {
      if (!routineId) throw new Error("ID da rotina é obrigatório");
      const request = await api.get<ApiResponse<RoutineCustomersResponse>>(
        `/routine/${routineId}/customers`
      );
      return request.data;
    },
    enabled: !!routineId,
    retry: 1,
  });
}

export function useGetRoutinesNearExpiry(daysThreshold: number = 5) {
  return useQuery({
    queryKey: ["getRoutinesNearExpiry", daysThreshold],
    queryFn: async () => {
      const request = await api.get<ApiResponse<RoutineExpiryType[]>>(
        `/routine/near-expiry?daysThreshold=${daysThreshold}`
      );
      return request.data;
    },
    retry: 1,
  });
}
