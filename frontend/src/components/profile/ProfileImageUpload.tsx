import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/services/api/storage";
import { useUpdateUser } from "@/services/api/user";
import { toast } from "sonner";
import { getUserAvatarUrl } from "@/lib/avatar";
import type { UserType } from "@/types/user";

interface ProfileImageUploadProps {
  user: UserType;
  onImageUpdate?: (newImageUrl: string) => void;
}

export function ProfileImageUpload({
  user,
  onImageUpdate,
}: ProfileImageUploadProps) {
  const { id: userId, imageUrl: currentImageUrl, name: userName } = user;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateUserMutation = useUpdateUser();

  const isUploading = updateUserMutation.isPending;
  const displayUrl = previewUrl || currentImageUrl || getUserAvatarUrl({ name: userName, id: userId || undefined });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use JPG, PNG ou WebP.");
      return;
    }

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Tamanho máximo: 2MB");
      return;
    }

    try {
      // Mostrar preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      console.log("[UPLOAD] Iniciando upload da imagem de perfil...");

      // Upload para MinIO
      const uploadResult = await uploadImage(file, "profiles", userId || "");
      
      console.log("[UPLOAD] ✅ Upload concluído:", uploadResult.url);

      // Atualizar usuário com nova URL (mantendo todos os campos obrigatórios)
      await updateUserMutation.mutateAsync({
        ...user,
        imageUrl: uploadResult.url,
      });

      console.log("[UPLOAD] ✅ Perfil atualizado no banco");

      toast.success("Foto de perfil atualizada!");
      
      // Notificar componente pai
      onImageUpdate?.(uploadResult.url);

      // Limpar preview local
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(null);

    } catch (error: any) {
      console.error("[UPLOAD] ❌ Erro:", error);
      
      // Limpar preview em caso de erro
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      const errorMessage = error.response?.data?.message || error.message || "Erro ao fazer upload";
      toast.error(errorMessage);
    } finally {
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    try {
      // Atualizar usuário removendo URL (mantendo todos os campos obrigatórios)
      await updateUserMutation.mutateAsync({
        ...user,
        imageUrl: null,
      });

      toast.success("Foto de perfil removida!");
      onImageUpdate?.("");
      setPreviewUrl(null);

    } catch (error: any) {
      console.error("[UPLOAD] ❌ Erro ao remover:", error);
      toast.error("Erro ao remover foto de perfil");
    }
  };

  return (
    <div className="relative">
      {/* Avatar com borda e efeito */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 p-1">
          <div className="w-full h-full rounded-full overflow-hidden bg-neutral-dark-03">
            <img
              src={displayUrl}
              alt={userName || "Foto de perfil"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getUserAvatarUrl({ name: userName, id: userId || undefined });
              }}
            />
          </div>
        </div>

        {/* Overlay ao passar mouse */}
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <div className="text-center">
              <Camera className="w-8 h-8 text-white mx-auto mb-1" />
              <p className="text-xs text-white font-medium">
                {currentImageUrl ? "Trocar foto" : "Adicionar foto"}
              </p>
            </div>
          )}
        </div>

        {/* Badge de edição */}
        {!isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
}
