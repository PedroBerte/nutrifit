import { api } from "@/lib/axios";
import { ensurePushSubscription } from "@/registerPush";
import { useMutation } from "@tanstack/react-query";

export interface SendAccessEmailRequest {
  email: string;
  invited?: boolean;
  professionalInviterId?: string;
}

export function useSendAccessEmail() {
  return useMutation({
    mutationFn: async (data: SendAccessEmailRequest) => {
      await api.post("/authentication/sendAccessEmail", data, {
        headers: {
          "X-App-BaseUrl": window.location.origin,
        },
      });
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
        `/authentication/ValidateSession?token=${encodeURIComponent(token)}`
      );
      const jwt = request.data;

      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5051/api";
      const vapidPublicKey =
        import.meta.env.VITE_VAPID_PUBLIC_KEY ||
        "BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4";

      console.log("[AUTH] API Base URL:", apiBaseUrl);
      console.log("[AUTH] VAPID Public Key:", vapidPublicKey);
      console.log("[AUTH] Token received:", jwt ? "✅" : "❌");

      try {
        await ensurePushSubscription(apiBaseUrl, vapidPublicKey, jwt);
        console.log("[AUTH] Push subscription successful ✅");
      } catch (e) {
        console.error("[AUTH] ❌ Falha ao inscrever push:", e);
      }

      return jwt;
    },
    onError: (e) => {
      console.error("Erro ao validar sessão", e);
      throw e;
    },
  });
}
