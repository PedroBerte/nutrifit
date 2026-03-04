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

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

function toPaginated<T>(payload: {
  total: number;
  page: number;
  pageSize: number;
  data: T[];
}): ApiResponse<PaginatedResponse<T>> {
  return ok({
    items: payload.data,
    pagination: {
      currentPage: payload.page,
      pageSize: payload.pageSize,
      totalPages: Math.ceil(payload.total / payload.pageSize),
      totalCount: payload.total,
    },
  });
}

export function useCreateRoutine() {
  return useMutation({
    mutationKey: ["createRoutine"],
    retry: 0,
    mutationFn: async (routine: CreateRoutineRequest) => {
      const request = await api.post<RoutineType>(
        `/routines`,
        routine
      );
      return ok(request.data, "Routine created");
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
      const request = await api.put<RoutineType>(
        `/routines/${routineId}`,
        data
      );
      return ok(request.data, "Routine updated");
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
      await api.delete(`/routines/${routineId}`);
      return ok(true, "Routine deleted");
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
      const request = await api.get<RoutineType>(
        `/routines/${routineId}`
      );
      return ok(request.data);
    },
    enabled: !!routineId,
    retry: 1,
  });
}

export function useGetMyRoutines(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ["getMyRoutines", page, pageSize],
    queryFn: async () => {
      const request = await api.get<{
        total: number;
        page: number;
        pageSize: number;
        data: RoutineType[];
      }>(`/routines/my-routines?page=${page}&pageSize=${pageSize}`);
      return toPaginated(request.data);
    },
    retry: 1,
  });
}

export function useAssignRoutine() {
  return useMutation({
    mutationKey: ["assignRoutine"],
    retry: 0,
    mutationFn: async (data: AssignRoutineRequest) => {
      const request = await api.post(`/routines/assign`, data);
      return ok(request.data, "Routine assigned");
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
        `/routines/${routineId}/customer/${customerId}`
      );
      return ok(request.data, "Routine unassigned");
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
      const request = await api.get<{
        total: number;
        page: number;
        pageSize: number;
        data: Array<{ routine: RoutineType }>;
      }>(`/routines/my-assigned-routines?page=${page}&pageSize=${pageSize}`);
      return toPaginated({
        ...request.data,
        data: (request.data.data || []).map((item) => item.routine),
      });
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
      const request = await api.get<{
        total: number;
        page: number;
        pageSize: number;
        data: Array<{ routine: RoutineType }>;
      }>(`/routines/customer/${customerId}?page=${page}&pageSize=${pageSize}`);
      return toPaginated({
        ...request.data,
        data: (request.data.data || []).map((item) => item.routine),
      });
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
      const request = await api.get<{
        assigned: Array<{
          customer: {
            id: string;
            name: string;
            email: string;
          };
          createdAt: string;
          expiresAt?: string | null;
        }>;
      }>(
        `/routines/${routineId}/customers`
      );
      const data = request.data;
      return ok({
        assignedCustomers: (data.assigned || []).map((x) => ({
          ...x.customer,
          assignedAt: x.createdAt,
          expiresAt: x.expiresAt,
        })),
        availableCustomers: [],
      } as RoutineCustomersResponse);
    },
    enabled: !!routineId,
    retry: 1,
  });
}

export function useGetRoutinesNearExpiry(daysThreshold: number = 5) {
  return useQuery({
    queryKey: ["getRoutinesNearExpiry", daysThreshold],
    queryFn: async () => {
      const request = await api.get<any[]>(
        `/routines/near-expiry?daysThreshold=${daysThreshold}`
      );
      const mapped = (request.data || []).map((x) => ({
        customerId: x.customerId,
        customerName: x.customer?.name,
        customerImageUrl: undefined,
        routineId: x.routineId,
        routineTitle: x.routine?.title,
        expiresAt: x.expiresAt,
        daysUntilExpiry: x.expiresAt
          ? Math.ceil((new Date(x.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0,
      }));
      return ok(mapped as RoutineExpiryType[]);
    },
    retry: 1,
  });
}
