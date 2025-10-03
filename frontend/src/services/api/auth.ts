import { api } from "@/lib/axios";
import { ensurePushSubscription } from "@/registerPush";
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

      const apiBaseUrl = import.meta.env.VITE_API_URL;
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      console.log("API Base URL:", apiBaseUrl);
      console.log("VAPID Public Key:", vapidPublicKey);

      try {
        await ensurePushSubscription(apiBaseUrl, vapidPublicKey, request.data);
      } catch (e) {
        console.error("Falha ao inscrever push:", e);
      }

      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao validar sessão", e);
      throw e;
    },
  });
}
