import React, { useState } from "react";
import Verified from "@/assets/verified.svg";
import { MapPin, Bookmark, Award, Monitor, Video, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AttendanceMode } from "@/types/professional";
import { addFavorite, removeFavorite } from "@/services/api/favorite";
import { motion } from "motion/react";
import { getUserAvatarUrl } from "@/lib/avatar";

type ProfessionalCardProps = {
  subtitle: string;
  name: string;
  description: string;
  id: string;
  email?: string | null;
  rating?: number | null;
  totalFeedbacks?: number | null;
  tags?: (string | null | undefined)[];
  attendanceMode?: AttendanceMode | null;
  city?: string | null;
  state?: string | null;
  isFavorite?: boolean | null;
  onFavoriteChange?: () => void;
};

export default function ProfessionalCard({
  subtitle,
  name,
  description,
  id,
  email,
  rating,
  totalFeedbacks,
  tags,
  attendanceMode,
  city,
  state,
  isFavorite: initialIsFavorite,
  onFavoriteChange,
}: ProfessionalCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

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
      className="bg-neutral-dark-03 p-4 rounded-xl cursor-pointer hover:bg-neutral-dark-02 transition-colors relative"
      onClick={() => navigate(`/professional/${id}`)}
    >
      {/* Botão de Favorito */}
      <motion.button
        className="absolute top-3 right-3 z-10"
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

      <div className="flex gap-3 pr-8">
        <div className="flex-1 min-w-0">
          <div className="flex gap-3">
            <img 
              src={getUserAvatarUrl({ email, name, id })} 
              alt={name || "Avatar"} 
              className="w-12 h-12 flex-shrink-0 rounded-full object-cover bg-neutral-dark-02" 
            />
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-400">{subtitle}</p>

              <div className="flex gap-1 items-center">
                <img src={Verified} alt="" className="w-4 h-4" />
                <p className="text-lg font-semibold truncate">{name}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {tags && tags.filter(Boolean).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Localização, Modalidade e Rating Badge */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
            {rating && rating > 0 && (() => {
              const badge = getRatingBadge(rating, totalFeedbacks);
              if (!badge) return null;

              return (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {badge.text}
                </span>
              );
            })()}
            
            {attendanceMode !== null && attendanceMode !== undefined && (
              <span className="flex items-center gap-1">
                {getAttendanceModeIcon(attendanceMode)}
                {getAttendanceModeName(attendanceMode)}
              </span>
            )}
            {city && state && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {city}, {state}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 line-clamp-4 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
