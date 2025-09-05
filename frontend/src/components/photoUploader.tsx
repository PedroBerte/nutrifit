import React from "react";
import { Button } from "./ui/button";
import { Camera } from "lucide-react";

type Props = {
  onUpload: (file: File) => void;
  disabled?: boolean;
  description?: string;
};

export default function PhotoUploader({
  onUpload,
  disabled,
  description,
}: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUrl(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
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
      >
        Selecionar Imagem
      </Button>
    </div>
  );
}
