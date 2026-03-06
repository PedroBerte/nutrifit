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

function fromBackendPaginated<T>(raw: unknown): ApiResponse<PaginatedResponse<T>> {
  const asRecord = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

  const root = asRecord(raw);
  // Backend shape: { success, message, data: { items, pagination } }
  const dataNode = asRecord(root.data);

  const items = Array.isArray(dataNode.items)
    ? (dataNode.items as T[])
    : Array.isArray(root.items)
    ? (root.items as T[])
    : [];

  const paginationNode = asRecord(dataNode.pagination);
  const currentPage = Number(paginationNode.currentPage ?? 1);
  const pageSize = Number(paginationNode.pageSize ?? Math.max(items.length, 1));
  const totalCount = Number(paginationNode.totalCount ?? items.length);
  const totalPages = Number(
    paginationNode.totalPages ?? Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)))
  );

  return ok({
    items,
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      totalCount,
    },
  });
}

function toRoutineItems(items: unknown[]): RoutineType[] {
  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as Record<string, unknown>;
      const nested = candidate.routine;

      // Supports both payloads:
      // 1) [{ routine: {...} }]
      // 2) [{...routine}]
      const routine =
        nested && typeof nested === "object"
          ? (nested as RoutineType)
          : (candidate as unknown as RoutineType);

      return routine?.id ? routine : null;
    })
    .filter((routine): routine is RoutineType => !!routine);
}

export function useCreateRoutine() {
  return useMutation({
    mutationKey: ["createRoutine"],
    retry: 0,
    mutationFn: async (routine: CreateRoutineRequest) => {
      const request = await api.post<RoutineType>(
        `/routine`,
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
        `/routine/${routineId}`,
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
      await api.delete(`/routine/${routineId}`);
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
        `/routine/${routineId}`
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
      const request = await api.get(`/routine/my-routines?page=${page}&pageSize=${pageSize}`);
      return fromBackendPaginated<RoutineType>(request.data);
    },
    retry: 1,
  });
}

export function useAssignRoutine() {
  return useMutation({
    mutationKey: ["assignRoutine"],
    retry: 0,
    mutationFn: async (data: AssignRoutineRequest) => {
      const request = await api.post(`/routine/assign`, data);
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
        `/routine/${routineId}/customer/${customerId}`
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
      const request = await api.get(`/routine/my-assigned-routines?page=${page}&pageSize=${pageSize}`);
      const paginated = fromBackendPaginated<unknown>(request.data);
      const routineItems = toRoutineItems(paginated.data?.items ?? []);
      return ok({
        items: routineItems,
        pagination: paginated.data?.pagination ?? {
          currentPage: page,
          pageSize,
          totalPages: 1,
          totalCount: 0,
        },
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
      const request = await api.get(`/routine/customer/${customerId}?page=${page}&pageSize=${pageSize}`);
      const paginated = fromBackendPaginated<unknown>(request.data);
      const routineItems = toRoutineItems(paginated.data?.items ?? []);
      return ok({
        items: routineItems,
        pagination: paginated.data?.pagination ?? {
          currentPage: page,
          pageSize,
          totalPages: 1,
          totalCount: 0,
        },
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
        `/routine/${routineId}/customers`
      );
      const data = request.data;
      const assignedCustomers = (data.assigned || []).reduce<
        RoutineCustomersResponse["assignedCustomers"]
      >((acc, x) => {
        if (!x?.customer?.id) return acc;

        acc.push({
          ...x.customer,
          assignedAt: x.createdAt,
          expiresAt: x.expiresAt ?? undefined,
        });

        return acc;
      }, []);

      return ok({
        assignedCustomers,
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
        `/routine/near-expiry?daysThreshold=${daysThreshold}`
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
