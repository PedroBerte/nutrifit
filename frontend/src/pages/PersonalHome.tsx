import { BigButton } from "@/components/BigButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Check,
  Dumbbell,
  Users,
  Edit,
  Clock,
  ClockFading,
  MapPin,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useGetRoutinesNearExpiry } from "@/services/api/routine";
import { useGetProfessionalUpcomingAppointments } from "@/services/api/appointment";
import type { RoutineExpiryType } from "@/types/routine";
import type { AppointmentType } from "@/types/appointment";
import PersonalSemAtendimento from "@/assets/personal/PersonalSemAtendimento.png";
import PersonalSemTreinosPertoValidade from "@/assets/personal/PersonalSemTreinosPertoValidade.png";
import type { JSX } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UpdateExpiryDialog from "@/components/UpdateExpiryDialog";
import { AvatarImage } from "@/components/ui/avatar-image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PersonalHome() {
  const { user } = useAuth();
  const { data: expiringRoutines } = useGetRoutinesNearExpiry(15);
  const { data: upcomingAppointments } =
    useGetProfessionalUpcomingAppointments(3);
  const navigate = useNavigate();

  const [customerToUpdate, setCustomerToUpdate] = useState<{
    routineId: string;
    customerId: string;
    customerName: string;
    routineTitle: string;
    expiresAt: string;
  } | null>(null);

  const handleOpenDialog = (item: RoutineExpiryType, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomerToUpdate({
      routineId: item.routineId,
      customerId: item.customerId,
      customerName: item.customerName,
      routineTitle: item.routineTitle,
      expiresAt: item.expiresAt,
    });
  };

  const WorkoutToDueCard = (item: RoutineExpiryType): JSX.Element => {
    return (
      <div
        key={item.customerId}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/routines/${item.routineId}`);
        }}
        className="flex flex-row items-center w-full bg-neutral-dark-03 rounded-md p-3 gap-3"
      >
        <div className="flex flex-col flex-1 gap-2">
          <p className="font-bold">
            Em {item.daysUntilExpiry}{" "}
            {item.daysUntilExpiry === 1 ? "dia" : "dias"}
          </p>
          <div className="flex flex-row items-center gap-3 border border-border w-full rounded-md p-3">
            <>
              <AvatarImage
                imageUrl={item.customerImageUrl}
                name={item.customerName}
                id={item.customerId}
                size="md"
              />
              <div className="flex flex-col flex-1">
                <p className="font-semibold">{item.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {item.routineTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Ver rotina</p>
              </div>
            </>
            <Button onClick={(e) => handleOpenDialog(item, e)}>
              <ClockFading size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const AppointmentCard = (item: AppointmentType): JSX.Element => {
    const customer = item.customerProfessionalBond?.customer;

    return (
      <div
        key={item.id}
        onClick={() => navigate("/agenda")}
        className="flex flex-row items-center w-full bg-neutral-dark-03 rounded-md px-3 cursor-pointer hover:bg-neutral-dark-03/50 transition-colors"
      >
        <div className="flex flex-col flex-1 gap-2">
          <p className="font-bold">
            {formatDistanceToNow(new Date(item.scheduledAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
          <div className="flex flex-row items-center gap-3 border w-full rounded-md p-3">
            {customer && (
              <>
                <AvatarImage
                  imageUrl={customer.imageUrl}
                  name={customer.name}
                  id={customer.id}
                  size="md"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-semibold truncate">{customer.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {item.type === "PR" ? (
                      <>
                        <MapPin size={14} />
                        <span className="truncate">Presencial</span>
                      </>
                    ) : (
                      <>
                        <Video size={14} />
                        <span>Online</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.scheduledAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    item.status === "P"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : item.status === "A"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-gray-500/20 text-gray-500"
                  }`}
                >
                  {item.status === "P" ? "Pendente" : "Aceita"}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 py-2 flex-col gap-4">
      <p>Bem vindo(a), {user && user.name}.</p>
      <motion.div
        className="grid grid-cols-2 grid-rows-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        <BigButton
          title="Alunos"
          icon={<Users size={22} />}
          description="Seus alunos"
          onClick={() => {
            navigate("/students");
          }}
        />
        <BigButton
          title="Treinos"
          icon={<Dumbbell size={22} />}
          description="Seus planos de treinos"
          onClick={() => {
            navigate("/routines");
          }}
        />
        <BigButton
          title="Agenda"
          icon={<Calendar size={22} />}
          description="Sua agenda"
          onClick={() => {
            navigate("/agenda");
          }}
        />
        <BigButton
          title="Vínculos"
          icon={<Check size={22} />}
          description="Seus vínculos"
          onClick={() => {
            navigate("/bond");
          }}
        />
      </motion.div>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-2"
      >
        <p className="font-bold">Próximos Atendimentos</p>
        <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center gap-3 py-2">
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((item) => {
              return AppointmentCard(item);
            })
          ) : (
            <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center gap-2 py-3">
              <img
                src={PersonalSemAtendimento}
                alt="Nenhum atendimento agendado"
                className="w-30 object-contain"
              />
              <p className="text-muted-foreground font-medium text-sm">
                Nenhum atendimento agendado.
              </p>
            </div>
          )}
        </div>
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-2"
      >
        <p className="font-bold">Treinos próximos da validade</p>
        <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center gap-2">
          {expiringRoutines?.data && expiringRoutines.data.length > 0 ? (
            expiringRoutines.data.map((item) => {
              return WorkoutToDueCard(item);
            })
          ) : (
            <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center gap-2 py-2">
              <img
                src={PersonalSemTreinosPertoValidade}
                alt="Nenhum treino próximo da validade"
                className="w-30 object-contain"
              />
              <p className="text-muted-foreground font-medium text-sm">
                Nenhum treino próximo da validade.
              </p>
            </div>
          )}
          <div></div>
        </div>
      </motion.section>

      {/* Dialog para alterar data de vencimento */}
      <UpdateExpiryDialog
        open={!!customerToUpdate}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToUpdate(null);
          }
        }}
        routineId={customerToUpdate?.routineId || ""}
        customerId={customerToUpdate?.customerId || ""}
        customerName={customerToUpdate?.customerName || ""}
        routineTitle={customerToUpdate?.routineTitle || ""}
        currentExpiryDate={customerToUpdate?.expiresAt || ""}
      />
    </div>
  );
}
