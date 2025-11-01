import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import {
  uploadExerciseMedia,
  deleteExerciseMedia,
} from "@/services/api/storage";

interface ExerciseMediaUploaderProps {
  exerciseId: string;
  currentMediaUrl?: string;
  onMediaChange?: (url: string | null) => void;
  disabled?: boolean;
}

export function ExerciseMediaUploader({
  exerciseId,
  currentMediaUrl,
  onMediaChange,
  disabled = false,
}: ExerciseMediaUploaderProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(
    currentMediaUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações no frontend
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Arquivo inválido. Use JPG, PNG, WEBP ou GIF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 5MB.");
      return;
    }

    try {
      setIsUploading(true);

      // Upload usando o ID do exercício como chave
      const response = await uploadExerciseMedia(file, exerciseId);

      setMediaUrl(response.url);
      onMediaChange?.(response.url);
      toast.success("Mídia enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao enviar mídia";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveMedia = async () => {
    if (!confirm("Deseja remover a mídia deste exercício?")) return;

    try {
      setIsDeleting(true);
      await deleteExerciseMedia(exerciseId);

      setMediaUrl(null);
      onMediaChange?.(null);
      toast.success("Mídia removida com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover mídia:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao remover mídia";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      {mediaUrl ? (
        <div className="space-y-2">
          <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden border">
            <img
              src={mediaUrl}
              alt="Preview do exercício"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Erro ao carregar imagem");
                e.currentTarget.src = "";
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveMedia}
            disabled={disabled || isDeleting}
            className="w-full"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Remover Mídia
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Adicionar Imagem/GIF
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Formatos aceitos: JPG, PNG, WEBP, GIF • Máx: 5MB
      </p>
    </div>
  );
}
