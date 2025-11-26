import { api } from "@/lib/axios";

export const addFavorite = async (professionalId: string) => {
  const response = await api.post(`/Favorite/${professionalId}`);
  return response.data;
};

export const removeFavorite = async (professionalId: string) => {
  const response = await api.delete(`/Favorite/${professionalId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get("/Favorite");
  return response.data;
};

export const checkFavorite = async (professionalId: string) => {
  const response = await api.get(`/Favorite/check/${professionalId}`);
  return response.data;
};
