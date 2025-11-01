import { api } from "@/lib/axios";
import type { CustomerProfessionalBondType } from "@/types/professional";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateBond() {
  return useMutation({
    mutationKey: ["createBond"],
    retry: 0,
    mutationFn: async (bond: CustomerProfessionalBondType) => {
      const request = await api.post<CustomerProfessionalBondType>(
        `/bond`,
        bond
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao criar vínculo", e);
      throw e;
    },
  });
}

export function useGetBondById(id: string | null | undefined) {
  return useQuery({
    queryKey: ["getBondById", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do vínculo é obrigatório");
      const request = await api.get<CustomerProfessionalBondType>(
        `/bond/${id}`
      );
      return request.data;
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useGetBondsSent() {
  return useQuery({
    queryKey: ["getBondsSent"],
    queryFn: async () => {
      const request = await api.get<Array<CustomerProfessionalBondType>>(
        `/bond/sent`
      );
      return request.data;
    },
    retry: 1,
  });
}

export function useGetBondAsCustomer() {
  return useQuery({
    queryKey: ["getBondsAsCustomer"],
    queryFn: async () => {
      const request = await api.get<Array<CustomerProfessionalBondType>>(
        `/bond/as-customer`
      );
      return request.data && request.data[0];
    },
    retry: 1,
  });
}

export function useGetAllBonds(
  customerId?: string | null,
  professionalId?: string | null,
  onlyPending: boolean = false
) {
  return useQuery({
    queryKey: ["getAllBonds", { customerId, professionalId, onlyPending }],
    queryFn: async ({ queryKey }) => {
      const [, filters] = queryKey as [
        string,
        {
          customerId?: string | null;
          professionalId?: string | null;
          onlyPending: boolean;
        }
      ];
      const request = await api.get<CustomerProfessionalBondType[]>(`/bond`);
      let data = request.data;

      if (filters.customerId) {
        data = data.filter((b) => b.customerId === filters.customerId);
      }

      if (filters.professionalId) {
        data = data.filter((b) => b.professionalId === filters.professionalId);
      }

      if (filters.onlyPending) {
        data = data.filter((b) => b.status === "P");
      }

      return data;
    },
    retry: 1,
  });
}

export function useUpdateBond() {
  return useMutation({
    mutationKey: ["updateBond"],
    retry: 0,
    mutationFn: async (bond: CustomerProfessionalBondType) => {
      if (!bond?.id) throw new Error("Id do vínculo é obrigatório");
      const request = await api.put<CustomerProfessionalBondType>(
        `/bond/${bond.id}`,
        bond
      );
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao atualizar vínculo", e);
      throw e;
    },
  });
}

export function useDeleteBond() {
  return useMutation({
    mutationKey: ["deleteBond"],
    retry: 0,
    mutationFn: async (id: string) => {
      const request = await api.delete(`/bond/${id}`);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao deletar vínculo", e);
      throw e;
    },
  });
}
