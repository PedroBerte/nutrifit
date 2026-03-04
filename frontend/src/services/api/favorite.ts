import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const addFavorite = async (professionalId: string) => {
  const response = await api.post(`/favorites/${professionalId}`);
  return response.data;
};

export const removeFavorite = async (professionalId: string) => {
  const response = await api.delete(`/favorites/${professionalId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get("/favorites");
  return response.data;
};

export const checkFavorite = async (professionalId: string) => {
  const response = await api.get(`/favorites/check/${professionalId}`);
  return response.data.isFavorite; // Retorna apenas o boolean
};

export const useCheckFavorite = (professionalId: string | undefined) => {
  return useQuery({
    queryKey: ["favorite", professionalId],
    queryFn: () => professionalId ? checkFavorite(professionalId) : Promise.resolve(false),
    enabled: !!professionalId,
  });
};
