import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  AppointmentType,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from "@/types/appointment";

export function useGetAppointmentsByBondId(bondId: string) {
  return useQuery({
    queryKey: ["getAppointmentsByBondId", bondId],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>(
        `/appointment/bond/${bondId}`
      );
      return request.data;
    },
    enabled: !!bondId,
    retry: 1,
  });
}

export function useGetAppointmentById(id: string) {
  return useQuery({
    queryKey: ["getAppointmentById", id],
    queryFn: async () => {
      const request = await api.get<AppointmentType>(`/appointment/${id}`);
      return request.data;
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentRequest) => {
      const request = await api.post<AppointmentType>("/appointment", data);
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointmentsByBondId"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAppointmentRequest;
    }) => {
      const request = await api.put<AppointmentType>(
        `/appointment/${id}`,
        data
      );
      return request.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointmentsByBondId"] });
      queryClient.invalidateQueries({ queryKey: ["getAppointmentById"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/appointment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointmentsByBondId"] });
    },
  });
}
