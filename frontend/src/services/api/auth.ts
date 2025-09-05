import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

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
    mutationKey: ["validateSession"],
    retry: 0,
    mutationFn: async (token: string) => {
      console.log("Validating session with token:", token);
      const request = await api.post<string>(
        `/authentication/validateSession?token=${encodeURIComponent(token)}`
      );
      console.log("Session validated, received JWT:", request.data);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao validar sessão", e);
    },
  });
}
