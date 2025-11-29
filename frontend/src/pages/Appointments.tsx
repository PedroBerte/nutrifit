import {
  useGetCustomerAppointments,
  useUpdateAppointment,
} from "@/services/api/appointment";
import type { AppointmentType } from "@/types/appointment";
import { format, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Video,
  Loader2,
  CalendarX,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemo } from "react";

export function Appointments() {
  const { data: appointments, isLoading } = useGetCustomerAppointments();
  const updateAppointment = useUpdateAppointment();

  const categorizedAppointments = useMemo(() => {
    if (!appointments) return { pending: [], upcoming: [], past: [] };

    return {
      pending: appointments.filter((apt) => apt.status === "P"),
      upcoming: appointments
        .filter(
          (apt) => apt.status === "A" && isFuture(new Date(apt.scheduledAt))
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        ),
      past: appointments
        .filter(
          (apt) => apt.status === "A" && isPast(new Date(apt.scheduledAt))
        )
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        ),
    };
  }, [appointments]);

  const handleAccept = async (appointment: AppointmentType) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: { status: "A" },
      });
      toast.success("Consulta aceita com sucesso!");
    } catch (error) {
      toast.error("Erro ao aceitar consulta. Tente novamente.");
    }
  };

  const handleReject = async (appointment: AppointmentType) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: { status: "R" },
      });
      toast.success("Consulta recusada.");
    } catch (error) {
      toast.error("Erro ao recusar consulta. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-neutral-white-02">Carregando consultas...</p>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-neutral-dark-02 flex items-center justify-center">
          <CalendarX className="w-10 h-10 text-neutral-white-03" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-white-01">
          Nenhuma consulta
        </h2>
        <p className="text-neutral-white-02 max-w-md">
          Você não possui consultas. Quando seu personal trainer agendar uma
          consulta, ela aparecerá aqui.
        </p>
      </div>
    );
  }

  const renderAppointmentCard = (
    appointment: AppointmentType,
    showActions = false
  ) => (
    <div
      key={appointment.id}
      className="bg-neutral-dark-03 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-dark-01">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {appointment.customerProfessionalBond?.professional?.imageUrl ? (
              <img
                src={appointment.customerProfessionalBond.professional.imageUrl}
                alt={appointment.customerProfessionalBond.professional.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-neutral-white-01 font-semibold">
                  {appointment.customerProfessionalBond?.professional?.name?.charAt(
                    0
                  ) || "P"}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-md font-semibold text-neutral-white-01 truncate">
                {appointment.customerProfessionalBond?.professional?.name ||
                  "Personal Trainer"}
              </h3>
              <p className="text-xs text-neutral-white-03 truncate">
                {appointment.customerProfessionalBond?.professional?.email}
              </p>
            </div>
          </div>
          {appointment.status === "P" && (
            <div className="px-3 py-1 rounded-full border border-yellow-500/50 text-yellow-500 text-xs font-medium whitespace-nowrap flex-shrink-0">
              Pendente
            </div>
          )}
          {appointment.status === "A" && (
            <div className="px-3 py-1 rounded-full border border-green-500/50 text-green-500 text-xs font-medium whitespace-nowrap flex-shrink-0">
              Confirmada
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-neutral-white-02">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">
              {format(
                new Date(appointment.scheduledAt),
                "dd 'de' MMMM 'de' yyyy",
                { locale: ptBR }
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-white-02">
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">
              {format(new Date(appointment.scheduledAt), "HH:mm", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-neutral-white-02">
          {appointment.type === "PR" ? (
            <>
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium">Consulta Presencial</p>
                {appointment.address && (
                  <p className="text-neutral-white-03 mt-1 break-words">
                    {appointment.address.addressLine},{" "}
                    {appointment.address.number} - {appointment.address.city}
                    {appointment.address.state &&
                      `, ${appointment.address.state}`}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <Video className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Consulta Online</p>
                <p className="text-neutral-white-03 mt-1">
                  Link de acesso será enviado próximo ao horário
                </p>
              </div>
            </>
          )}
        </div>

        {showActions && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => handleAccept(appointment)}
              disabled={updateAppointment.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {updateAppointment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Aceitar"
              )}
            </Button>
            <Button
              onClick={() => handleReject(appointment)}
              disabled={updateAppointment.isPending}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
              {updateAppointment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Recusar"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-3 pb-20 max-w-4xl mx-auto">
      {/* Consultas Pendentes */}
      {categorizedAppointments.pending.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-white-01">
              Consultas Pendentes
            </h2>
            <p className="text-neutral-white-02">
              Você tem {categorizedAppointments.pending.length}{" "}
              {categorizedAppointments.pending.length === 1
                ? "consulta pendente"
                : "consultas pendentes"}
            </p>
          </div>
          <div className="space-y-4">
            {categorizedAppointments.pending.map((appointment) =>
              renderAppointmentCard(appointment, true)
            )}
          </div>
        </div>
      )}

      {/* Próximos Agendamentos */}
      {categorizedAppointments.upcoming.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-white-01">
              Próximos Agendamentos
            </h2>
            <p className="text-neutral-white-02">
              {categorizedAppointments.upcoming.length}{" "}
              {categorizedAppointments.upcoming.length === 1
                ? "consulta agendada"
                : "consultas agendadas"}
            </p>
          </div>
          <div className="space-y-4">
            {categorizedAppointments.upcoming.map((appointment) =>
              renderAppointmentCard(appointment, false)
            )}
          </div>
        </div>
      )}

      {/* Agendamentos Anteriores */}
      {categorizedAppointments.past.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-white-01">
              Agendamentos Anteriores
            </h2>
            <p className="text-neutral-white-02">
              {categorizedAppointments.past.length}{" "}
              {categorizedAppointments.past.length === 1
                ? "consulta realizada"
                : "consultas realizadas"}
            </p>
          </div>
          <div className="space-y-4">
            {categorizedAppointments.past.map((appointment) =>
              renderAppointmentCard(appointment, false)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
