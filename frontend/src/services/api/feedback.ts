import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateFeedbackRequest, FeedbackResponse, FeedbackType } from "@/types/feedback";

export function useGetProfessionalFeedbacks(professionalId: string | null | undefined) {
  return useQuery({
    queryKey: ["getProfessionalFeedbacks", professionalId],
    queryFn: async () => {
      if (!professionalId) throw new Error("ID do profissional é obrigatório");
      const request = await api.get<FeedbackType[]>(`/user/${professionalId}/feedbacks`);
      return request.data;
    },
    enabled: !!professionalId,
    retry: 1,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFeedbackRequest) => {
      const response = await api.post<FeedbackResponse>("/feedback", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["professionalFeedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["bondFeedback"] });
      queryClient.invalidateQueries({ queryKey: ["getProfessionalFeedbacks"] });
    },
  });
}

export function useGetFeedbacksForProfessional(professionalId: string | undefined) {
  return useQuery({
    queryKey: ["professionalFeedbacks", professionalId],
    queryFn: async () => {
      if (!professionalId) return [];
      const response = await api.get<FeedbackResponse[]>(
        `/feedback/professional/${professionalId}`
      );
      return response.data;
    },
    enabled: !!professionalId,
  });
}

export function useGetBondFeedback(
  customerId: string | undefined,
  professionalId: string | undefined
) {
  return useQuery({
    queryKey: ["bondFeedback", customerId, professionalId],
    queryFn: async () => {
      if (!customerId || !professionalId) return null;
      try {
        const response = await api.get<FeedbackResponse>(
          `/feedback/bond?customerId=${customerId}&professionalId=${professionalId}`
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!customerId && !!professionalId,
  });
}

