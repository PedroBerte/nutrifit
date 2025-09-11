import { api } from "@/lib/axios";
import type {
  ProfessionalCredentialType,
  ProfessionalType,
} from "@/types/professional";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateProfessionalCredentials() {
  return useMutation({
    mutationKey: ["createProfessionalCredentials"],
    retry: 0,
    mutationFn: async (credentials: ProfessionalCredentialType) => {
      const request = await api.post<ProfessionalCredentialType>(
        `Professional/CreateProfessionalCredential`,
        credentials
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao criar credenciais profissionais", e);
    },
  });
}

export function useGetAllProfessionals() {
  return useQuery({
    queryKey: ["getAllProfessionals"],
    queryFn: async () => {
      const request = await api.get<ProfessionalType[]>(
        `Professional/GetAllProfessionals`
      );
      return request.data;
    },
    retry: 0,
  });
}
