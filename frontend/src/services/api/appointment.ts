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

export function useGetCustomerPendingAppointments() {
  return useQuery({
    queryKey: ["getCustomerPendingAppointments"],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>(
        "/appointment/customer/pending"
      );
      return request.data;
    },
    retry: 1,
  });
}

export function useGetCustomerAppointments() {
  return useQuery({
    queryKey: ["getCustomerAppointments"],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>(
        "/appointment/customer/all"
      );
      return request.data;
    },
    retry: 1,
  });
}

export function useGetProfessionalAppointments() {
  return useQuery({
    queryKey: ["getProfessionalAppointments"],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>(
        "/appointment/professional/all"
      );
      return request.data;
    },
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
      queryClient.invalidateQueries({
        queryKey: ["getCustomerPendingAppointments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getCustomerAppointments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["getProfessionalAppointments"],
      });
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
