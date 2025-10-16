import React from "react";
import { Button } from "./ui/button";
import { Camera } from "lucide-react";

type Props = {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  description?: string;
  initialImageUrl?: string; // URL inicial da imagem
};

export default function PhotoUploader({
  onFileSelect,
  disabled,
  description,
  initialImageUrl,
}: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(
    initialImageUrl || null
  );
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações no frontend
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Arquivo inválido. Por favor, envie uma imagem no formato JPG, JPEG, PNG ou WEBP."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Arquivo muito grande. A imagem deve ter no máximo 2MB.");
      return;
    }

    // Preview local imediato
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
    setSelectedFile(file);

    // Notificar componente pai
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <div className="w-30 h-30 rounded-full bg-neutral-dark-02 flex items-center justify-center mb-2 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="object-cover w-full h-full rounded-full"
          />
        ) : (
          <Camera size={60} color="white" />
        )}
      </div>
      {description ? (
        <p className="text-xs text-neutral-white-02">{description}</p>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-white-02">
            A imagem deve ter no máximo 2MB.
          </p>
          <p className="text-xs text-neutral-white-02">
            A imagem deve ser .jpg, .jpeg, .png ou .webp.
          </p>
        </div>
      )}

      <Button
        className="rounded-sm px-10 mt-4"
        onClick={handleUploadClick}
        type="button"
        variant="dark"
        disabled={disabled}
      >
        Selecionar Imagem
      </Button>
    </div>
  );
}
