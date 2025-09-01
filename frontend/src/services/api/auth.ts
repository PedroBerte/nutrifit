import api from "@/lib/axios";
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      await api.post(
        `/authentication/validate-session?token=${encodeURIComponent(token)}`
      );
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export type Me = { email: string };

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<Me>("/authentication/me");
      return data;
    },
    retry: false,
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
