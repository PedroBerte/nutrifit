import { api } from "@/lib/axios";

export interface ImageUploadResponse {
  url: string;
  fileName: string;
  objectName: string;
}

export async function uploadImage(
  file: File,
  folder?: string,
  customFileName?: string
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  if (folder) params.append("folder", folder);
  if (customFileName) params.append("customFileName", customFileName);

  const url = `/storage/upload${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await api.post<ImageUploadResponse>(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

/**
 * Faz upload de uma imagem/GIF de exercício usando o ID do exercício como chave
 * @param file - Arquivo de imagem ou GIF
 * @param exerciseId - ID do exercício (será usado como nome do arquivo)
 * @returns URL da mídia no MinIO
 */
export async function uploadExerciseMedia(
  file: File,
  exerciseId: string
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ImageUploadResponse>(
    `/storage/exercise/${exerciseId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

/**
 * Remove a mídia de um exercício
 * @param exerciseId - ID do exercício
 */
export async function deleteExerciseMedia(exerciseId: string): Promise<void> {
  await api.delete(`/storage/exercise/${exerciseId}`);
}

export async function deleteImage(objectName: string): Promise<void> {
  await api.delete(`/storage/${encodeURIComponent(objectName)}`);
}

export async function getPresignedUrl(
  objectName: string,
  expiryInSeconds = 3600
): Promise<string> {
  const response = await api.get<{ url: string }>(
    `/storage/presigned-url/${encodeURIComponent(objectName)}`,
    {
      params: { expiryInSeconds },
    }
  );
  return response.data.url;
}
