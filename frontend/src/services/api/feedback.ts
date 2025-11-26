import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { FeedbackType } from "@/types/feedback";

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
