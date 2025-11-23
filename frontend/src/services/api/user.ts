import { api } from "@/lib/axios";
import { UserProfiles, type UserType } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";

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
      throw e;
    },
  });
}

export function useGetUserById(id: string | null | undefined) {
  return useQuery({
    queryKey: ["getUserById", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do usuário é obrigatório");
      const request = await api.get<UserType>(`/user/${id}`);
      return request.data;
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useGetAllUsers(
  onlyNutritionists: boolean = false,
  onlyPersonals: boolean = false,
  allProfessionals: boolean = false,
  userLat?: number | null,
  userLon?: number | null,
  maxDistanceKm?: number | null
) {
  return useQuery({
    queryKey: [
      "getAllUsers",
      { onlyNutritionists, onlyPersonals, allProfessionals, userLat, userLon, maxDistanceKm },
    ],
    queryFn: async ({ queryKey }) => {
      const [, filters] = queryKey as [
        string,
        {
          onlyNutritionists: boolean;
          onlyPersonals: boolean;
          allProfessionals: boolean;
          userLat?: number | null;
          userLon?: number | null;
          maxDistanceKm?: number | null;
        }
      ];
      
      // Construir query params
      const params = new URLSearchParams();
      if (filters.userLat !== null && filters.userLat !== undefined) {
        params.append('userLat', filters.userLat.toString());
      }
      if (filters.userLon !== null && filters.userLon !== undefined) {
        params.append('userLon', filters.userLon.toString());
      }
      if (filters.maxDistanceKm !== null && filters.maxDistanceKm !== undefined) {
        params.append('maxDistanceKm', filters.maxDistanceKm.toString());
      }
      
      const queryString = params.toString();
      const url = queryString ? `/user?${queryString}` : '/user';
      const request = await api.get<UserType[]>(url);

      if (filters.onlyNutritionists) {
        return request.data.filter(
          (user) => user.profile?.id === UserProfiles.NUTRITIONIST
        );
      }

      if (filters.onlyPersonals) {
        return request.data.filter(
          (user) => user.profile?.id === UserProfiles.PERSONAL
        );
      }

      if (filters.allProfessionals) {
        return request.data.filter(
          (user) =>
            user.profile?.id === UserProfiles.NUTRITIONIST ||
            user.profile?.id === UserProfiles.PERSONAL
        );
      }

      return request.data;
    },
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ["updateUser"],
    retry: 0,
    mutationFn: async (user: UserType) => {
      const request = await api.put<UserType>(`/user/${user.id}`, user);
      return request.data;
    },
    onError: (e) => {
      console.error("Erro ao atualizar usuário", e);
      throw e;
    },
  });
}
