import React, { useState } from "react";
import GenericPersonSvg from "@/assets/generic-person.svg";
import Verified from "@/assets/verified.svg";
import { Star, MapPin, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AttendanceMode } from "@/types/professional";
import { addFavorite, removeFavorite } from "@/services/api/favorite";
import { motion } from "motion/react";

type ProfessionalCardProps = {
  subtitle: string;
  name: string;
  description: string;
  id: string;
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-3 h-3 ${
              index < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">
          {rating.toFixed(1)} ({totalFeedbacks || 0})
        </span>
      </div>
    );
  };

  return (
    <div
      className="bg-neutral-dark-03 p-4 rounded-xl cursor-pointer hover:bg-neutral-dark-02 transition-colors relative"
      onClick={() => navigate(`/professional/${id}`)}
    >
      {/* Botão de Favorito */}
      <motion.button
        className="absolute top-3 right-3 p-2 rounded-full bg-neutral-dark-02 hover:bg-neutral-dark-01 transition-colors z-10"
        onClick={handleFavoriteClick}
        disabled={isTogglingFavorite}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Bookmark
          className={`w-5 h-5 transition-all ${
            isFavorite
              ? "fill-primary-light text-primary-light"
              : "text-gray-400"
          }`}
        />
      </motion.button>

      <div className="flex gap-3">
        <img src={GenericPersonSvg} alt="" className="w-12 h-12" />
        <div className="overflow-hidden text-ellipsis flex-1">
          <p className="text-sm font-semibold text-gray-400">{subtitle}</p>
          <div className="flex gap-1 items-center">
            <img src={Verified} alt="" className="w-4 h-4" />
            <p className="text-lg font-semibold">{name}</p>
          </div>
          
          {rating && rating > 0 && (
            <div className="mt-1">{renderStars(rating)}</div>
          )}
          
          <p className="text-xs text-gray-500 line-clamp-2 text-ellipsis mt-1">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {tags && tags.filter(Boolean).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-primary-light/20 text-primary-light px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            {attendanceMode !== null && attendanceMode !== undefined && (
              <span className="flex items-center gap-1">
                📍 {getAttendanceModeName(attendanceMode)}
              </span>
            )}
            {city && state && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {city}, {state}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
