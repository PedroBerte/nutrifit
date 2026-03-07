import { api } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ActivateAdminResponse {
  message: string;
  accessToken: string;
  tokenType: string;
  isAdmin: boolean;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalAdmins: number;
  totalBonds: number;
  totalActiveBonds: number;
  totalPendingBonds: number;
  totalExercises: number;
  totalWorkoutTemplates: number;
  totalRoutines: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  status: string;
  isAdmin: boolean;
  createdAt: string;
  profile: string;
}

export interface AdminBondItem {
  id: string;
  status: string;
  createdAt: string;
  customer: {
    customerId: string;
    name: string;
    email: string;
  };
  professional: {
    professionalId: string;
    name: string;
    email: string;
  };
  sender: {
    senderId: string;
    name: string;
    email: string;
  };
}

export interface AdminExerciseItem {
  id: string;
  name: string;
  category: string;
  isPublished: boolean;
  status: string;
  createdAt: string;
  createdBy?: string | null;
}

export interface AdminWorkoutItem {
  id: string;
  title: string;
  order: number;
  status: string;
  createdAt: string;
  routineId: string;
  routine: string;
  personal: string;
}

export interface AdminRoutineItem {
  id: string;
  title: string;
  goal?: string | null;
  difficulty?: string | null;
  weeks?: number | null;
  status: string;
  createdAt: string;
  personal: string;
}

type AdminListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

type AdminUsersFilters = AdminListFilters & {
  isAdmin?: boolean;
};

type AdminExercisesFilters = AdminListFilters & {
  isPublished?: boolean;
};

function toQueryString(filters: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  return params.toString();
}

export function useActivateAdmin() {
  return useMutation({
    mutationKey: ["activateAdmin"],
    mutationFn: async (code: string) => {
      const response = await api.post<ActivateAdminResponse>("/admin/activate", {
        code,
      });
      return response.data;
    },
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await api.get<AdminDashboardResponse>("/admin/dashboard");
      return response.data;
    },
    retry: 1,
  });
}

export function useAdminUsers(filters: AdminUsersFilters = {}) {
  const { page = 1, pageSize = 10, search, status, isAdmin } = filters;

  return useQuery({
    queryKey: ["adminUsers", page, pageSize, search, status, isAdmin],
    queryFn: async () => {
      const query = toQueryString({ page, pageSize, search, status, isAdmin });
      const response = await api.get<PaginatedResponse<AdminUserItem>>(`/admin/users?${query}`);
      return response.data;
    },
    retry: 1,
  });
}

export function useAdminBonds(filters: AdminListFilters = {}) {
  const { page = 1, pageSize = 10, search, status } = filters;

  return useQuery({
    queryKey: ["adminBonds", page, pageSize, search, status],
    queryFn: async () => {
      const query = toQueryString({ page, pageSize, search, status });
      const response = await api.get<PaginatedResponse<AdminBondItem>>(`/admin/bonds?${query}`);
      return response.data;
    },
    retry: 1,
  });
}

export function useAdminExercises(filters: AdminExercisesFilters = {}) {
  const { page = 1, pageSize = 20, search, status, isPublished } = filters;

  return useQuery({
    queryKey: ["adminExercises", page, pageSize, search, status, isPublished],
    queryFn: async () => {
      const query = toQueryString({ page, pageSize, search, status, isPublished });
      const response = await api.get<PaginatedResponse<AdminExerciseItem>>(`/admin/exercises?${query}`);
      return response.data;
    },
    retry: 1,
  });
}

export function useAdminWorkouts(filters: AdminListFilters = {}) {
  const { page = 1, pageSize = 20, search, status } = filters;

  return useQuery({
    queryKey: ["adminWorkouts", page, pageSize, search, status],
    queryFn: async () => {
      const query = toQueryString({ page, pageSize, search, status });
      const response = await api.get<PaginatedResponse<AdminWorkoutItem>>(`/admin/workouts?${query}`);
      return response.data;
    },
    retry: 1,
  });
}

export function useAdminRoutines(filters: AdminListFilters = {}) {
  const { page = 1, pageSize = 20, search, status } = filters;

  return useQuery({
    queryKey: ["adminRoutines", page, pageSize, search, status],
    queryFn: async () => {
      const query = toQueryString({ page, pageSize, search, status });
      const response = await api.get<PaginatedResponse<AdminRoutineItem>>(`/admin/routines?${query}`);
      return response.data;
    },
    retry: 1,
  });
}

export function useAdminUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "A" | "I" }) => {
      await api.patch(`/admin/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}

export function useAdminUpdateUserAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      await api.patch(`/admin/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}

export function useAdminUpdateBondStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bondId, status }: { bondId: string; status: "A" | "P" | "C" | "I" }) => {
      await api.patch(`/admin/bonds/${bondId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBonds"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}
