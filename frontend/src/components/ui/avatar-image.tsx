import { getUserAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AvatarImageProps {
  imageUrl?: string | null;
  name?: string | null;
  email?: string | null;
  id?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-xl",
};

export function AvatarImage({
  imageUrl,
  name,
  email,
  id,
  size = "md",
  className,
  showBadge = false,
  badgeContent,
}: AvatarImageProps) {
  const [imgKey, setImgKey] = useState(0);
  const avatarUrl = getUserAvatarUrl({ imageUrl, name, email, id });

  // Force re-render quando imageUrl mudar
  useEffect(() => {
    setImgKey(prev => prev + 1);
  }, [imageUrl]);

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-full overflow-hidden bg-neutral-dark-02 flex-shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <img
          key={imgKey}
          src={avatarUrl}
          alt={name || email || "Avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback para avatar gerado se a imagem falhar
            e.currentTarget.src = getUserAvatarUrl({ name, email, id });
          }}
        />
      </div>
      {showBadge && badgeContent && (
        <div className="absolute -top-1 -right-1">
          {badgeContent}
        </div>
      )}
    </div>
  );
}
