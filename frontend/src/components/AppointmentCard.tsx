import { MapPin, Video, X, Clock } from "lucide-react";
import type { AppointmentType } from "@/types/appointment";
import { cn } from "@/lib/utils";
import { AvatarImage } from "@/components/ui/avatar-image";

interface AppointmentCardProps {
  appointment: AppointmentType;
  onCancel?: (appointmentId: string) => void;
  showCustomer?: boolean;
  className?: string;
}

export default function AppointmentCard({
  appointment,
  onCancel,
  showCustomer = false,
  className,
}: AppointmentCardProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "P":
        return "Pendente";
      case "A":
        return "Aceita";
      case "R":
        return "Rejeitada";
      case "C":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "P":
        return "bg-yellow-500/20 text-yellow-500";
      case "A":
        return "bg-green-500/20 text-green-500";
      case "R":
        return "bg-red-500/20 text-red-500";
      case "C":
        return "bg-gray-500/20 text-gray-500";
      default:
        return "bg-neutral-dark-02 text-neutral-white-02";
    }
  };

  const person = showCustomer
    ? appointment.customerProfessionalBond?.customer
    : appointment.customerProfessionalBond?.professional;

  return (
    <div
      className={cn("bg-neutral-dark-03 rounded-lg p-4 space-y-3", className)}
    >
      {/* Header com avatar e informações */}
      {person && (
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-dark-02">
          <AvatarImage
            imageUrl={person.imageUrl}
            name={person.name}
            email={person.email}
            id={person.id}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{person.name}</p>
            <p className="text-xs text-neutral-white-02 truncate">
              {person.email}
            </p>
          </div>
        </div>
      )}

      {/* Tipo e horário */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {appointment.type === "PR" ? (
            <MapPin size={20} className="text-primary flex-shrink-0" />
          ) : (
            <Video size={20} className="text-primary flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {appointment.type === "PR" ? "Presencial" : "Online"}
            </p>
            <div className="flex items-center gap-1 text-xs text-neutral-white-02">
              <Clock size={12} />
              <span>
                {new Date(appointment.scheduledAt).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
              appointment.status
            )}`}
          >
            {getStatusLabel(appointment.status)}
          </span>
          {appointment.status === "P" && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Endereço */}
      {appointment.type === "PR" && appointment.address && (
        <div className="text-xs text-neutral-white-02 pt-2 border-t border-neutral-dark-02 space-y-1">
          <p className="font-medium text-neutral-white-01">Endereço:</p>
          <p>
            {appointment.address.addressLine}, {appointment.address.number}
          </p>
          <p>
            {appointment.address.city} - {appointment.address.state}
          </p>
          <p>CEP {appointment.address.zipCode}</p>
        </div>
      )}
    </div>
  );
}
