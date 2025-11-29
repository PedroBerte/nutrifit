import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/services/api/storage";
import { useUpdateUser } from "@/services/api/user";
import { toast } from "sonner";
import { getUserAvatarUrl } from "@/lib/avatar";

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  onImageUpdate?: (newImageUrl: string) => void;
}

export function ProfileImageUpload({
  userId,
  currentImageUrl,
  userName,
  userEmail,
  onImageUpdate,
}: ProfileImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateUserMutation = useUpdateUser();

  const isUploading = updateUserMutation.isPending;
  const displayUrl = previewUrl || currentImageUrl || getUserAvatarUrl({ name: userName, id: userId });

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
      const uploadResult = await uploadImage(file, "profiles", userId);
      
      console.log("[UPLOAD] ✅ Upload concluído:", uploadResult.url);

      // Atualizar usuário com nova URL
      await updateUserMutation.mutateAsync({
        id: userId,
        name: userName || "",
        email: userEmail || "",
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
      // Atualizar usuário removendo URL
      await updateUserMutation.mutateAsync({
        id: userId,
        name: userName || "",
        email: userEmail || "",
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
    <div className="relative group">
      {/* Avatar */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-primary">
        <img
          src={displayUrl}
          alt={userName || "Foto de perfil"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback para avatar gerado se a imagem falhar
            e.currentTarget.src = getUserAvatarUrl({ name: userName, id: userId });
          }}
        />

        {/* Overlay ao passar mouse */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <Camera className="w-4 h-4 mr-2" />
          {currentImageUrl ? "Trocar" : "Adicionar"}
        </Button>

        {currentImageUrl && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
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
