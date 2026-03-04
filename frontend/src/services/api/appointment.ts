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
      const request = await api.get<AppointmentType[]>("/appointments");
      return request.data.filter(
        (appointment: any) => appointment.customerProfessionalBondId === bondId
      );
    },
    enabled: !!bondId,
    retry: 1,
  });
}

export function useGetAppointmentById(id: string) {
  return useQuery({
    queryKey: ["getAppointmentById", id],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>("/appointments");
      const appointment = request.data.find((x) => x.id === id);
      if (!appointment) throw new Error("Appointment not found");
      return appointment;
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useGetCustomerPendingAppointments() {
  return useQuery({
    queryKey: ["getCustomerPendingAppointments"],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>("/appointments");
      return request.data.filter((x: any) => x.status === "P");
    },
    retry: 1,
  });
}

export function useGetCustomerAppointments() {
  return useQuery({
    queryKey: ["getCustomerAppointments"],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>("/appointments");
      return request.data;
    },
    retry: 1,
  });
}

export function useGetProfessionalAppointments() {
  return useQuery({
    queryKey: ["getProfessionalAppointments"],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>("/appointments");
      return request.data;
    },
    retry: 1,
  });
}

export function useGetProfessionalUpcomingAppointments(limit?: number) {
  return useQuery({
    queryKey: ["getProfessionalUpcomingAppointments", limit],
    queryFn: async () => {
      const request = await api.get<AppointmentType[]>("/appointments");
      const now = new Date();
      const upcoming = request.data
        .filter((apt) => {
          const aptDate = new Date(apt.scheduledAt);
          return aptDate > now && apt.status !== "C" && apt.status !== "R";
        })
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        );

      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    retry: 1,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentRequest) => {
      const request = await api.post<AppointmentType>("/appointments", data);
      console.log("Created appointment:", request.data);
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
        `/appointments/${id}`,
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
      await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointmentsByBondId"] });
    },
  });
}
