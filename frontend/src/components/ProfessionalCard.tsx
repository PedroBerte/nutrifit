import React, { useState, useEffect } from "react";
import Verified from "@/assets/verified.svg";
import { MapPin, Bookmark, Award, Monitor, Video, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AttendanceMode } from "@/types/professional";
import { addFavorite, removeFavorite } from "@/services/api/favorite";
import { motion } from "motion/react";
import { AvatarImage } from "@/components/ui/avatar-image";

type ProfessionalCardProps = {
  subtitle: string;
  name: string;
  description: string;
  id: string;
  email?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  totalFeedbacks?: number | null;
  tags?: (string | null | undefined)[];
  attendanceMode?: AttendanceMode | null;
  city?: string | null;
  state?: string | null;
  isFavorite?: boolean | null;
  onFavoriteChange?: () => void;
  isMyProfessional?: boolean;
};

export default function ProfessionalCard({
  subtitle,
  name,
  description,
  id,
  email,
  imageUrl,
  rating,
  totalFeedbacks,
  tags,
  attendanceMode,
  city,
  state,
  isFavorite: initialIsFavorite,
  onFavoriteChange,
  isMyProfessional = false,
}: ProfessionalCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Sincroniza o estado local quando a prop initialIsFavorite mudar
  useEffect(() => {
    setIsFavorite(initialIsFavorite || false);
  }, [initialIsFavorite]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegar para o perfil

    if (isTogglingFavorite) return;

    setIsTogglingFavorite(true);

    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }

      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const getAttendanceModeName = (mode?: AttendanceMode | null) => {
    if (mode === AttendanceMode.Presencial) return "Presencial";
    if (mode === AttendanceMode.Online) return "Online";
    if (mode === AttendanceMode.Hibrido) return "Híbrido";
    return null;
  };

  const getAttendanceModeIcon = (mode?: AttendanceMode | null) => {
    if (mode === AttendanceMode.Presencial) return <Users className="w-3 h-3" />;
    if (mode === AttendanceMode.Online) return <Monitor className="w-3 h-3" />;
    if (mode === AttendanceMode.Hibrido) return <Video className="w-3 h-3" />;
    return null;
  };

  const getRatingBadge = (rating: number, totalFeedbacks?: number | null) => {
    // Não mostrar badge se não tiver avaliações suficientes
    if (!totalFeedbacks || totalFeedbacks < 3) return null;

    if (rating >= 4.5) {
      return {
        text: "Nota máxima",
        className: "bg-green-500/20 text-green-400 border border-green-500/30"
      };
    }

    if (rating >= 4.0) {
      return {
        text: "Muito bem avaliado",
        className: "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      };
    }

    if (rating >= 3.5) {
      return {
        text: "Bem avaliado",
        className: "bg-purple-500/20 text-purple-400 border border-purple-500/30"
      };
    }

    // Não mostrar nada para avaliações ruins (< 3.5)
    return null;
  };

  return (
    <div
      className={`bg-neutral-dark-03 p-3 xs:p-4 rounded-xl cursor-pointer hover:bg-neutral-dark-03 transition-colors relative ${
        isMyProfessional ? "ring-2 ring-primary/50" : ""
      }`}
      onClick={() => navigate(`/professional/${id}`)}
    >
      {/* Badge "Seu Personal" */}
      {isMyProfessional && (
        <div className="absolute top-2 xs:top-3 left-2 xs:left-3 z-10 flex items-center gap-1 xs:gap-1.5 bg-primary/20 text-primary px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full text-[10px] xs:text-xs font-semibold border border-primary/30">
          <CheckCircle2 className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
          <span className="hidden xs:inline">Seu Personal</span>
          <span className="xs:hidden">Seu</span>
        </div>
      )}

      {/* Botão de Favorito */}
      <motion.button
        className="absolute z-10 top-2 xs:top-3 right-2 xs:right-3"
        onClick={handleFavoriteClick}
        disabled={isTogglingFavorite}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Bookmark
          className={`w-5 h-5 transition-all ${isFavorite
            ? "fill-primary text-primary"
            : "text-gray-400 hover:text-gray-300"
            }`}
        />
      </motion.button>

      <div className={`flex gap-2 xs:gap-3 ${isMyProfessional ? "mt-6 xs:mt-8" : ""}`}>
        <div className="flex-1 min-w-0 pr-5 xs:pr-6">
          <div className="flex gap-2 xs:gap-3">
            <AvatarImage
              imageUrl={imageUrl}
              name={name}
              email={email}
              id={id}
              size="md"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-400 xs:text-sm">{subtitle}</p>

              <div className="flex items-center min-w-0 gap-1">
                <img src={Verified} alt="" className="flex-shrink-0 w-3 h-3 xs:w-4 xs:h-4" />
                <p className="text-base font-semibold truncate xs:text-lg">{name}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 mt-2">
            {tags && tags.filter(Boolean).map((tag, index) => (
              <span
                key={index}
                className="text-[10px] xs:text-xs bg-primary/20 text-primary px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Localização, Modalidade e Rating Badge */}
          <div className="flex flex-wrap items-center gap-2 xs:gap-3 mt-2 text-[10px] xs:text-xs text-gray-400">
            {rating && rating > 0 && (() => {
              const badge = getRatingBadge(rating, totalFeedbacks);
              if (!badge) return null;

              return (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span className="hidden xs:inline">{badge.text}</span>
                  <span className="xs:hidden">⭐</span>
                </span>
              );
            })()}
            
            {attendanceMode !== null && attendanceMode !== undefined && (
              <span className="flex items-center gap-1">
                {getAttendanceModeIcon(attendanceMode)}
                <span className="hidden xs:inline">{getAttendanceModeName(attendanceMode)}</span>
              </span>
            )}
            {city && state && (
              <span className="flex items-center min-w-0 gap-1">
                <MapPin className="flex-shrink-0 w-3 h-3" />
                <span className="truncate">{city}, {state}</span>
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] xs:text-xs text-gray-500 line-clamp-2 xs:line-clamp-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
