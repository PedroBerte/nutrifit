import React from "react";
import GenericPersonSvg from "@/assets/generic-person.svg";
import Verified from "@/assets/verified.svg";
import { Star, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AttendanceMode } from "@/types/professional";

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
}: ProfessionalCardProps) {
  const navigate = useNavigate();

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
      className="bg-neutral-dark-03 p-4 rounded-xl cursor-pointer hover:bg-neutral-dark-02 transition-colors"
      onClick={() => navigate(`/professional/${id}`)}
    >
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
