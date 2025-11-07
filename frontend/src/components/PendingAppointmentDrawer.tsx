import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUpdateAppointment } from "@/services/api/appointment";
import type { AppointmentType } from "@/types/appointment";
import { Calendar, MapPin, Video, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface PendingAppointmentDrawerProps {
  appointment: AppointmentType;
  children: React.ReactNode;
}

export default function PendingAppointmentDrawer({
  appointment,
  children,
}: PendingAppointmentDrawerProps) {
  const [open, setOpen] = useState(false);
  const updateAppointment = useUpdateAppointment();

  const handleAccept = async () => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: { status: "A" },
      });
      toast.success("Agendamento aceito com sucesso!");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao aceitar agendamento");
      console.error(error);
    }
  };

  const handleReject = async () => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: { status: "R" },
      });
      toast.success("Agendamento recusado");
      setOpen(false);
    } catch (error) {
      toast.error("Erro ao recusar agendamento");
      console.error(error);
    }
  };

  const formattedDate = format(
    new Date(appointment.scheduledAt),
    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
    { locale: ptBR }
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Novo Agendamento</DrawerTitle>
          <DrawerDescription>
            Seu personal enviou uma proposta de agendamento
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-2 space-y-4">
          {/* Tipo de consulta */}
          <div className="flex items-start gap-3">
            {appointment.type === "PR" ? (
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
            ) : (
              <Video className="w-5 h-5 text-primary mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">Tipo de Atendimento</p>
              <p className="text-sm text-muted-foreground">
                {appointment.type === "PR" ? "Presencial" : "Online"}
              </p>
            </div>
          </div>

          {/* Data e hora */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Data e Hora</p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>

          {/* Endereço (se presencial) */}
          {appointment.type === "PR" && appointment.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Endereço</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.address.addressLine}
                  {appointment.address.number &&
                    `, ${appointment.address.number}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.address.city}
                  {appointment.address.state &&
                    ` - ${appointment.address.state}`}
                </p>
                {appointment.address.zipCode && (
                  <p className="text-sm text-muted-foreground">
                    CEP: {appointment.address.zipCode}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Aviso */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Ao aceitar, você confirma disponibilidade para este horário. Caso
              não possa comparecer, cancele com antecedência.
            </p>
          </div>
        </div>

        <DrawerFooter>
          <div className="flex gap-2 w-full">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              disabled={updateAppointment.isPending}
            >
              Recusar
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={updateAppointment.isPending}
            >
              {updateAppointment.isPending ? "Processando..." : "Aceitar"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
