import { api } from "@/lib/axios";
import type { UserType } from "@/types/user";
import { useMutation } from "@tanstack/react-query";

export function useCreateUser() {
  return useMutation({
    mutationKey: ["createUser"],
    retry: 0,
    mutationFn: async (user: UserType) => {
      const request = await api.post<UserType>(`/user`, user);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao criar usuário", e);
    },
  });
}
