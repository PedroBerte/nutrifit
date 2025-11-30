import { useState, useMemo } from "react";
import { useGetProfessionalAppointments } from "@/services/api/appointment";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, CalendarX, Calendar as CalendarIcon } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AppointmentCard from "@/components/AppointmentCard";
import { useUpdateAppointment } from "@/services/api/appointment";
import { toast } from "sonner";
import type { AppointmentType } from "@/types/appointment";
import { isSameDay, startOfDay, isPast, isFuture } from "date-fns";
import { cn } from "@/lib/utils";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function ProfessionalAgenda() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const { data: appointments, isLoading } = useGetProfessionalAppointments();
  const { mutate: updateAppointment } = useUpdateAppointment();

  // Agrupa appointments por data
  const appointmentsByDate = useMemo(() => {
    if (!appointments) return new Map<string, AppointmentType[]>();

    const map = new Map<string, AppointmentType[]>();
    appointments.forEach((apt) => {
      const dateKey = startOfDay(new Date(apt.scheduledAt)).toISOString();
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, apt]);
    });
    return map;
  }, [appointments]);

  // Appointments do dia selecionado
  const selectedDayAppointments = useMemo(() => {
    const dateKey = startOfDay(selectedDate).toISOString();
    return (appointmentsByDate.get(dateKey) || []).sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, [appointmentsByDate, selectedDate]);

  // Categoriza appointments para a aba de lista
  const categorizedAppointments = useMemo(() => {
    if (!appointments) return { upcoming: [], past: [] };

    const now = new Date();
    return {
      upcoming: appointments
        .filter(
          (apt) => isFuture(new Date(apt.scheduledAt)) && apt.status !== "C"
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        ),
      past: appointments
        .filter(
          (apt) => isPast(new Date(apt.scheduledAt)) && apt.status !== "C"
        )
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime()
        ),
    };
  }, [appointments]);

  // Verifica se uma data tem appointments
  const hasAppointments = (date: Date) => {
    const dateKey = startOfDay(date).toISOString();
    return appointmentsByDate.has(dateKey);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    updateAppointment(
      {
        id: appointmentId,
        data: { status: "C" },
      },
      {
        onSuccess: () => {
          toast.success("Consulta cancelada com sucesso!");
        },
        onError: () => {
          toast.error("Erro ao cancelar consulta. Tente novamente.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-neutral-white-02">Carregando agenda...</p>
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
          Você não possui consultas agendadas. Quando seus alunos aceitarem
          consultas, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3 p-4 pb-20 overflow-x-hidden">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-neutral-white-01"
      >
        Agenda
      </motion.h1>

      {/* Tabs */}
      <div className="grid w-full grid-cols-2 gap-2 bg-neutral-dark-03 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === "calendar"
              ? "bg-primary text-white"
              : "text-neutral-white-02 hover:text-neutral-white-01"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <CalendarIcon size={16} />
            <span>Calendário</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={cn(
            "py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === "list"
              ? "bg-primary text-white"
              : "text-neutral-white-02 hover:text-neutral-white-01"
          )}
        >
          Lista
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "calendar" ? (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Calendar */}
            <div className="bg-neutral-dark-03 rounded-lg p-4 custom-calendar overflow-hidden">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                locale="pt-BR"
                tileClassName={({ date }) =>
                  hasAppointments(date) ? "has-appointment" : ""
                }
                className="w-full border-none max-w-full"
              />
            </div>

            {/* Appointments do dia selecionado */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neutral-white-01">
                {selectedDayAppointments.length > 0
                  ? `${selectedDayAppointments.length} ${
                      selectedDayAppointments.length === 1
                        ? "consulta"
                        : "consultas"
                    } em ${selectedDate.toLocaleDateString("pt-BR")}`
                  : `Nenhuma consulta em ${selectedDate.toLocaleDateString(
                      "pt-BR"
                    )}`}
              </h3>

              {selectedDayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayAppointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        onCancel={handleCancelAppointment}
                        showCustomer={true}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-dark-03 rounded-lg p-8 text-center">
                  <CalendarX className="w-12 h-12 mx-auto mb-3 text-neutral-white-03" />
                  <p className="text-neutral-white-02">
                    Nenhuma consulta neste dia
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Próximas Consultas */}
            {categorizedAppointments.upcoming.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold text-neutral-white-01">
                  Próximas Consultas ({categorizedAppointments.upcoming.length})
                </h3>
                <div className="space-y-3">
                  {categorizedAppointments.upcoming.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        onCancel={handleCancelAppointment}
                        showCustomer={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Consultas Anteriores */}
            {categorizedAppointments.past.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold text-neutral-white-01">
                  Consultas Anteriores ({categorizedAppointments.past.length})
                </h3>
                <div className="space-y-3">
                  {categorizedAppointments.past.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        showCustomer={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {categorizedAppointments.upcoming.length === 0 &&
              categorizedAppointments.past.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <CalendarX className="w-16 h-16 text-neutral-white-03 mb-4" />
                  <p className="text-neutral-white-02">
                    Nenhuma consulta encontrada
                  </p>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-calendar {
          --calendar-bg: transparent;
          --calendar-text: #e5e5e5;
          --calendar-nav-hover: #2d2d2d;
          --calendar-tile-hover: #3d3d3d;
          --calendar-today: #ff6b35;
          --calendar-selected: #ff6b35;
        }

        .custom-calendar .react-calendar {
          background: var(--calendar-bg);
          border: none;
          font-family: inherit;
          color: var(--calendar-text);
          width: 100%;
          max-width: 100%;
        }

        .custom-calendar .react-calendar__navigation button {
          color: var(--calendar-text);
          min-width: 44px;
          background: none;
          font-size: 1rem;
          font-weight: 600;
        }

        .custom-calendar .react-calendar__navigation button:enabled:hover,
        .custom-calendar .react-calendar__navigation button:enabled:focus {
          background-color: var(--calendar-nav-hover);
          border-radius: 0.375rem;
        }

        .custom-calendar .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
          color: #999;
        }

        .custom-calendar .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
        }

        .custom-calendar .react-calendar__tile {
          padding: 0.75rem;
          background: none;
          text-align: center;
          line-height: 1.5;
          color: var(--calendar-text);
          border-radius: 0.375rem;
          transition: all 0.2s;
          font-size: 0.875rem;
          max-width: 100%;
        }

        .custom-calendar .react-calendar__tile:enabled:hover,
        .custom-calendar .react-calendar__tile:enabled:focus {
          background-color: var(--calendar-tile-hover);
        }

        .custom-calendar .react-calendar__tile--now {
          background-color: rgba(255, 107, 53, 0.2);
          color: var(--calendar-today);
          font-weight: 600;
        }

        .custom-calendar .react-calendar__tile--active {
          background: var(--calendar-selected);
          color: white;
          font-weight: 600;
        }

        .custom-calendar .react-calendar__tile--active:enabled:hover,
        .custom-calendar .react-calendar__tile--active:enabled:focus {
          background: rgba(255, 107, 53, 0.9);
        }

        .custom-calendar .react-calendar__tile.has-appointment {
          position: relative;
        }

        .custom-calendar .react-calendar__tile.has-appointment::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #ff6b35;
        }

        .custom-calendar .react-calendar__tile--active.has-appointment::after {
          background-color: white;
        }

        .custom-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #666;
        }
      `}</style>
    </div>
  );
}
