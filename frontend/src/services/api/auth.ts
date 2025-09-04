import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSendAccessEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.post(
        "/authentication/sendAccessEmail",
        { email },
        {
          headers: {
            "X-App-BaseUrl": window.location.origin,
          },
        }
      );
    },
  });
}

export function useValidateSession() {
  return useMutation({
    mutationFn: async (token: string) => {
      var response = await api.post<string>(
        `/authentication/validateSession?token=${encodeURIComponent(token)}`
      );

      return response.data;
    },
    onError: async (e) => {
      console.log("Erro ao validar sessão", e);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/authentication/logout");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
